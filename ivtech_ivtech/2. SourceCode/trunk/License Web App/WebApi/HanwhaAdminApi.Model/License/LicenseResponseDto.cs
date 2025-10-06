using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaAdminApi.Model.License
{
    public class LicenseResponseDto
    {
        public string ClientId { get; set; }
        public string ClientName { get; set; }
        public string MachineId { get; set; }
        public int Cameras { get; set; }
        public int Users { get; set; }
        public DateTime ExpiryDate { get; set; }
    }
}
