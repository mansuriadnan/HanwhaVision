using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Buffers.Text;

namespace HanwhaAdminApi.Model.DbEntities
{
    public class UserMaster : BaseModel
    {
        [BsonElement("username")]
        public string Username { get; set; } = null!;

        [BsonElement("firstname")]
        public string Firstname { get; set; } = null;

        [BsonElement("lastname")]
        public string Lastname { get; set; } = null;

        [BsonElement("email")]
        public string Email { get; set; } = null!;

        [BsonElement("password")]
        public string? Password { get; set; } = null!;

        [BsonElement("roleIds")]
        [BsonRepresentation(BsonType.ObjectId)]
        public IEnumerable<string>? RoleIds { get; set; } = null!;
        
        [BsonElement("profileImage")]
        public string? ProfileImage { get; set; }

    }
}
