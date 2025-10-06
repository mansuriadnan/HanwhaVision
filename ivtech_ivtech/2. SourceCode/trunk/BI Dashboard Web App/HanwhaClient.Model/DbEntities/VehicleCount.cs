using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;


namespace HanwhaClient.Model.DbEntities
{
    public class VehicleCount : BaseModel
    {
        [BsonElement("vehicleCounts")]
        public IEnumerable<VehicleCountData> VehicleCounts { get; set; }

        [BsonElement("deviceId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string DeviceId { get; set; }

        [BsonElement("cameraIp")]
        public string CameraIP { get; set; }

        [BsonElement("channelNo")]
        public int ChannelNo { get; set; }
    }

    public class VehicleCountData
    {
        [BsonElement("channel")]
        public int Channel { get; set; }

        [BsonElement("lines")]
        public IEnumerable<VehicleLine> Lines { get; set; }
    }

    public class VehicleLine
    {
        public int LineIndex { get; set; }
        public string Name { get; set; }
        public int InCount { get; set; }
        public VehicleData In { get; set; }
        public int OutCount { get; set; }
        public VehicleData Out { get; set; }
    }

    public class VehicleData
    {
        public int Car { get; set; }
        public int Bus { get; set; }
        public int Truck { get; set; }
        public int Motorcycle { get; set; }
        public int Bicycle { get; set; }
    }
}
