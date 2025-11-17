using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Model.Dto
{
    public class CertificateInfoDto
    {
        public string Subject { get; set; }
        public string Issuer { get; set; }
        public string Thumbprint { get; set; }
        public DateTime NotBefore { get; set; }
        public DateTime NotAfter { get; set; }
        public string SerialNumber { get; set; }
    }
}
