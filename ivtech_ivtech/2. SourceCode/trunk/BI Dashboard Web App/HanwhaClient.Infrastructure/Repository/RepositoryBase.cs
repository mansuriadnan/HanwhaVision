using HanwhaClient.Infrastructure.Connection;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.DbEntities;
using MongoDB.Bson;
using MongoDB.Driver;

namespace HanwhaClient.Infrastructure.Repository
{
    public abstract class RepositoryBase<T> : IRepositoryBase<T>, IDisposable where T : BaseModel
    {
        protected readonly IMongoCollection<T> dbEntity;
        protected readonly IMongoCollection<AuditLog> dbAuditEntity;
        private IChangeStreamCursor<ChangeStreamDocument<T>> cursor;

        public RepositoryBase(MongoDbConnectionService mongoDbConnectionService, string collectionName, bool ChangeStreamLog = false)
        {
            dbEntity = mongoDbConnectionService.Database?.GetCollection<T>(collectionName);
            if (ChangeStreamLog)
            {
                dbAuditEntity = mongoDbConnectionService.Database?.GetCollection<AuditLog>("auditLog");
                StartChangeStreamAsync();
            }
        }

        public async Task<IEnumerable<T>> GetAllAsync(ProjectionDefinition<T> projection = null, bool includeDeleted = false)
        {
            FilterDefinition<T> filter;
            if (includeDeleted)
            {
                filter = Builders<T>.Filter.Empty;
            }
            else
            {
                filter = Builders<T>.Filter.Ne(x => x.IsDeleted, true);
            }
            var query = dbEntity.Find(filter);
            if (projection != null)
                query = query.Project<T>(projection);
            return query.ToList();
        }

        public async Task<T> GetAsync(string id)
        {
            var filter = Builders<T>.Filter.And(
              Builders<T>.Filter.Eq(x => x.Id, id),
             Builders<T>.Filter.Or(
             Builders<T>.Filter.Eq(x => x.IsDeleted, false),
             Builders<T>.Filter.Eq(x => x.IsDeleted, (bool?)null)));

            return await dbEntity.Find(filter).FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<T>> GetManyAsync(IEnumerable<string> ids, ProjectionDefinition<T> projection = null)
        {
            var filter = Builders<T>.Filter.And(
                Builders<T>.Filter.In(x => x.Id, ids),
                Builders<T>.Filter.Eq(x => x.IsDeleted, false));
            var query = dbEntity.Find(filter);
            if (projection != null)
                query = query.Project<T>(projection);
            return await query.ToListAsync();
        }

        public async Task<string> InsertAsync(T entity)
        {
            await dbEntity.InsertOneAsync(entity);
            return entity.Id;
        }

        public async Task<bool> InsertManyAsync(IEnumerable<T> entities)
        {
            await dbEntity.InsertManyAsync(entities);
            return true;
        }

        public async Task<bool> UpdateAsync(T entity)
        {
            var filter = Builders<T>.Filter.Eq(x => x.Id, entity.Id);
            var result = await dbEntity.ReplaceOneAsync(filter, entity);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> UpdateFieldsAsync(string id, UpdateDefinition<T> updateDefinition, UpdateOptions updateOptions = null)
        {
            var filter = Builders<T>.Filter.Eq(x => x.Id, id);
            var result = await dbEntity.UpdateOneAsync(filter, updateDefinition, updateOptions);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> UpdateManyFieldsAsync(FilterDefinition<T> filter, UpdateDefinition<T> updateDefinition)
        {
            var result = await dbEntity.UpdateManyAsync(filter, updateDefinition);
            return result.ModifiedCount > 0;
        }

        /// <summary>
        /// Soft deletes a document by setting its `IsDeleted` flag to true.
        /// </summary>
        public async Task<bool> SoftDeleteAsync(string id, string userId)
        {
            if (string.IsNullOrEmpty(id))
                return false;

            var filter = Builders<T>.Filter.Eq(x => x.Id, id);

            var update = Builders<T>.Update
                .Set(x => x.UpdatedOn, DateTime.UtcNow)
                .Set(x => x.UpdatedBy, userId)
                .Set(x => x.IsDeleted, true)
                .Set(x => x.DeletedOn, DateTime.UtcNow);

            var result = await dbEntity.UpdateOneAsync(filter, update);
            return result.ModifiedCount > 0;
        }

        /// <summary>
        /// Soft deletes multiple documents by setting their `IsDeleted` flag to true.
        /// </summary>
        public async Task<long> SoftDeleteManyAsync(IEnumerable<string> ids, string userId)
        {
            if (ids == null || !ids.Any())
                return 0;

            var filter = Builders<T>.Filter.In(x => x.Id, ids);

            var update = Builders<T>.Update
                .Set(x => x.UpdatedOn, DateTime.UtcNow)
                .Set(x => x.UpdatedBy, userId)
                .Set(x => x.IsDeleted, true)
                .Set(x => x.DeletedOn, DateTime.UtcNow);

            var result = await dbEntity.UpdateManyAsync(filter, update);
            return result.ModifiedCount;
        }

        public async Task StartChangeStreamAsync()
        {
            var pipeline = new EmptyPipelineDefinition<ChangeStreamDocument<T>>()
                .Match(change => change.OperationType == ChangeStreamOperationType.Insert ||
                                 change.OperationType == ChangeStreamOperationType.Update ||
                                 change.OperationType == ChangeStreamOperationType.Delete);

            if (cursor == null)
            {
                cursor = dbEntity.Watch(pipeline);

                while (await cursor.MoveNextAsync())
                {
                    foreach (var change in cursor.Current)
                    {
                        var auditLogData = new AuditLog
                        {
                            OperationType = change.OperationType.ToString(),
                            CollectionName = change.CollectionNamespace.CollectionName,
                            DocumentKey = change.DocumentKey,
                            FullDocument = change.FullDocument.ToBsonDocument<T>(),
                            UpdateDescription = change.UpdateDescription?.UpdatedFields,
                            RemovedFields = change.UpdateDescription?.RemovedFields,
                            CreatedOn = System.DateTime.UtcNow

                        };
                        await dbAuditEntity.InsertOneAsync(auditLogData);
                    }
                }
            }
            cursor.Dispose();
        }

        public void Dispose()
        {
            if (cursor != null)
                cursor.Dispose();
        }
    }
}
