using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using HanwhaClient.Model.DeviceApiResponse;

namespace HanwhaClient.Model.DbEntities
{
    public class ShoppingCartCount : BaseModel
    {
        [BsonElement("deviceId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string DeviceId { get; set; }

        [BsonElement("cameraIp")]
        public string CameraIP { get; set; }

        [BsonElement("channelNo")]
        public int ChannelNo { get; set; }

        [BsonElement("lines")]
        public IEnumerable<ShoppingCartLine> Lines { get; set; }
    }

    public class ShoppingCartLine
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
