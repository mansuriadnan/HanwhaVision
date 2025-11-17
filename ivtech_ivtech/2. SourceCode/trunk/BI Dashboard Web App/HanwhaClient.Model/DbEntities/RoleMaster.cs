using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Model.DbEntities
{
    public class RoleMaster : BaseModel
    {
        [BsonElement("roleName")]
        public string RoleName { get; set; } = null!;

        [BsonElement("description")]
        public string Description { get; set; } = null!;

        //[BsonElement("permissions")]
        //[BsonRepresentation(BsonType.ObjectId)]
        //public List<ObjectId> PermissionIds { get; set; } = new List<ObjectId>();
    }
}
