using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Model.Dto
{
    public class MonitoringGroupItemRequest
    {
        public string? MonitoringId { get; set; }
        public string? GroupId { get; set; }
        public string? GroupItemId { get; set; }
        public string? Name { get; set; }
        public string? Url { get; set; }
        public string? Location { get; set; }
    }
}
