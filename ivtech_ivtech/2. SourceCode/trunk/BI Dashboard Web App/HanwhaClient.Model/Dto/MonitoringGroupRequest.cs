using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Model.Dto
{
    public class MonitoringGroupRequest
    {
        public string? MonitoringId { get; set; }
        public string? GroupId { get; set; }
        public string? GroupName { get; set; }
    }
}
