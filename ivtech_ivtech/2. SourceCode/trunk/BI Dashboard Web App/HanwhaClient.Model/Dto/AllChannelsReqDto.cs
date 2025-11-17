using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Model.Dto
{
    public class AllChannelsReqDto
    {
        public string? IpAddress { get; set; }
        public string? UserName { get; set; }
        public string? Password { get; set; }
        public int DevicePort { get; set; }
        public bool IsHttps { get; set; }
    }
}
