using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Model.Dto
{
    public class CertificateUploadResult
    {
        public bool Success { get; set; }
        public string ErrorMessage { get; set; }
        public CertificateInfoDto CertificateInfo { get; set; }
    }
}
