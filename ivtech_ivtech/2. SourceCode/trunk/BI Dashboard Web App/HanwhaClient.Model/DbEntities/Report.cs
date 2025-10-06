using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Model.DbEntities
{
    public class Report : BaseModel
    {
        [BsonElement("reportType")]
        public string ReportType { get; set; }

        [BsonElement("comperisionType")]
        public IEnumerable<string> ComperisionType { get; set; }

        // Embed SiteReport as a sub-document
        [BsonElement("siteReport")]
        public SiteReport? SiteReport { get; set; } // Made nullable to allow for cases where only ZoneReport is present


        // Embed ZoneReport as a sub-document
        [BsonElement("zoneReport")]
        public ZoneReport? ZoneReport { get; set; } // Made nullable to allow for cases where only SiteReport is present
    }

    public class SiteReport
    {
        [BsonElement("reportName")]
        public string? ReportName { get; set; }

        // Sites is a list of ObjectIds for multi-selection
        [BsonElement("sitesIds")]
        [BsonRepresentation(BsonType.ObjectId)]
        public List<string>? SitesIds { get; set; } = new List<string>();

        [BsonElement("startDate")]
        public DateTime StartDate { get; set; }

        [BsonElement("endDate")]
        public DateTime EndDate { get; set; }
    }

    // Model for Zone-specific report data
    public class ZoneReport
    {
        [BsonElement("reportName")]
        public string? ReportName { get; set; }

        // Sites is a list of ObjectIds for multi-selection
        [BsonElement("siteId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? SiteId { get; set; }

        // Floor is a single ObjectId reference
        [BsonElement("floorIds")]
        [BsonRepresentation(BsonType.ObjectId)]
        public List<string>? FloorIds { get; set; } = new List<string>();

        // Zone is a single ObjectId reference
        [BsonElement("zoneIds")]
        [BsonRepresentation(BsonType.ObjectId)]
        public List<string>? ZoneIds { get; set; } = new List<string>();

        [BsonElement("startDate")]
        public DateTime StartDate { get; set; }

        [BsonElement("endDate")]
        public DateTime EndDate { get; set; }
    }
}
