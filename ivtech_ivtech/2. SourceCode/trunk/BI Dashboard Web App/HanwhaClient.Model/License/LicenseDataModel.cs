namespace HanwhaClient.Model.License
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
        public string CustomerName { get; set; }
        public string SiteName { get; set; }
        public DateTime StartDate { get; set; }
        public string MACAddress { get; set; }
        public int NoOfChannel { get; set; }





    }
}
