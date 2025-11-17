using MongoDB.Bson.Serialization.Attributes;

namespace HanwhaClient.Model.DbEntities
{
    public class TimeZones : BaseModel
    {
        [BsonElement("name")]
        public string Name { get; set; }

        [BsonElement("timeZoneName")]
        public string TimeZoneName { get; set; }

        [BsonElement("timeZoneAbbr")]
        public string TimeZoneAbbr { get; set; }

        [BsonElement("utcOffset")]
        public string UtcOffset { get; set; }
    }
}
