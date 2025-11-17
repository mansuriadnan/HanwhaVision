using HanwhaAdminApi.Model.License;

namespace HanwhaAdminApi.Application.Interfaces
{
    public interface IPermissionService
    {
        LicenseDataModel _licenseData { get; set; }
        bool checkPermission(string roleName, string screenName);
        void RefreshPermissionData();
        void RefreshLicenseData();
    }
}
