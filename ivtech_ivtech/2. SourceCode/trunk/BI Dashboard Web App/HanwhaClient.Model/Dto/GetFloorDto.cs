using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Model.Dto
{
    public class GetFloorDto
    {
        public string Id { get; set; }
        public string FloorPlanName { get; set; }
    }

    public class FloorZoneByPermissionDto
    {
        public string Id { get; set; }
        public string FloorPlanName { get; set; }
        public IEnumerable<ZoneByPermissionDto> Zones { get; set; }
    }

    public class ZoneByPermissionDto {
        public string Id { get; set; }
        public string ZoneName { get; set; }
    }

    public class FloorZonesNameByIdRequest
    {
        public IEnumerable<string> FloorIds { get; set; }
        public IEnumerable<string> ZoneIds { get; set; }
    }

    public class FloorZonesNameByIdResponse
    {
        public IEnumerable<string> FloorNames { get; set; }
        public IEnumerable<string> ZoneNames { get; set; }
    }
}
