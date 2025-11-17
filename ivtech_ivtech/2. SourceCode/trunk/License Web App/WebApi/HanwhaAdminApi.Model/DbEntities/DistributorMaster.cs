using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaAdminApi.Model.DbEntities
{
    public class DistributorMaster : BaseModel
    {
        [BsonElement("distributorName")]
        public string DistributorName { get; set; } = null!;

        [BsonElement("address")]
        public string Address { get; set; } = null;

        [BsonElement("email")]
        public string Email { get; set; } = null!;

        [BsonElement("countryId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string CountryId { get; set; } = null!;

        [BsonElement("contactPerson")]
        public string ContactPerson { get; set; } = null;
    }
}
