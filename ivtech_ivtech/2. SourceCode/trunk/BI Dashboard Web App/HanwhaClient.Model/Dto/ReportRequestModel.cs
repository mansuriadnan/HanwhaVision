using HanwhaClient.Model.DbEntities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Model.Dto
{
    public class ReportRequestModel
    {
        public string? Id { get; set; }
        public string ReportType { get; set; }
        public SiteReport? SiteReport { get; set; }
        public ZoneReport? ZoneReport { get; set; }
        public IEnumerable<string> ComperisionType { get; set; }
    }

    public class PdfDataRequest
    {
        public string? ReportId { get; set; }
        public IEnumerable<GeneratePdfSVGData> SVGData { get; set; }
    }
    public class ZonesRequest
    {
        public string SiteId { get; set; }
        public List<string> FloorIds { get; set; }
    }
    public class PdfGenerationOptions
    {
        public string HtmlContent { get; set; }
        public string? HeaderHtmlPath { get; set; }
        public string? FooterHtmlPath { get; set; }
        public string Title { get; set; } = "Document";
    }

}
