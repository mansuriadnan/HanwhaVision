using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace HanwhaClient.Model.DbEntities
{
    public class EmailTemplates : BaseModel
    {
        [BsonElement("emailTemplateName"), BsonRepresentation(BsonType.String)]
        public string EmailTemplateName { get; set; }

        [BsonElement("emailTemplateTitle"), BsonRepresentation(BsonType.String)]
        public string EmailTemplateTitle { get; set; }

        [BsonElement("emailTemplateDescription"), BsonRepresentation(BsonType.String)]
        public string? EmailTemplateDescription { get; set; }

        [BsonElement("emailTemplateHtml"), BsonRepresentation(BsonType.String)]
        public string EmailTemplateHtml { get; set; }
    }
}
