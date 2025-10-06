using HanwhaClient.Infrastructure.Connection;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.DbEntities;
using MongoDB.Bson;
using MongoDB.Driver;

namespace HanwhaClient.Infrastructure.Repository
{
    public class AuditLogRepository : RepositoryBase<AuditLog>, IAuditLogRepository
    {
        public AuditLogRepository(MongoDbConnectionService mongoDbConnectionService) : base(mongoDbConnectionService, AppDBConstants.AuditLog)
        {
        }

        public async Task<List<string>> GetAuditLogCollectionName()
        {
            var filter = Builders<AuditLog>.Filter.Eq(x => x.IsDeleted, false);
            var data = await dbEntity.Distinct(x => x.CollectionName, filter).ToListAsync();
            return data;

        }

        public async Task<(List<AuditLog> auditLog, long totalCount)> GetAuditLogDetailByFilter(AuditLogRequest auditLogRequest)
        {
            var filter = Builders<AuditLog>.Filter.Where(x => x.CollectionName == auditLogRequest.CollectioName &&
            (auditLogRequest.OperationType != null ? x.OperationType == auditLogRequest.OperationType :true) &&
            (auditLogRequest.Id != null ? x.DocumentKey["_id"] == new ObjectId(auditLogRequest.Id) : true) && x.IsDeleted == false);
            var data = await dbEntity.Find(filter).Skip((auditLogRequest.PageNo - 1) * auditLogRequest.PageSize).Limit(auditLogRequest.PageSize).ToListAsync();
            AuditLogResponse auditLogResponse = new AuditLogResponse();
            long totalCount = await dbEntity.CountDocumentsAsync(filter);
            auditLogResponse.AuditLogDetails = data.Select(x => new AuditLogDetail
            {
                Id = x.Id,
                CollectionName = x.CollectionName,
                OperationType = x.OperationType,
                RemovedFields = x.RemovedFields,
                DocumentKey = x.DocumentKey != null ? x.DocumentKey["_id"].ToString() : "",
                OperationData = x.FullDocument != null ? x.FullDocument.ToJson() : x.UpdateDescription?.ToJson(),
            }
            ).ToList();
            return (data, totalCount);
        }
        
        
        
    }
}
