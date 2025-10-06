using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace HanwhaClient.Model.DbEntities
{
    public class RoleScreenMapping : BaseModel
    {
        [BsonElement("role_id")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string RoleId { get; set; }

        [BsonElement("screenMappings")]
        public IEnumerable<ScreenMapping> ScreenMappings { get; set; } = [];
        [BsonElement("dataAccessPermissions")]
        public IEnumerable<FloorDataAccessPermission> DataAccessPermissions { get; set; } = [];

        [BsonElement("widgetAccessPermissions")]
        public IEnumerable<WidgetAccessPermission> WidgetAccessPermissions { get; set; } = [];

    }
    public class FloorDataAccessPermission
    {
        [BsonElement("floorId"), BsonRepresentation(BsonType.ObjectId)]
        public string FloorId { get; set; }

        [BsonElement("zoneIds"), BsonRepresentation(BsonType.ObjectId)]
        public IEnumerable<string> ZoneIds { get; set; } = [];
    }

    public class WidgetAccessPermission
    {
        [BsonElement("widgetCategoryId"), BsonRepresentation(BsonType.ObjectId)]
        public string WidgetCategoryId { get; set; }

        [BsonElement("widgetIds"), BsonRepresentation(BsonType.ObjectId)]
        public IEnumerable<string> WidgetIds { get; set; } = [];

    }

    public class ScreenMapping
    {
        [BsonElement("screenId"), BsonRepresentation(BsonType.ObjectId)]
        public string? ScreenId { get; set; }

        [BsonElement("access_allowed")]
        [BsonRepresentation(BsonType.Boolean)]
        public bool AccessAllowed { get; set; }
    }

    public class ScreenMaster : BaseModel
    {

        [BsonElement("screen_name")]
        [BsonRepresentation(BsonType.String)]
        public string ScreenName { get; set; }

        [BsonElement("is_active")]
        [BsonRepresentation(BsonType.Boolean)]
        public bool IsActive { get; set; }


        [BsonElement("parents_screen_id")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string ParentsScreenId { get; set; }

        [BsonElement("sequenceNo")]
        [BsonRepresentation(BsonType.Int32)]
        public int SequenceNo { get; set; }
    }

    
}
