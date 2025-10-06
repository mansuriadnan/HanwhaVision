using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaAdminApi.Model.DbEntities
{
    public class CustomerMaster : BaseModel
    {
        [BsonElement("customerName")]
        public string CustomerName { get; set; }

        [BsonElement("distributorId"), BsonRepresentation(BsonType.ObjectId)]
        public string DistributorId { get; set; }

        [BsonElement("contactPersonName")]
        public string ContactPersonName { get; set; }

        [BsonElement("contactPersonMobile")]
        public string ContactPersonMobile { get; set; }

        [BsonElement("officePhone")]
        public string OfficePhone { get; set; }

        [BsonElement("emailAddress")]
        public string EmailAddress { get; set; }

        [BsonElement("countryId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string CountryId { get; set; }

        [BsonElement("stateId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? StateId { get; set; }

        [BsonElement("cityId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string CityId { get; set; }

        [BsonElement("postalCode")]
        public string PostalCode { get; set; }

        [BsonElement("address")]
        public string Address { get; set; }

        [BsonElement("publicKeyPem")]
        public string? PublicKeyPem { get; set; }

        [BsonElement("privateKeyPem")]
        public string? PrivateKeyPem { get; set; }

        [BsonElement("customerNo")]
        public string? CustomerNo { get; set; }
    }
}
