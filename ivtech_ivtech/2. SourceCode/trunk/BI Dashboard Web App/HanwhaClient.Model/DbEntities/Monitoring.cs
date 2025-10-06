using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Model.DbEntities
{
    public class Monitoring : BaseModel
    {
        [BsonElement("monitoringName")]
        public string? MonitoringName { get; set; }

        [BsonElement("monitoringGroup")]
        public List<MonitoringGroup>? MonitoringGroup { get; set; }
    }

    public class MonitoringGroup
    {
        [BsonRepresentation(BsonType.ObjectId)]
        [BsonElement("groupId")]
        public string? GroupId { get; set; }

        [BsonElement("groupName")]
        public string? GroupName { get; set; }

        [BsonElement("groupItem")]
        public List<GroupItem>? GroupItem { get; set; }
    }

    public class GroupItem
    {
        [BsonRepresentation(BsonType.ObjectId)]
        [BsonElement("groupItemId")]
        public string? GroupItemId { get; set; }
        [BsonElement("name")]
        public string? Name { get; set; }
        [BsonElement("url")]
        public string? Url { get; set; }
        [BsonElement("location")]
        public string? Location { get; set; }
    }
}
