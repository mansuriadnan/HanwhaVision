using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace HanwhaClient.Model.DbEntities
{
    public class ZoneMaster : BaseModel
    {
        [BsonElement("floorId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string FloorId { get; set; }

        [BsonElement("zoneName")]
        [BsonRepresentation(BsonType.String)]
        public string ZoneName { get; set; }

        [BsonElement("peopleOccupancy")]
        [BsonRepresentation(BsonType.Int32)]
        public int? PeopleOccupancy { get; set; }

        [BsonElement("vehicleOccupancy")]
        [BsonRepresentation(BsonType.Int32)]
        public int? VehicleOccupancy { get; set; } 
        
        [BsonElement("peopleDefaultOccupancy")]
        [BsonRepresentation(BsonType.Int32)]
        public int? PeopleDefaultOccupancy { get; set; }

        [BsonElement("vehicleDefaultOccupancy")]
        [BsonRepresentation(BsonType.Int32)]
        public int? VehicleDefaultOccupancy { get; set; }

        [BsonElement("resetAt")]
        [BsonRepresentation(BsonType.DateTime)]
        public DateTime ResetAt { get; set; }

        [BsonElement("zoneArea")]
        public IEnumerable<XyPosition> ZoneArea { get; set; }

    }

    public class XyPosition
    {
        [BsonElement("x")]
        public decimal X { get; set; }
        [BsonElement("y")]
        public decimal Y { get; set; }
    }
}
