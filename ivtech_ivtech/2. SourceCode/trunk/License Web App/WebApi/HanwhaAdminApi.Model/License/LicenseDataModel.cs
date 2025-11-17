using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaAdminApi.Model.License
{
    public class LicenseDataModel
    {
        public bool IsValid { get; set; }
        public string ErrorMessage { get; set; }
        public string CompanyName { get; set; }
        public string LicenseType { get; set; }
        public DateTime ExpiryDate { get; set; }
        public string HardwareId { get; set; }
        public int NumberOfUsers { get; set; }
        public int NumberOfCameras { get; set; }

    }
}
