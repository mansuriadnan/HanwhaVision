using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace HanwhaClient.Model.DbEntities
{
    public class HeatMap : BaseModel
    {
        [BsonElement("deviceId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string DeviceId { get; set; }

        [BsonElement("cameraIp")]
        public string CameraIP { get; set; }

        [BsonElement("channelNo")]
        public int ChannelNo { get; set; }

        [BsonElement("heatMapType")]
        public string HeatMapType { get; set; }

        [BsonElement("resolutionHeight")]
        public int ResolutionHeight { get; set; }

        [BsonElement("resolutionWidth")]
        public int ResolutionWidth { get; set; }

        [BsonElement("heatMapData")]
        public List<int> HeatMapData { get; set; }
    }
}
