using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaAdminApi.Model.DbEntities
{
    public class BaseModel
    {
        [BsonId]
        [BsonElement("_id"), BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        // Need to add > CreateDate, CreatedBy, LastUpdatedDate, LastUpdatedBy 
        [BsonElement("createdOn"), BsonRepresentation(BsonType.DateTime)]
        public DateTime? CreatedOn { get; set; }

        [BsonElement("createdBy"), BsonRepresentation(BsonType.ObjectId)]
        public string? CreatedBy { get; set; }

        [BsonElement("updatedOn"), BsonRepresentation(BsonType.DateTime)]
        public DateTime? UpdatedOn { get; set; }

        [BsonElement("updatedBy"), BsonRepresentation(BsonType.ObjectId)]
        public string? UpdatedBy { get; set; }

        [BsonElement("isDeleted"), BsonRepresentation(BsonType.Boolean)]
        public bool IsDeleted { get; set; } = false;

        [BsonElement("deletedOn"), BsonRepresentation(BsonType.DateTime)]
        public DateTime? DeletedOn { get; set; }
    }
}
