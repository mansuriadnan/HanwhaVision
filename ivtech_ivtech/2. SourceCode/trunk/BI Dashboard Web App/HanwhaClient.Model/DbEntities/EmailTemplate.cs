using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Model.DbEntities
{
    public class EmailTemplate : BaseModel
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
