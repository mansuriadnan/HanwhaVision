using HanwhaAdminApi.Infrastructure.Connection;
using HanwhaAdminApi.Infrastructure.Interfaces;
using HanwhaAdminApi.Model.DbEntities;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HanwhaAdminApi.Infrastructure.Repository
{
    public abstract class RepositoryBase<T> : IRepositoryBase<T> where T : BaseModel
    {
        protected readonly IMongoCollection<T> dbEntity;

        public RepositoryBase(MongoDbConnectionService mongoDbConnectionService, string collectionName)
        {
            dbEntity = mongoDbConnectionService.Database?.GetCollection<T>(collectionName)
                ?? throw new ArgumentNullException(nameof(collectionName), "Collection cannot be null.");
        }

        /// <summary>
        /// Retrieves all documents from the collection.
        /// </summary>
        /// 
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

            // Add order by descending on CreatedOn column
            query = query.SortByDescending(x => x.CreatedOn);

            return query.ToList();
        }


        //public async Task<IEnumerable<T>> GetAllAsync()
        //{
        //    return await dbEntity.Find(FilterDefinition<T>.Empty).ToListAsync();
        //}

        /// <summary>
        /// Retrieves a single document by its ID.
        /// </summary>
        public async Task<T> GetAsync(string id)
        {
            var filter = Builders<T>.Filter.And(
                         Builders<T>.Filter.Eq(x => x.Id, id),
                         Builders<T>.Filter.Or(
                         Builders<T>.Filter.Eq(x => x.IsDeleted, false),
                         Builders<T>.Filter.Eq(x => x.IsDeleted, (bool?)null)));

            return await dbEntity.Find(filter).FirstOrDefaultAsync();
        }

        /// <summary>
        /// Retrieves multiple documents by their IDs.
        /// </summary>
        public async Task<IEnumerable<T>> GetManyAsync(IEnumerable<string> ids, ProjectionDefinition<T> projection = null)
        {
            try
            {
                var filter = Builders<T>.Filter.In(x => x.Id, ids);
                var query = dbEntity.Find(filter);
                if (projection != null)
                    query = query.Project<T>(projection);
                return await query.ToListAsync();
            }
            catch (Exception ex)
            {
                var msg = ex.Message;
                throw;
            }
        }

        /// <summary>
        /// Inserts a single document into the collection.
        /// </summary>
        public async Task<string> InsertAsync(T entity)
        {
            await dbEntity.InsertOneAsync(entity);
            return entity.Id;
        }

        /// <summary>
        /// Inserts multiple documents into the collection.
        /// </summary>
        public async Task<bool> InsertManyAsync(IEnumerable<T> entities)
        {
            await dbEntity.InsertManyAsync(entities);
            return true;
        }

        /// <summary>
        /// Updates a document entirely based on the entity.
        /// </summary>
        public async Task<bool> UpdateAsync(T entity)
        {
            var filter = Builders<T>.Filter.Eq(x => x.Id, entity.Id);
            var result = await dbEntity.ReplaceOneAsync(filter, entity);
            return result.ModifiedCount > 0;
        }

        /// <summary>
        /// Partially updates fields in a document by its ID.
        /// </summary>
        public async Task<bool> UpdateFieldsAsync(string id, UpdateDefinition<T> updateDefinition)
        {
            var filter = Builders<T>.Filter.Eq(x => x.Id, id);
            var result = await dbEntity.UpdateOneAsync(filter, updateDefinition);
            return result.ModifiedCount > 0;
        }

        /// <summary>
        /// Deletes a document by its ID.
        /// </summary>
        public async Task<bool> DeleteAsync(string id)
        {
            var filter = Builders<T>.Filter.Eq(x => x.Id, id);
            var result = await dbEntity.DeleteOneAsync(filter);
            return result.DeletedCount > 0;
        }

        /// <summary>
        /// Deletes multiple documents by their IDs.
        /// </summary>
        public async Task<long> DeleteManyAsync(IEnumerable<string> ids)
        {
            if (ids == null || !ids.Any())
                return 0;

            var filter = Builders<T>.Filter.In(x => x.Id, ids);
            var result = await dbEntity.DeleteManyAsync(filter);
            return result.DeletedCount;
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
    }
}
