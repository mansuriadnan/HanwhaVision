using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace HanwhaClient.Model.DbEntities
{
    public class Customer:BaseModel
    {
        [BsonElement("customerName"), BsonRepresentation(BsonType.String)]
        public string? CustomerName { get; set; }
        [BsonElement("email"), BsonRepresentation(BsonType.String)]
        public string? Email { get; set; }
    }
}
