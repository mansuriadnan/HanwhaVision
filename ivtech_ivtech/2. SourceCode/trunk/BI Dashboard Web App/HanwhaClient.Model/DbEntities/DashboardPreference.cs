using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Model.DbEntities
{
    public class DashboardPreference : BaseModel
    {
        [BsonElement("userId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string UserId { get; set; }

        [BsonElement("dashboardPreferenceDesign")]
        public string? DashboardPreferenceJson { get; set; }

        [BsonElement("dashboardName")]
        public string? DashboardName { get; set; }
    }
}
