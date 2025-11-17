using HanwhaClient.Application.Interfaces;
using HanwhaClient.Core.Services.License;
using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.License;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Driver;

namespace HanwhaClient.Application.Services
{
    public class PermissionService : IPermissionService
    {
        private readonly IRoleService _roleService;
        private readonly IScreenMasterService _screenMasterService;
        private readonly IRoleScreenMappingService _roleScreenMappingService;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly IConfiguration _configuration;
        private readonly LicenseValidator _licenseValidator;

        private IEnumerable<RoleMaster> _roles { get; set; }
        private IEnumerable<RoleScreenMapping> _roleScreenMappings { get; set; }
        private IEnumerable<ScreenMaster> _screenMasters { get; set; }
        private IEnumerable<WidgetMaster> _widgetMasters { get; set; }

        public LicenseDataModel _licenseData { get; set; }

        public PermissionService(IServiceScopeFactory scopeFactory, LicenseValidator licenseValidator)
        {
            this._scopeFactory = scopeFactory;
            using (var scope = this._scopeFactory.CreateScope())
            {
                _roleService = scope.ServiceProvider.GetRequiredService<IRoleService>();
                _screenMasterService = scope.ServiceProvider.GetRequiredService<IScreenMasterService>();
                _roleScreenMappingService = scope.ServiceProvider.GetRequiredService<IRoleScreenMappingService>();
            }
            _licenseValidator = licenseValidator;
            RefreshPermissionData();
            RefreshWidgetPermissionData();
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

        public async void RefreshWidgetPermissionData()
        {
            _widgetMasters = await _screenMasterService.GetAllWidgetMasters();
        }

        public async void RefreshFloorData()
        {
            _roles = await _roleService.GetRolesForPermissionAsync();
            _screenMasters = await _screenMasterService.GetAllScreenMasters();
            _roleScreenMappings = await _roleScreenMappingService.GetRoleScreenMappings();
        }

        public void RefreshLicenseData()
        {
            _licenseData = new LicenseDataModel();
            string hardwareId = HardwareHelper.GetHardwareId();

            // Define both paths
            string baseDirectory = Directory.GetCurrentDirectory();
            string tempDirectory = Path.Combine(baseDirectory, "License", "LicenseTemp");
            string finalDirectory = Path.Combine(baseDirectory, "License");

            // Check for files in temp directory first, else fallback to final directory
            string licenseFilePath = File.Exists(Path.Combine(tempDirectory, "license.lic"))
                ? Path.Combine(tempDirectory, "license.lic")
                : Path.Combine(finalDirectory, "license.lic");

            string keyFilePath = File.Exists(Path.Combine(tempDirectory, "public-key.pem"))
                ? Path.Combine(tempDirectory, "public-key.pem")
                : Path.Combine(finalDirectory, "public-key.pem");

            var licenseValidity = _licenseValidator.ValidateLicense(licenseFilePath, keyFilePath, hardwareId);
            _licenseData.IsValid = licenseValidity.isValid;

            if (licenseValidity.isValid && licenseValidity.licenseData != null)
            {
                _licenseData.CompanyName = licenseValidity.licenseData.CompanyName?.ToString();
                _licenseData.LicenseType = licenseValidity.licenseData.LicenseType?.ToString();

                if (DateTime.TryParse(licenseValidity.licenseData.ExpiryDate?.ToString(), out DateTime expiry))
                    _licenseData.ExpiryDate = expiry;

                if (DateTime.TryParse(licenseValidity.licenseData.StartDate?.ToString(), out DateTime start))
                    _licenseData.StartDate = start;

                _licenseData.HardwareId = licenseValidity.licenseData.MACAddress?.ToString();

                if (int.TryParse(licenseValidity.licenseData.NumberOfUsers?.ToString(), out int users))
                    _licenseData.NumberOfUsers = users;

                if (int.TryParse(licenseValidity.licenseData.NoOfChannel?.ToString(), out int cameras))
                    _licenseData.NumberOfCameras = cameras;
            }
            else
            {
                _licenseData.ErrorMessage = licenseValidity.errorMessage;
            }
        }

        public bool checkPermission(string roleName, string screenName)
        {
            var role = _roles.FirstOrDefault(x => x.RoleName.ToLower() == roleName.ToLower() || "super admin" == roleName);
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

        public bool CheckWidgetPermission(string roleName, string widgetName, string screenName)
        {
            var role = _roles.FirstOrDefault(x => x.RoleName.Equals(roleName, StringComparison.OrdinalIgnoreCase));
            if (role == null)
            {
                return false;
            }

            string widgetId = _widgetMasters
                .Where(x => x.CategoryName == widgetName)
                .Select(x => x.Id)
                .FirstOrDefault() ?? _widgetMasters
                .SelectMany(x => x.Widgets)
                .Where(w => w.WidgetName == screenName)
                .Select(w => w.WidgetId)
                .FirstOrDefault() ?? string.Empty;

            bool roleScreenMapping = _roleScreenMappings.Any(x => x.RoleId == role.Id &&
                (x.WidgetAccessPermissions.Any(s => s.WidgetCategoryId == widgetId) ||
                 x.WidgetAccessPermissions.Any(p => p.WidgetIds.Contains(widgetId))));

            return roleScreenMapping;
        }

        //public bool CheckWidgetPermission(string roleName, string widgetName)
        //{
        //    var role = _roles.FirstOrDefault(x => x.RoleName.ToLower() == roleName.ToLower());
        //    if (role == null)
        //    {
        //        return false;
        //    }
        //    else
        //    {
        //        string widgetId = "";
        //        widgetId = _widgetMasters.Where(x => x.CategoryName == widgetName).Select(x => x.Id).FirstOrDefault();
        //        if (string.IsNullOrEmpty(widgetId))
        //        {

        //            widgetId = _widgetMasters
        //                            .SelectMany(x => x.Widgets)
        //                            .Where(w => w.WidgetName == widgetName)
        //                            .Select(w => w.WidgetId)
        //                            .FirstOrDefault() ?? "";


        //        }
        //        var roleScreenMapping = _roleScreenMappings.Any(x => x.RoleId == role.Id && 
        //                                 (x.WidgetAccessPermissions.Any(s => s.WidgetCategoryId == widgetId) ||
        //                                 x.WidgetAccessPermissions.Any(x=>x.WidgetIds.Contains(widgetId))));

        //        return roleScreenMapping;
        //    }
        //}

        public IEnumerable<FloorDataAccessPermission> GetFloorZonePermissionByRoles(IEnumerable<string> userRoles)
        {
            var roles = _roles.Where(x => userRoles.Contains(x.RoleName.ToLower())).Select(y => y.Id).ToList();
            IEnumerable<FloorDataAccessPermission> floorZonePermissions = _roleScreenMappings
                                                    .Where(x => roles.Any(y => y == x.RoleId))
                                                    .SelectMany(x => x.DataAccessPermissions).AsEnumerable();

            return floorZonePermissions;
        }
    }
}
