using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaAdminApi.Model.DbEntities
{
    public class RoleScreenMapping : BaseModel
    {
        [BsonElement("role_id")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string RoleId { get; set; }

        [BsonElement("screenMappings")]
        public IEnumerable<ScreenMapping> ScreenMappings { get; set; } = [];
    }

    public class ScreenMapping
    {
        [BsonElement("screenId"), BsonRepresentation(BsonType.ObjectId)]
        public string? ScreenId { get; set; }

        [BsonElement("access_allowed")]
        [BsonRepresentation(BsonType.Boolean)]
        public bool AccessAllowed { get; set; }
    }

    public class ScreenMaster : BaseModel
    {

        [BsonElement("screen_name")]
        [BsonRepresentation(BsonType.String)]
        public string ScreenName { get; set; }

        [BsonElement("is_active")]
        [BsonRepresentation(BsonType.Boolean)]
        public bool IsActive { get; set; }


        [BsonElement("parents_screen_id")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string ParentsScreenId { get; set; }

        [BsonElement("sequenceNo")]
        [BsonRepresentation(BsonType.Int32)]
        public int SequenceNo { get; set; }
    }
}
