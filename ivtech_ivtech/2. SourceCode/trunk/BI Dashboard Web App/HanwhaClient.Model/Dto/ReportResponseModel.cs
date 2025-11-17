using HanwhaClient.Model.DbEntities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Model.Dto
{
    public class ReportResponseModel
    {
        public string Id { get; set; }
        public string ReportType { get; set; }
        public SiteReport? SiteReport { get; set; }
        public ZoneReport? ZoneReport { get; set; }
        public DateTime? CreatedOn { get; set; }
        public DateTime? UpdatedOn { get; set; }
        public IEnumerable<string> ComperisionType { get; set; }
    }

}
