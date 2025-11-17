using HanwhaClient.Model.DbEntities;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Numerics;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Model.Common
{
    public static class ScreenNames
    {
        //User
        public const string UserMaster = "Manage Users";
        public const string ViewUser = "View List of Users";
        public const string AddOrUpdateUser = "Add or Update User Details";
        public const string DeleteUser = "Delete an Existing User";

        //Role
        public const string RoleMaster = "Role";
        public const string ViewListofRoles = "View List of Roles";
        public const string AddorUpdateRole = "Add or Update Role";
        public const string DeleteRole = "Delete an Existing Role";

        //Permission
        public const string PermissionMaster = "Permission";
        public const string ScreenPermission = "View and Assign Screen-Level Permissions";
        public const string FloorZonePermission = "View and Assign Floor & Zone-Level Permissions";
        public const string WidgetPermission = "View and Assign Widget-Level Permissions";

        //License
        public const string LicenseMaster = "License";
        public const string ViewLicenseDetailHistory = "View License Details and History";
        public const string CanAddOrUpdateLicense = "Upload a New License";

        //Audit
        public const string AuditMaster = "Audit";
        public const string CanViewFloorPlanCamera = "Can View Floor Plan Camera";
        public const string CanAddOrUpdateFloorPlanCamera = "Can Add Or Update Floor Plan Camera";
        public const string PeopleCountMaster = "People Count";
        public const string CanViewPeopleCameraCount = "Can View People Camera Count";

        //Manage Devices
        public const string DeviceMaster = "Manage Devices";
        public const string ViewListofDevices = "View List of Devices";
        public const string AddOrUpdateDevices = "Add or Update Device";
        public const string DeleteDevices = "Delete an Existing Device";

        //Floor Plans & Zones
        public const string FloorPlanAndZoneMaster = "Floor Plans & Zones";
        public const string ViewListofFloors = "View List of Floors";
        public const string AddOrUpdateFloor = "Add or Update Floor";
        public const string DeleteFloor = "Delete an Existing Floor";
        public const string ViewListofZones = "View List of Zones";
        public const string AddUpdateZone = "Add or Update Zone";
        public const string DeleteZone = "Delete an Existing Zone";
        public const string ConfigureFloorPlanZoneMapCamera = "Configure Floor Plan Image, Create Zones, and Map Cameras to Zones";

        //Multisite Setup
        public const string SiteMaster = "Multisite Setup";
        public const string ViewChildSubChildSite = "View List of Child and Sub-Child Sites";
        public const string AddOrUpdateChildSubChildSite = "Add or Update Child and Sub-Child Sites";
        public const string DeleteChildSubChildSite = "Delete an Existing Child or Sub-Child Site";

        //Event Logs
        public const string EventMaster = "Event Logs";
        public const string ViewListofEvents = "View List of Events";
        public const string ViewEventVideo = "View Event Video";
        public const string AcknowledgeEvent = "Acknowledge Event";

        //Monitoring
        public const string MonitoringMaster = "Monitoring";
        public const string ViewListofMonitorings = "View List of Monitorings";
        public const string AddOrUpdateMonitoring = "Add or Update Monitoring";
        public const string DeleteMonitoring = "Delete an Existing Monitoring";
        public const string ViewListofMonitoringGroups = "View List of Monitoring Groups";
        public const string AddOrUpdateGroup = "Add or Update Monitoring Group";
        public const string DeleteMonitoringGroup = "Delete an Existing Monitoring Group";
       // public const string ViewURLPreviewsofMonitoringGroup = "View List of URL Previews of Monitoring Group";
        public const string AddOrUpdateURLPreview = "Add or Update URL Preview of Monitoring Group";
        public const string DeleteURLPreviewMonitoring = "Delete an Existing URL Preview of Monitoring Group";

        //Reports
        public const string ReportMaster = "Reports";
        public const string ViewListofReports = "View List of Reports";
        public const string AddOrUpdateReport = "Add or Update Report";
        public const string DeleteReport = "Delete an Existing Report";
        public const string ExportReport = "Export Report";

        //General
        public const string GeneralMaster = "General";
        public const string ViewSmtpConfigurations = "View and Configure SMTP Setup Details";
        public const string ViewReportScheduler = "View and Configure Report Scheduler";
        public const string ViewFTPConfigurations = "View and Configure FTP Setup Details";
        public const string ViewCompanyConfigurations = "View and Configure Company Logo";
        public const string ViewSSLConfigurations = "View and Configure SSL Certificate";
        public const string ViewOPTimeConfigurations = "View and Configure Operational Time";
        public const string ViewGoogleMapKeyConfigurations = "View and Configure Google Map Key";

        //Backup & Restore
        public const string BackupRestoreMaster = "Backup & Restore";
        public const string CanTakeFullDBBackup = "Take a Full System Backup";
        public const string CanRestoreDatabase = "Restore a Full System Backup";

        //App Notifications
        public const string AppNotificationsMaster = "App Notifications";
        public const string ViewListofNotifications = "View List of Notifications";
        public const string AcknowledgeNotification = "Acknowledge Notification";

        #region Widget Screen Name

        //Camera
        public const string Camera = "Camera";
        public const string CameraOnlineOffline = "Camera Online/ Offline";
        public const string ModalTypes = "Modal Types";
        public const string FeatureTypes = "Feature Types";

        //Site
        public const string Site = "Site";
        public const string CapacityUtilizationForPeople = "Capacity Utilization for People";
        public const string CapacityUtilizationForVehicle = "Capacity Utilization for Vehicle";
        public const string ZoneWiseCapacityUtilizationForPeople = "Zone Wise Capacity Utilization for People";
        public const string ZoneWiseCapacityUtilizationForVehicle = "Zone Wise Capacity Utilization for Vehicle";

        //People
        public const string People = "People";
        public const string PeopleInOut = "People In Out";
        public const string AveragePeopleCounting = "Average People Counting";
        public const string PeopleCountByGender = "People Count By Gender";
        public const string CumulativePeopleCount = "Cumulative People Count";
        public const string NewVsTotalVisiotr = "New Vs Total Visiotr";
        public const string SafetyMeasure = "Safety Measure";
        public const string ZoneWisePeopleCounting = "Zone Wise People Counting";
        public const string SlipAndFallDetection = "Slip & Fall Detection";
        public const string PeopleCountingHeatmap = "People Counting Heatmap";

        // Retail
        public const string Retail = "Retail";
        public const string ShoppingCartCounting = "Shopping Cart Counting";
        public const string QueueEventForShopingCart = "Queue Event For Shoping Cart";
        public const string QueueEventForPeple = "Queue Event For People";
        public const string ShopingCartHeatmap = "Shoping Cart Heatmap";
        public const string BlockedExitDetection = "Blocked Exit Detection";
        
        // Vehicle
        public const string Vehicle = "Vehicle";
        public const string VehicleCountByType = "Vehicle Count By Type";
        public const string VehicleInOut = "Vehicle In Out";
        public const string AverageVehicleCounting = "Average Vehicle Counting";
        public const string VehicleDetectionHeatmap = "Vehicle Detection Heatmap";

        //Factory
        public const string Factory = "Factory";
        public const string CountingForForklift = "Counting For Forklift";
        public const string QueueEventsForForklift = "Queue Events For Forklift";
        public const string BlockedExitDetectionFactory = "Blocked Exit Detection";
        public const string DetectForklift = "Detect Forklift";
        public const string ForkliftHeatmap = "Forklift Heatmap";
        public const string ForkliftSpeedDetection = "Forklift Speed Detection";

        // Floor and Map Plan
        public const string MapFloorPlan = "Map Floor Plan";
        public const string MapPlan = "Map Plan";
        public const string FloorPlan = "Floor Plan";

        public const string AdvanceExportReportMaster = "Advance Export Report";
        public const string CanDownloadPDFReports = "Can Download PDF Reports";
        public const string CanDownloadCSVReports = "Can Download CSV Reports";

        //Traffic
        public const string Traffic = "Traffic";
        public const string VehicleInWrongDirection = "Vehicle In Wrong Direction";
        public const string VehicleUTurnDetection = "Vehicle U Turn Detection";
        public const string PedestrianDetection = "Pedestrian Detection";
        public const string VehicleQueueAnalysis = "Vehicle Queue Analysis";
        public const string StoppedVehicleCountTime = "Stopped Vehicle Count Time";
        public const string VehicleTurningMovementCounts = "Vehicle Turning Movement Counts";
        public const string SpeedViolationByVehicle = "Speed Violation By Vehicle";
        public const string TrafficJamByDay = "Traffic Jam By Day";
        #endregion
   
    }
}
