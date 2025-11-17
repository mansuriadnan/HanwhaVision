
using HanwhaClient.Model.DbEntities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Model.Dto
{
    public class ZoneResponseDto
    {
        public string? Id { get; set; }
        public string? FloorId { get; set; }
        public string? Name { get; set; }
        public int? PeopleOccupancy { get; set; }
        public int? PeopleDefaultOccupancy { get; set; }
        public int? VehicleOccupancy { get; set; }
        public int? VehicleDefaultOccupancy { get; set; }
        public string? ResetAt { get; set; }
        public IEnumerable<XyPosition>? ZoneArea { get; set; }
        public IEnumerable<MappedDevices>? MappedDevices { get; set; }
    }

}
