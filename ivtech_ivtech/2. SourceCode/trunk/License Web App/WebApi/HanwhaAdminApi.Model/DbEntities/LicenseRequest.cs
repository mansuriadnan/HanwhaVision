using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO.Pipes;

namespace HanwhaAdminApi.Model.DbEntities
{
    public class LicenseRequest : BaseModel
    {
        [BsonElement("customerId"), BsonRepresentation(BsonType.ObjectId)]
        public string CustomerId { get; set; }

        [BsonElement("licenseType")]
        public string LicenseType { get; set; }

        [BsonElement("trialDurationDays")]
        public int TrialDurationDays { get; set; }

        [BsonElement("siteName")]
        public string? SiteName { get; set; }

        [BsonElement("macAddress")]
        public string? MacAddress { get; set; }

        [BsonElement("noOfUsers")]
        public int NoOfUsers { get; set; }

        [BsonElement("noOfChannel")]
        public int NoOfChannel { get; set; }

        [BsonElement("startDate")]
        public DateTime StartDate { get; set; }

        [BsonElement("expiryDate")]
        public DateTime ExpiryDate { get; set; }
    
    }
}
