using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace HanwhaClient.Model.DbEntities
{
    public class AuditLog : BaseModel
    {
        [BsonElement("operationType"), BsonRepresentation(BsonType.String)]
        public string? OperationType { get; set; }

        [BsonElement("collectionName"), BsonRepresentation(BsonType.String)]
        public string? CollectionName { get; set; }

        [BsonElement("documentKey")]
        public BsonDocument? DocumentKey { get; set; }

        [BsonElement("fullDocument")]
        public BsonDocument? FullDocument { get; set; }

        [BsonElement("updateDescription")]
        public BsonDocument? UpdateDescription { get; set; }

        [BsonElement("removedFields")]
        public string[] RemovedFields { get; set; }
    }

    public class AuditLogRequest
    {
        public string? CollectioName { get; set; }
        public int? PageSize { get; set; } = 10;
        public int? PageNo { get; set; } = 1;
        public string? OperationType { get; set; }
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

    }

    public class AuditLogResponse
    {
        public long TotalCount { get; set; }
        public List<AuditLogDetail> AuditLogDetails { get; set; }
    }
    

    public class AuditLogDetail
    {
        public string Id { get; set; }
        public string? OperationType { get; set; }
        public string? CollectionName { get; set; }
        public string? DocumentKey { get; set; }
        public string? FullDocument { get; set; }
        public string? UpdateDescription { get; set; }
        public string? OperationData { get; set; }
        public string[] RemovedFields { get; set; }

    }
    
}
