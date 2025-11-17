using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace HanwhaClient.Model.DbEntities
{
    public class FloorPlanMaster : BaseModel
    {
        [BsonElement("floorPlanName")]
        public string FloorPlanName { get; set; }

        [BsonElement("floorImage")]
        public string? FloorImage { get; set; }

    }
    public class ImageData
    {
        [BsonElement("imageName")]
        public string? ImageName { get; set; }

        [BsonElement("base64Image")]
        public string? Base64Image { get; set; }
    }

    public class GeoLocationFloor
    {
        [BsonElement("Latitude")]
        public double? Latitude { get; set; }

        [BsonElement("Longitude")]
        public double? Longitude { get; set; }
    }
}
