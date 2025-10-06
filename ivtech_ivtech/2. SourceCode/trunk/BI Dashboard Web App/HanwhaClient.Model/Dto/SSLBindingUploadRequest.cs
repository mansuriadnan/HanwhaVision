using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Model.Dto
{
    // Models/SSLBindingUploadRequest.cs
    public class SSLBindingUploadRequest
    {
        public string SiteName { get; set; }
        public string PfxPassword { get; set; }
        public int Port { get; set; } = 443;
        public string IpAddress { get; set; } = "*";
    }

}
