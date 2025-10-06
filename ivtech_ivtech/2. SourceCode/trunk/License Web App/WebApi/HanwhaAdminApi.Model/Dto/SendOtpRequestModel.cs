using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaAdminApi.Model.Dto
{
    public class SendOtpRequestModel
    {
        public string? Id { get; set; }
        public string? NewEmailId { get; set; }
        public bool IsResent { get; set; } = false;
    }
}
