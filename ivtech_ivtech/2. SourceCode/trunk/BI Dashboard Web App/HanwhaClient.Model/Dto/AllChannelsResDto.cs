using HanwhaClient.Model.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Model.Dto
{
    public class AllChannelsResDto
    {
        public int ChannelNumber { get; set; }
        public bool IsEnable { get; set; }
    }
    public class DeviceEventsLogsRequest: PagingSortingModel
    {
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public List<string>? FloorIds { get; set; }
        public List<string>? ZoneIds { get; set; }
        public List<string>? EventNames { get; set; }
        public IEnumerable<string>? DeviceIds { get; set; }
        public string? Status { get; set; }

    }
    public class DeviceEventsLogsResponse
    {
        public string Id { get; set; }
        public DateTime? CreatedOn { get; set; }
        public string EventName { get; set; }
        public string EventDescription { get; set; } = string.Empty;
        public string FloorName { get; set; }
        public string ZoneName { get; set; }
        public string VideoLink { get; set; }
        public bool IsAcknowledged { get; set; }
    }
    public class DeviceEventsLogsRes
    {
        public int TotalCount { get; set; }
        public List<DeviceEventsLogsResponse> EventsLogsDetails { get; set; }
    }

    public class DeviceChangeStatusRequest
    {
        public string DeviceEventId { get; set; }
    }
}
