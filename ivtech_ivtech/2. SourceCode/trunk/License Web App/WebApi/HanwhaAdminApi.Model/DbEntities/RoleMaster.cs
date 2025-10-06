using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaAdminApi.Model.DbEntities
{
    public class RoleMaster : BaseModel
    {
        [BsonElement("roleName")]
        public string RoleName { get; set; } = null!;

        [BsonElement("description")]
        public string Description { get; set; } = null!;

    }
}
