using HanwhaAdminApi.Model.DbEntities;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Diagnostics.Metrics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaAdminApi.Model.Common
{
    public static class ScreenMasterNewList
    {

        public static List<ScreenMaster> GetAllScreen()
        {
            List<ScreenMaster> screens = new List<ScreenMaster>
            {
                      // User Master screens
                      new ScreenMaster { Id = "60c72b2f9b1d8e001f8e4b1a", ScreenName = ScreenNames.UserMaster, IsActive = true, ParentsScreenId = null, SequenceNo = 1 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.CanViewUser, IsActive = true, ParentsScreenId = "60c72b2f9b1d8e001f8e4b1a", SequenceNo = 2 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.CanAddOrUpdateUser, IsActive = true, ParentsScreenId = "60c72b2f9b1d8e001f8e4b1a", SequenceNo = 3 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.CanDeleteUser, IsActive = true, ParentsScreenId = "60c72b2f9b1d8e001f8e4b1a", SequenceNo = 4 },
            
                      // Role Master screens
                      new ScreenMaster { Id = "60c72b2f9b1d8e001f8e4b3a", ScreenName = ScreenNames.RoleMaster, IsActive = true, ParentsScreenId = null, SequenceNo = 9 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.CanViewRole, IsActive = true, ParentsScreenId = "60c72b2f9b1d8e001f8e4b3a", SequenceNo = 10 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.CanAddOrUpdateRole, IsActive = true, ParentsScreenId = "60c72b2f9b1d8e001f8e4b3a", SequenceNo = 13 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.CanDeleteRole, IsActive = true, ParentsScreenId = "60c72b2f9b1d8e001f8e4b3a", SequenceNo = 12 },
            
                      // Permissions Master screens
                      new ScreenMaster { Id = "60c72b2f9b1d8e001f8e4b5a", ScreenName = ScreenNames.PermissionsMaster, IsActive = true, ParentsScreenId = null, SequenceNo = 19 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.CanViewPermission, IsActive = true, ParentsScreenId = "60c72b2f9b1d8e001f8e4b5a", SequenceNo = 20 },
            
            
                      // Distributor Master screens
                      new ScreenMaster { Id = "70c72b2f9b1d8e001f8e3a3c", ScreenName = ScreenNames.DistributorMaster, IsActive = true, ParentsScreenId = null, SequenceNo = 50 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.CanViewDistributor, IsActive = true, ParentsScreenId = "70c72b2f9b1d8e001f8e3a3c", SequenceNo = 51 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.CanAddOrUpdateDistributor, IsActive = true, ParentsScreenId = "70c72b2f9b1d8e001f8e3a3c", SequenceNo = 52 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.CanDeleteDistributor, IsActive = true, ParentsScreenId = "70c72b2f9b1d8e001f8e3a3c", SequenceNo = 53 },

                      // License & Customer screens
                      new ScreenMaster { Id = "60c72b2f9b1d8e001f8e9a7d", ScreenName = ScreenNames.CustomerLicenseMaster, IsActive = true, ParentsScreenId = null, SequenceNo = 54 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.CanViewCustomer, IsActive = true, ParentsScreenId = "60c72b2f9b1d8e001f8e9a7d", SequenceNo = 57 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.CanAddOrUpdateCustomer, IsActive = true, ParentsScreenId = "60c72b2f9b1d8e001f8e9a7d", SequenceNo = 58 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.CanDeleteCustomer, IsActive = true, ParentsScreenId = "60c72b2f9b1d8e001f8e9a7d", SequenceNo = 59 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.CanViewLicense, IsActive = true, ParentsScreenId = "60c72b2f9b1d8e001f8e9a7d", SequenceNo = 54 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.CanGenerateLicense, IsActive = true, ParentsScreenId = "60c72b2f9b1d8e001f8e9a7d", SequenceNo = 55 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.DownloadTheLicenseFile, IsActive = true, ParentsScreenId = "60c72b2f9b1d8e001f8e9a7d", SequenceNo = 55 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.ResendLicenseEmailDistributor, IsActive = true, ParentsScreenId = "60c72b2f9b1d8e001f8e9a7d", SequenceNo = 55 },


            };

            return screens;
        }
    }
}
