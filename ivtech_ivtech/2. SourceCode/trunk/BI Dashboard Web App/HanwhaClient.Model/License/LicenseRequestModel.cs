namespace HanwhaClient.Model.License
{
    public class LicenseResponse
    {
        public string ClientId { get; set; }
        public int Cameras { get; set; }
        public int Users { get; set; }
        public DateTime ExpiryDate { get; set; }
        public int UtilizedCamera { get; set; }
        public int UtilizedUser { get; set; }
        public string CompanyName { get; set; }
        public string LicenseType { get; set; }
        public string HardwareId { get; set; }
        public string CustomerName { get; set; }
        public string SiteName { get; set; }
        public DateTime StartDate { get; set; }
        public string MACAddress { get; set; }
        public int NoOfChannel { get; set; }
    }
}
