using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Model.Dto
{
    public class IISSiteDto
    {
        public string Name { get; set; }
        public long Id { get; set; }
        public string State { get; set; }
        public List<string> Bindings { get; set; }
    }
}
