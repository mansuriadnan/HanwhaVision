using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace HanwhaClient.Model.DbEntities
{
    public class QueueManagement : BaseModel
    {

        [BsonElement("deviceId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string DeviceId { get; set; }

        [BsonElement("channelNo")]
        public int ChannelNo { get; set; }

        [BsonElement("ruleIndex")]
        public int RuleIndex { get; set; }

        [BsonElement("count")]
        public int Count { get; set; }

        [BsonElement("ruleName")]
        public string RuleName { get; set; }

        [BsonElement("eventName")]
        public string EventName { get; set; }
    }
}
