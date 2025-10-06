using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Model.Dto
{
    public class MonitoringGroupWithItemsResponse
    {
        public string? GroupId { get; set; }
        public string? GroupName { get; set; }
        public List<GroupItemResponse>? GroupItems { get; set; }
    }

    public class GroupItemResponse
    {
        public string? GroupItemId { get; set; }
        public string? Name { get; set; }
        public string? Url { get; set; }
        public string? Location { get; set; }
    }

}
