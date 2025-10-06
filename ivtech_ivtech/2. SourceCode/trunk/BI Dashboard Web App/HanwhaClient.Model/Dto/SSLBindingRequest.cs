using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Model.Dto
{
    // Models/SSLBindingRequest.cs
    public class SSLBindingRequest
    {
        public string SiteName { get; set; }
        public string PfxFilePath { get; set; }
        public string PfxPassword { get; set; }
        public int Port { get; set; } = 443;
        public string IpAddress { get; set; } = "*";
    }

    // Models/SSLBindingResponse.cs
    public class SSLBindingResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public string CertificateThumbprint { get; set; }
        public string SiteName { get; set; }
        public int Port { get; set; }
    }

    // Models/ApiResponse.cs
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public T Data { get; set; }
        public string Error { get; set; }
    }

}
