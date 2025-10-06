using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace HanwhaClient.Model.DbEntities
{
    public class ForkliftCount : BaseModel
    {
        [BsonElement("deviceId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string DeviceId { get; set; }

        [BsonElement("cameraIp")]
        public string CameraIP { get; set; }

        [BsonElement("channelNo")]
        public int ChannelNo { get; set; }

        [BsonElement("lines")]
        public IEnumerable<ForkliftLine> Lines { get; set; }
    }

    public class ForkliftLine
    {
        [BsonElement("lineIndex")]
        public int LineIndex { get; set; }

        [BsonElement("name")]
        public string? Name { get; set; }

        [BsonElement("inCount")]
        public int InCount { get; set; }

        [BsonElement("outCount")]
        public int OutCount { get; set; }
    }
}
