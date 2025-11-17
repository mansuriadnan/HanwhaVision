using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaAdminApi.Model.DbEntities
{
    public class CityMaster : BaseModel
    {
        [BsonElement("name")]
        public string Name { get; set; } = null!;

        [BsonElement("countryId"), BsonRepresentation(BsonType.ObjectId)]
        public string CountryId { get; set; } = null;

        [BsonElement("stateId"), BsonRepresentation(BsonType.ObjectId)]
        public string? StateId { get; set; } = null;

    }
}
