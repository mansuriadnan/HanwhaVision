using HanwhaClient.Model.User;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace HanwhaClient.Model.DbEntities
{
    public class UserMaster : BaseModel
    {
        [BsonElement("username")]
        public string Username { get; set; } = null!;
        [BsonElement("firstname")]
        public string Firstname { get; set; } = null;
        [BsonElement("lastname")]
        public string Lastname { get; set; } = null;

        [BsonElement("email")]
        public string Email { get; set; } = null!;

        [BsonElement("password")]
        public string? Password { get; set; } = null!;

        [BsonElement("roleIds")]
        [BsonRepresentation(BsonType.ObjectId)]
        public IEnumerable<string>? RoleIds { get; set; } = null!;

        [BsonElement("dataAccessPermission")]
        public DataAccessPermission DataAccessPermission { get; set; }

        [BsonElement("profileImage")]
        public string? ProfileImage { get; set; }

        [BsonElement("userPreferences")]
        public UserPreferences? userPreferences { get; set; }

    }
    public class DataAccessPermission
    {
        [BsonElement("floorIds")]
        [BsonRepresentation(BsonType.ObjectId)]
        public IEnumerable<string> FloorIds { get; set; }

        [BsonElement("zoneIds")]
        [BsonRepresentation(BsonType.ObjectId)]
        public IEnumerable<string> ZoneIds { get; set; }
    }

    public class UserPreferences
    {
        [BsonElement("theme")]
        public string Theme { get; set; } = "light";

        [BsonElement("isOsSyncTimeZone")]
        public bool IsOsSyncTimeZone { get; set; }

        [BsonElement("timezoneId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? TimezoneId { get; set; }

        [BsonElement("isDaylightSavings")]
        public bool IsDaylightSavings { get; set; }

        [BsonElement("language")]
        public string Language { get; set; }

        [BsonElement("timeFormat")] 
        public string? TimeFormat { get; set; }
    }
}