using HanwhaClient.Model.DbEntities;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Model.Common
{
    public static class ScreenMasterNewList
    {
        public static List<ScreenMaster> GetAllScreen()
        {
            List<ScreenMaster> screens = new List<ScreenMaster>
            {
                      #region Settings Menu

                      // User Master screens
                      new ScreenMaster { Id = "60c72b2f9b1d8e001f8e4b1a", ScreenName = ScreenNames.UserMaster, IsActive = true, ParentsScreenId = null, SequenceNo = 1 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.AddOrUpdateUser, IsActive = true, ParentsScreenId = "60c72b2f9b1d8e001f8e4b1a", SequenceNo = 3 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.DeleteUser, IsActive = true, ParentsScreenId = "60c72b2f9b1d8e001f8e4b1a", SequenceNo = 4 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.ViewUser, IsActive = true, ParentsScreenId = "60c72b2f9b1d8e001f8e4b1a", SequenceNo = 4 },
                     
                      // Role Master screens
                      new ScreenMaster { Id = "60c72b2f9b1d8e001f8e4b3a", ScreenName = ScreenNames.RoleMaster, IsActive = true, ParentsScreenId = null, SequenceNo = 9 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.ViewListofRoles, IsActive = true, ParentsScreenId = "60c72b2f9b1d8e001f8e4b3a", SequenceNo = 13 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.AddorUpdateRole, IsActive = true, ParentsScreenId = "60c72b2f9b1d8e001f8e4b3a", SequenceNo = 14 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.DeleteRole, IsActive = true, ParentsScreenId = "60c72b2f9b1d8e001f8e4b3a", SequenceNo = 12 },
            
                      // Permission Master screens
                      new ScreenMaster { Id = "68500fbddf765e270dd495bb", ScreenName = ScreenNames.PermissionMaster, IsActive = true, ParentsScreenId = null, SequenceNo = 9 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.ScreenPermission, IsActive = true, ParentsScreenId = "68500fbddf765e270dd495bb", SequenceNo = 13 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.FloorZonePermission, IsActive = true, ParentsScreenId = "68500fbddf765e270dd495bb", SequenceNo = 13 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.WidgetPermission, IsActive = true, ParentsScreenId = "68500fbddf765e270dd495bb", SequenceNo = 13 },

                       // Multi-Site Setup Master screens
                      new ScreenMaster { Id = "70c72b2f9b1d8e001f8e8c5c", ScreenName = ScreenNames.SiteMaster, IsActive = true, ParentsScreenId = null, SequenceNo = 63 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.ViewChildSubChildSite, IsActive = true, ParentsScreenId = "70c72b2f9b1d8e001f8e8c5c", SequenceNo = 49 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.AddOrUpdateChildSubChildSite, IsActive = true, ParentsScreenId = "70c72b2f9b1d8e001f8e8c5c", SequenceNo = 51},
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.DeleteChildSubChildSite, IsActive = true, ParentsScreenId = "70c72b2f9b1d8e001f8e8c5c", SequenceNo = 49 },

                      // General Master screens
                      new ScreenMaster { Id = "70c72b2f9b1d8e001f8e6b9c", ScreenName = ScreenNames.GeneralMaster, IsActive = true, ParentsScreenId = null, SequenceNo = 43 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.ViewSmtpConfigurations, IsActive = true, ParentsScreenId = "70c72b2f9b1d8e001f8e6b9c", SequenceNo = 44 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.ViewReportScheduler, IsActive = true, ParentsScreenId = "70c72b2f9b1d8e001f8e6b9c", SequenceNo = 44 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.ViewFTPConfigurations, IsActive = true, ParentsScreenId = "70c72b2f9b1d8e001f8e6b9c", SequenceNo = 44 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.ViewCompanyConfigurations, IsActive = true, ParentsScreenId = "70c72b2f9b1d8e001f8e6b9c", SequenceNo = 44 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.ViewSSLConfigurations, IsActive = true, ParentsScreenId = "70c72b2f9b1d8e001f8e6b9c", SequenceNo = 44 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.ViewOPTimeConfigurations, IsActive = true, ParentsScreenId = "70c72b2f9b1d8e001f8e6b9c", SequenceNo = 44 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.ViewGoogleMapKeyConfigurations, IsActive = true, ParentsScreenId = "70c72b2f9b1d8e001f8e6b9c", SequenceNo = 44 },

                       // License Master screens
                      new ScreenMaster { Id = "60c72b2f9b1d8e001f8e4b4a", ScreenName = ScreenNames.LicenseMaster, IsActive = true, ParentsScreenId = null, SequenceNo = 16 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.ViewLicenseDetailHistory, IsActive = true, ParentsScreenId = "60c72b2f9b1d8e001f8e4b4a", SequenceNo = 17 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.CanAddOrUpdateLicense, IsActive = true, ParentsScreenId = "60c72b2f9b1d8e001f8e4b4a", SequenceNo = 18 },
                      
                      
                      // Backup & Restore Master screens
                      new ScreenMaster { Id = "60c72b2f9b1d8e001f8e5c5a", ScreenName = ScreenNames.BackupRestoreMaster, IsActive = true, ParentsScreenId = null, SequenceNo = 16 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.CanTakeFullDBBackup, IsActive = true, ParentsScreenId = "60c72b2f9b1d8e001f8e5c5a", SequenceNo = 18 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.CanRestoreDatabase, IsActive = true, ParentsScreenId = "60c72b2f9b1d8e001f8e5c5a", SequenceNo = 18 },

                      // App Notifications Master screens
                      new ScreenMaster { Id = "68500fbcdf765e270dd49571", ScreenName = ScreenNames.AppNotificationsMaster, IsActive = true, ParentsScreenId = null, SequenceNo = 16 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.ViewListofNotifications, IsActive = true, ParentsScreenId = "68500fbcdf765e270dd49571", SequenceNo = 18 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.AcknowledgeNotification, IsActive = true, ParentsScreenId = "68500fbcdf765e270dd49571", SequenceNo = 18 },

                      #endregion

                      #region Monitoring Menu

                      // Monitoring Master Screens
                      new ScreenMaster { Id = "70c72b2f9b1d8e001f8e8c5d", ScreenName = ScreenNames.MonitoringMaster, IsActive = true, ParentsScreenId = null, SequenceNo = 63 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.ViewListofMonitorings, IsActive = true, ParentsScreenId = "70c72b2f9b1d8e001f8e8c5d", SequenceNo = 48 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.AddOrUpdateMonitoring, IsActive = true, ParentsScreenId = "70c72b2f9b1d8e001f8e8c5d", SequenceNo = 48 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.DeleteMonitoring, IsActive = true, ParentsScreenId = "70c72b2f9b1d8e001f8e8c5d", SequenceNo = 48 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.ViewListofMonitoringGroups, IsActive = true, ParentsScreenId = "70c72b2f9b1d8e001f8e8c5d", SequenceNo = 49 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.AddOrUpdateGroup, IsActive = true, ParentsScreenId = "70c72b2f9b1d8e001f8e8c5d", SequenceNo = 50 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.DeleteMonitoringGroup, IsActive = true, ParentsScreenId = "70c72b2f9b1d8e001f8e8c5d", SequenceNo = 51},
                      //new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.ViewURLPreviewsofMonitoringGroup, IsActive = true, ParentsScreenId = "70c72b2f9b1d8e001f8e8c5d", SequenceNo = 48 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.AddOrUpdateURLPreview, IsActive = true, ParentsScreenId = "70c72b2f9b1d8e001f8e8c5d", SequenceNo = 48 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.DeleteURLPreviewMonitoring, IsActive = true, ParentsScreenId = "70c72b2f9b1d8e001f8e8c5d", SequenceNo = 48 },

                      #endregion

                      #region  Report Menu

                      // Report Master screens
                      new ScreenMaster { Id = "676e44ab7e0a52005113b50e", ScreenName = ScreenNames.ReportMaster, IsActive = true, ParentsScreenId = null, SequenceNo = 34 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.ViewListofReports, IsActive = true, ParentsScreenId = "676e44ab7e0a52005113b50e", SequenceNo = 35 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.AddOrUpdateReport, IsActive = true, ParentsScreenId = "676e44ab7e0a52005113b50e", SequenceNo = 35 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.DeleteReport, IsActive = true, ParentsScreenId = "676e44ab7e0a52005113b50e", SequenceNo = 36 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.ExportReport, IsActive = true, ParentsScreenId = "676e44ab7e0a52005113b50e", SequenceNo = 36 },

                      #endregion

                      // Event Master screens
                      new ScreenMaster { Id = "67b6f710136999ea6c5cbc26", ScreenName = ScreenNames.EventMaster, IsActive = true, ParentsScreenId = null, SequenceNo = 34 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.ViewListofEvents, IsActive = true, ParentsScreenId = "67b6f710136999ea6c5cbc26", SequenceNo = 35 },  // Dashboard Preference Master screens
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.ViewEventVideo, IsActive = true, ParentsScreenId = "67b6f710136999ea6c5cbc26", SequenceNo = 35 },  // Dashboard Preference Master screens
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.AcknowledgeEvent, IsActive = true, ParentsScreenId = "67b6f710136999ea6c5cbc26", SequenceNo = 35 },  // Dashboard Preference Master screens

                      #region  Configurations Menu

                      // Device Master screens
                      new ScreenMaster { Id = "70c72b2f9b1d8e001f8e8b5b", ScreenName = ScreenNames.DeviceMaster, IsActive = true, ParentsScreenId = null, SequenceNo = 46 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.ViewListofDevices, IsActive = true, ParentsScreenId = "70c72b2f9b1d8e001f8e8b5b", SequenceNo = 49 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.AddOrUpdateDevices, IsActive = true, ParentsScreenId = "70c72b2f9b1d8e001f8e8b5b", SequenceNo = 49 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.DeleteDevices, IsActive = true, ParentsScreenId = "70c72b2f9b1d8e001f8e8b5b", SequenceNo = 51},

                       // Floor Plan And Zone Master screens
                      new ScreenMaster { Id = "70c72b2f9b1d8e001f8e8c6b", ScreenName = ScreenNames.FloorPlanAndZoneMaster, IsActive = true, ParentsScreenId = null, SequenceNo = 52 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.ViewListofFloors, IsActive = true, ParentsScreenId = "70c72b2f9b1d8e001f8e8c6b", SequenceNo = 54 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.AddOrUpdateFloor, IsActive = true, ParentsScreenId = "70c72b2f9b1d8e001f8e8c6b", SequenceNo = 54 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.DeleteFloor, IsActive = true, ParentsScreenId = "70c72b2f9b1d8e001f8e8c6b", SequenceNo = 56 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.ViewListofZones, IsActive = true, ParentsScreenId = "70c72b2f9b1d8e001f8e8c6b", SequenceNo = 54 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.AddUpdateZone, IsActive = true, ParentsScreenId = "70c72b2f9b1d8e001f8e8c6b", SequenceNo = 58 },
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.DeleteZone, IsActive = true, ParentsScreenId = "70c72b2f9b1d8e001f8e8c6b", SequenceNo = 60},
                      new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.ConfigureFloorPlanZoneMapCamera, IsActive = true, ParentsScreenId = "70c72b2f9b1d8e001f8e8c6b", SequenceNo = 60},
                      //new ScreenMaster { Id = ObjectId.GenerateNewId().ToString(), ScreenName = ScreenNames.CanMapCamera, IsActive = true, ParentsScreenId = "70c72b2f9b1d8e001f8e8c6b", SequenceNo = 61 },

                      #endregion

            };

            return screens;
        }
    }
}
