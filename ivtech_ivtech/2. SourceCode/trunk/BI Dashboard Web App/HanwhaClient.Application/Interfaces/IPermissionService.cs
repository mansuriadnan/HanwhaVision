using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.License;
using HanwhaClient.Model.Role;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Application.Interfaces
{
    public interface IPermissionService
    {
        LicenseDataModel _licenseData { get; set; }
        bool checkPermission(string roleName, string screenName);
        bool CheckWidgetPermission(string roleName, string widgetName, string screenName);
        void RefreshPermissionData();
        void RefreshLicenseData();
        IEnumerable<FloorDataAccessPermission> GetFloorZonePermissionByRoles(IEnumerable<string> userRoles);
        void RefreshWidgetPermissionData();
    }
}
