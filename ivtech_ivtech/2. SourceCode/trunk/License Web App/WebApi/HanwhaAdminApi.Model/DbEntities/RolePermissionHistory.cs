using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaAdminApi.Model.DbEntities
{
    public class RolePermissionHistory : BaseModel
    {
        [BsonElement("roleId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string RoleId { get; set; }
        
        [BsonElement("action")]
        [BsonRepresentation(BsonType.String)]
        public string Action { get; set; }

        [BsonElement("screenMappings")]
        public IEnumerable<ScreenMapping> ScreenMappings { get; set; } = [];
    }
}
