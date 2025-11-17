using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaAdminApi.Model.Dto
{
    public class OtpValidationDto
    {
        public string Email { get; set; }
        public string Otp { get; set; }
        public bool IsFromUser { get; set; } = false;
    }
}
