using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace HanwhaClient.Model.DbEntities
{
    public class MultiLaneVehicleCount : BaseModel
    {
        [BsonElement("deviceId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string DeviceId { get; set; }

        [BsonElement("cameraIp")]
        public string CameraIP { get; set; }

        [BsonElement("channelNo")]
        public int ChannelNo { get; set; }

        [BsonElement("directionCount")]
        public IEnumerable<MultiLaneVehicleDirection> DirectionCount { get; set; }
    }

    public class MultiLaneVehicleDirection
    {
        [BsonElement("direction")]
        public string Direction { get; set; }

        [BsonElement("count")]
        public int Count { get; set; }

    }
}
