using HanwhaAdminApi.Application.Interfaces;
using HanwhaAdminApi.Core.Services.License;
using HanwhaAdminApi.Model.DbEntities;
using HanwhaAdminApi.Model.License;
using Microsoft.Extensions.DependencyInjection;

namespace HanwhaAdminApi.Application.Services
{
    public class PermissionService : IPermissionService
    {
        private readonly IRoleService _roleService;
        private readonly IScreenMasterService _screenMasterService;
        private readonly IRoleScreenMappingService _roleScreenMappingService;
        private readonly IServiceScopeFactory _scopeFactory;

        private IEnumerable<RoleMaster> _roles { get; set; }
        private IEnumerable<RoleScreenMapping> _roleScreenMappings { get; set; }
        private IEnumerable<ScreenMaster> _screenMasters { get; set; }

        public LicenseDataModel _licenseData { get; set; }

        public PermissionService(IServiceScopeFactory scopeFactory)
        {
            this._scopeFactory = scopeFactory;
            using (var scope = this._scopeFactory.CreateScope())
            {
                _roleService = scope.ServiceProvider.GetRequiredService<IRoleService>();
                _screenMasterService = scope.ServiceProvider.GetRequiredService<IScreenMasterService>();
                _roleScreenMappingService = scope.ServiceProvider.GetRequiredService<IRoleScreenMappingService>();
            }
            RefreshPermissionData();
            RefreshLicenseData();
        }

        /// <summary>
        /// Call this method after update any role permission
        /// </summary>
        public async void RefreshPermissionData()
        {
            _roles = await _roleService.GetRolesForPermissionAsync();
            _screenMasters = await _screenMasterService.GetAllScreenMasters();
            _roleScreenMappings = await _roleScreenMappingService.GetRoleScreenMappings();
        }

        public void RefreshLicenseData()
        {
            _licenseData = new LicenseDataModel();
            string hardwareId = HardwareHelper.GetHardwareId();
            string _licenseDirectory = Path.Combine(Directory.GetCurrentDirectory(), "License");
            var filePath = Path.Combine(_licenseDirectory, "license.lic");
            var keyPath = Path.Combine(_licenseDirectory, "public-key.pem");
            var licenseValidity = LicenseValidator.ValidateLicense(filePath, keyPath, hardwareId);
            _licenseData.IsValid = licenseValidity.isValid;
            if (licenseValidity.isValid && licenseValidity.licenseData != null)
            {
                _licenseData.CompanyName = licenseValidity.licenseData.CompanyName.ToString();
                _licenseData.LicenseType = licenseValidity.licenseData.LicenseType.ToString();
                if (DateTime.TryParse(licenseValidity.licenseData.ExpiryDate.ToString(), out DateTime date))
                    _licenseData.ExpiryDate = date;
                _licenseData.HardwareId = licenseValidity.licenseData.HardwareId.ToString();
                if (int.TryParse(licenseValidity.licenseData.NumberOfUsers.ToString(), out int numberOfUsers))
                    _licenseData.NumberOfUsers = numberOfUsers;
                if (int.TryParse(licenseValidity.licenseData.NumberOfCameras.ToString(), out int numberOfCameras))
                    _licenseData.NumberOfCameras = numberOfCameras;
            }
            else
            {
                _licenseData.ErrorMessage = licenseValidity.errorMessage;
            }
        }

        public bool checkPermission(string roleName, string screenName)
        {
            var role = _roles.FirstOrDefault(x => x.RoleName.ToLower() == roleName.ToLower());
            if (role == null)
            {
                return false;
            }
            else
            {
                string screenId = _screenMasters.Where(x => x.ScreenName == screenName).Select(x => x.Id).FirstOrDefault();
                var roleScreenMapping = _roleScreenMappings.Any(x => x.RoleId == role.Id && x.ScreenMappings.Any(s => s.ScreenId == screenId && s.AccessAllowed == true));
                return roleScreenMapping;
            }
        }
    }
}
