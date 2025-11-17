using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Model.DbEntities
{
    public class SiteMaster : BaseModel
    {
        [BsonElement("siteName")]
        public string SiteName { get; set; }

        [BsonElement("hostingAddress")]
        public string HostingAddress { get; set; }

        [BsonElement("username")]
        public string Username { get; set; }

        [BsonElement("password")]
        public string Password { get; set; }

        [BsonRepresentation(BsonType.ObjectId)]
        [BsonElement("parentSiteId")]
        public string? ParentSiteId { get; set; }

        [BsonElement("childSites")]
        public List<ChildSite>? ChildSites { get; set; } = new List<ChildSite>();
    }

    public class ChildSite : BaseModel
    {
        [BsonElement("siteName")]
        public string? SiteName { get; set; }
        [BsonElement("hostingAddress")]
        public string? HostingAddress { get; set; }
        [BsonElement("username")]
        public string? Username { get; set; }
        [BsonElement("password")]
        public string? Password { get; set; }
    }

}
