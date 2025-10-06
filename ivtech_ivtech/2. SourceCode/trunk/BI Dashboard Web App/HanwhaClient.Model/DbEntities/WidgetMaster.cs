using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace HanwhaClient.Model.DbEntities
{
    public class WidgetMaster : BaseModel
    {
        [BsonElement("categoryName"), BsonRepresentation(BsonType.String)]
        public string CategoryName { get; set; }

        [BsonElement("widgets")]
        public IEnumerable<WidgetItem> Widgets { get; set; } = [];

    }

    public class WidgetItem
    {
        [BsonElement("widgetId"), BsonRepresentation(BsonType.ObjectId)]
        public string WidgetId { get; set; }

        [BsonElement("widgetName"), BsonRepresentation(BsonType.String)]
        public string WidgetName { get; set; }

    }
}
