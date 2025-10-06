using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Model.Dto
{
    public class SSLUploadRequestDto
    {
        [Required]
        public IFormFile CertificateFile { get; set; }

        [Required]
        public string Password { get; set; }

    }
}
