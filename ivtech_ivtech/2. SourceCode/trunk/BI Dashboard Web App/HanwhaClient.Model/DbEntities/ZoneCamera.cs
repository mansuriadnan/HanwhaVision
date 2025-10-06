using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;


namespace HanwhaClient.Model.DbEntities
{
    public class ZoneCamera : BaseModel
    {
        [BsonElement("floorId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string FloorId { get; set; }

        [BsonElement("zoneId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string ZoneId { get; set; }

        [BsonElement("deviceId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? DeviceId { get; set; }

        [BsonElement("position")]
        public DevicePosition? Position { get; set; }

        [BsonElement("fovLength")]
        public double? FOVLength { get; set; }

        [BsonElement("fovColor")]
        public string? FOVColor { get; set; }

        [BsonElement("peopleLineIndex")]
        public int[] PeopleLineIndex { get; set; } = [];

        [BsonElement("vehicleLineIndex")]
        public int[] VehicleLineIndex { get; set; } = [];

        [BsonElement("isSphere")]
        public bool IsSphere { get; set; } = false;

        [BsonElement("channel")]
        public int Channel { get; set; }

    }

    public class DevicePosition
    {
        [BsonElement("x")]
        public double X { get; set; }

        [BsonElement("y")]
        public double Y { get; set; }

        [BsonElement("angle")]
        public double? Angle { get; set; }
    }

}
