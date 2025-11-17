using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaAdminApi.Model.DbEntities
{
    public class CountryMaster : BaseModel
    {
        [BsonElement("name")]
        public string Name { get; set; } = null!;

        [BsonElement("hasStates")]
        public bool HasStates { get; set; }
        [BsonElement("code")]
        public string Code { get; set; }

    }
}
