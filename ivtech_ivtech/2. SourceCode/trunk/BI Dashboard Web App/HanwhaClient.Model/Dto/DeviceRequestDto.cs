using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Model.Dto
{
    public class DeviceRequestDto
    {
        public string? Id { get; set; }
        public string? DeviceType { get; set; }
        public string? DeviceName { get; set; }
        public string? IpAddress { get; set; }
        public string? UserName { get; set; }
        public string? Password { get; set; }
        public string? DevicePort { get; set; }
        public bool IsHttps { get; set; }
        public string? Location { get; set; }
    }
}
