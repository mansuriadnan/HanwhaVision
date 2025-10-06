using HanwhaClient.Model.DbEntities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Model.Dto
{
    public class ZoneDto
    {
        public string? Id { get; set; }
        public string? PolygonId { get; set; }
        public string? FloorId { get; set; }
        public string? Name { get; set; }
        public int? PeopleOccupancy { get; set; }
        public int? PeopleDefaultOccupancy { get; set; }
        public int? VehicleOccupancy { get; set; }
        public string? ResetAt { get; set; }
        //public List<ZoneXyPosition>? ZoneArea { get; set; }
        public Dictionary<string, List<PolygonPoint>>? Polygons { get; set; }
        public IEnumerable<XyPosition>? PolygonsNew { get; set; }
    }

    public class ZoneXyPosition
    {
        public int X { get; set; }
        public int Y { get; set; }
    }
}
