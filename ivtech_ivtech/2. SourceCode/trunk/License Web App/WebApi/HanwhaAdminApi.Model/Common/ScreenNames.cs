using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaAdminApi.Model.Common
{
    public static class ScreenNames
    {
        public const string UserMaster = "Users";
        public const string CanViewUser = "View the list of users";
        public const string CanAddOrUpdateUser = "Add or update user details";
        public const string CanDeleteUser = "Delete an existing user";

        public const string RoleMaster = "Roles";
        public const string CanViewRole = "View the list of roles";
        public const string CanAddOrUpdateRole = "Add or update role details";
        public const string CanDeleteRole = "Delete an existing role";

        public const string PermissionsMaster = "Permissions";
        public const string CanViewPermission = "View and update permissions for a specific role";

        public const string DistributorMaster = "Distributors";
        public const string CanViewDistributor = "View the list of distributors";
        public const string CanAddOrUpdateDistributor = "Add or update distributor details";
        public const string CanDeleteDistributor = "Delete an existing distributor";

        public const string CustomerLicenseMaster = "Customers & Licenses";
        public const string CanViewCustomer = "View the list of customers";
        public const string CanAddOrUpdateCustomer = "Add or update customer details";
        public const string CanDeleteCustomer = "Delete an existing customer";
        public const string CanViewLicense = "View license details";
        public const string CanGenerateLicense = "Generate or upgrade a license";
        public const string DownloadTheLicenseFile = "Download the license file";
        public const string ResendLicenseEmailDistributor = "Resend the license email to the distributor";
    }
}
