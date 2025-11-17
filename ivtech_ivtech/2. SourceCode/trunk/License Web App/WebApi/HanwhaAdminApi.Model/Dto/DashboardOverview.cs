

namespace HanwhaAdminApi.Model.Dto
{
    public class DashboardOverview
    {
        public long TotalUsers { get; set; }
        public long TotalActiveUsers { get; set; }
        public long TotalCustomer { get; set; }
        public long TotalActiveCustomer { get; set; }
        public long TotalGeneratedLicenses { get; set; }
        public long TotalActiveLicenses { get; set; }
        public long ActiveLicenses { get; set; }
        public long ExpiredLicenses { get; set; }
        public long FutureLicenses { get; set; }
    }

    public class LicenseDueDetail
    {
        public string  CustomerName { get; set; }
        public int NoOfChannel { get; set; }
        public int NoUser { get; set; }
        public DateTime ExpiredOn { get; set; }
    }
}
