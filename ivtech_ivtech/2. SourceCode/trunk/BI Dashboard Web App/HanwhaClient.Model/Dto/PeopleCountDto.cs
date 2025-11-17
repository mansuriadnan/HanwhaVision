using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Model.Dto
{
    public class PeopleCountDto
    {
        public string? CameraId { get; set; }
        public string? CameraIp { get; set; }
        public IEnumerable<LineDto> Lines { get; set; }
    }

    public class LineDto
    {
        public int LineIndex { get; set; }
        public string Name { get; set; }
        public int InCount { get; set; }
        public int OutCount { get; set; }
    }
}
