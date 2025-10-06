using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaAdminApi.Model.License
{
    public class LicenseRequestModel
    {
        public string CustomerId { get; set; }
        public int NoOfUsers { get; set; }
        public DateTime ExpiryDate { get; set; }
        public DateTime StartDate { get; set; }
        public string LicenseType { get; set; }
        public int TrialDurationDays { get; set; } = 0;
        public int NoOfChannel { get; set; }
        public string? MACAddress { get; set; }
        public string? CustomerName { get; set; }
        public string? PrivateKeyPem { get; set; }
        public string SiteName { get; set; } = string.Empty;
    }
}
