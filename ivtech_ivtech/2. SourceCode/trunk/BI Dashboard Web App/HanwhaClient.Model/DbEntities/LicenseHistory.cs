using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace HanwhaClient.Model.DbEntities
{
    public class LicenseHistory : BaseModel
    {

        [BsonElement("licenseType")]
        public string LicenseType { get; set; }

        [BsonElement("startDate")]
        public DateTime StartDate { get; set; }

        [BsonElement("expiryDate")]
        public DateTime ExpiryDate { get; set; }

        [BsonElement("macAddress")]
        public string? MacAddress { get; set; }

        [BsonElement("numberOfUsers")]
        public int NumberOfUsers { get; set; }

        [BsonElement("noOfChannel")]
        public int NoOfChannel { get; set; }
        
    }
}
