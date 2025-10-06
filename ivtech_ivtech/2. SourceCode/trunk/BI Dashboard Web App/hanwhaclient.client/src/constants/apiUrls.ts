// src/constants/apiUrls.ts
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL;

const AuthEndPoint: string = `${API_BASE_URL}Auth`;
const UsersEndPoint: string = `${API_BASE_URL}Users`;
const RoleEndPoint: string = `${API_BASE_URL}Role`;
const permissionEndPoint: string = `${API_BASE_URL}Permission`;
// const CameraEndPoint: string = `${API_BASE_URL}Camera`;
const DeviceEndPoint: string = `${API_BASE_URL}Device`;
const ZoneEndPoint: string = `${API_BASE_URL}Zone`;
const RoleScreenMappingEndPoint: string = `${API_BASE_URL}RoleScreenMapping`;
const SiteEndPoint: string = `${API_BASE_URL}Site`;
const EmailTemplatesEndPoint: string = `${API_BASE_URL}EmailTemplate`;
const ClientSettingEndPoint: string = `${API_BASE_URL}ClientSetting`;
const LicenseSettingEndpoint: string = `${API_BASE_URL}license`;
const DashboardEndPoint: string = `${API_BASE_URL}DashboardPreference`;
const AuditEndPoint: string = `${API_BASE_URL}AuditLog`;
// const ZoneCameraEndPoint: string = `${API_BASE_URL}ZoneCamera`;
const FloorEndPoint: string = `${API_BASE_URL}Floor`;
const WidgetEndPoint: string = `${API_BASE_URL}Widget`;
const PeopleWidgetEndPoint: string = `${API_BASE_URL}PeopleWidget`;
const MonitoringEndPoint: string = `${API_BASE_URL}Monitoring`;
const ReportEndPoint: string = `${API_BASE_URL}Report`;
const CameraStreamEndPoint: string = `${API_BASE_URL}CameraStream`;
const MongoBackupRestoreEndPoint: string = `${API_BASE_URL}MongoBackupRestore`;
const VideoEndPoint: string = `${API_BASE_URL}Video`;
const SSLCertificateEndPoint: string = `${API_BASE_URL}SSLCertificate`;
const ExceptionEndPoint: string = `${API_BASE_URL}Exception`;

const apiUrls: Record<string, string> = {
  UserLogin: `${AuthEndPoint}/login`,
  RefreshToken: `${AuthEndPoint}/refreshToken`,
  GetAllPermission: `${permissionEndPoint}/GetAllPermission`,
  AddUser: `${UsersEndPoint}`,
  getUserPermission: `${RoleEndPoint}/UserRolePermissions`,
  CreateUser: `${UsersEndPoint}/CreateUser`,
  ChangePassword: `${UsersEndPoint}/ResetPassword`,
  ForgotPassword: `${UsersEndPoint}/ForgotPassword`,
  ForgotResetPassword: `${UsersEndPoint}/ForgotResetPassword`,
  ValidateOtp: `${UsersEndPoint}/ValidateOtp`,
  GetAllRole: `${RoleEndPoint}/GetAllRoles`,
  AddUpdateRole: `${RoleEndPoint}/AddUpdateRole`,
  UpdateRole: `${RoleEndPoint}/UpdateRole`,
  DeleteRole: `${RoleEndPoint}`,
  GetRoleScreen: `${RoleScreenMappingEndPoint}/RoleScreenMappings`,
  AddRolePermissionScreen: `${RoleScreenMappingEndPoint}/AddRolePermission`,
  // AddCamera: `${CameraEndPoint}/AddCamera`,
  // AddFloorPlan: `${CameraEndPoint}/AddFloorPlan`,
  // GetCameraData: `${CameraEndPoint}/GetCameraData`,
  // GetAllFloorPlan: `${CameraEndPoint}/GetAllFloorPlan`,
  // GetAllSite: `${SiteEndPoint}/GetAllSite`,
  // CreateSite: `${SiteEndPoint}/CreateSite`,
  // UpdateSite: `${SiteEndPoint}/UpdateSite`,
  // SiteDelete: `${SiteEndPoint}/SiteDelete`,
  GetEmailTemplates: `${EmailTemplatesEndPoint}`,
  UpdateEmailTemplate: `${EmailTemplatesEndPoint}`,
  SendEmailTemplate: `${EmailTemplatesEndPoint}/TestEmail`,
  ValidateLicenseEndpoint: `${LicenseSettingEndpoint}/ValidateLicense`,
  GetHardwareIdEndpoint: `${LicenseSettingEndpoint}/GetHardwareId`,
  // SaveDashboardDesign: `${DashboardEndPoint}/SaveDashboardDesign`,
  // GetDashboardDesign: `${DashboardEndPoint}/GetDashboardPreference`,
  UploadLicenseKey: `${LicenseSettingEndpoint}/uploadLicenseKey`,
  UploadLicense: `${LicenseSettingEndpoint}/uploadLicense`,
  UploadFullLicense: `${LicenseSettingEndpoint}/UploadFullLicense`,
  GetcurrentLicenseDetail: `${LicenseSettingEndpoint}/LicenseDetail`,
  GetLicensehistory: `${LicenseSettingEndpoint}/LicenseHistory`,
  GetAuditLog: `${AuditEndPoint}/GetAuditLog`,
  GetCollectionList: `${AuditEndPoint}/AuditLogCollectionName`,

  UserResetPassword: `${UsersEndPoint}/UserResetPassword`,
  SaveSmtpSetting: `${ClientSettingEndPoint}/Smpt`,
  UploadClientLogo: `${ClientSettingEndPoint}/uploadClientLogo`,
  SaveOperationalTimeZoneSetting: `${ClientSettingEndPoint}/ClientOperationalTiming`,
  GetClientSettings: `${ClientSettingEndPoint}/ClientSetting`,
  GetTimeZoneDropdownData: `${ClientSettingEndPoint}/ClientTimeZones`,
  // GetClientLogo: `${ClientSettingEndPoint}/Logo`,
  GetFloorZonedata: `${RoleScreenMappingEndPoint}/FloorRoleScreenMappings`,
  SaveFloorZonedata: `${RoleScreenMappingEndPoint}/FloorRolePermission`,
  GetRoleScreenMappingWidgetData: `${RoleScreenMappingEndPoint}/Widget`,
  SaveWidgetsData: `${RoleScreenMappingEndPoint}/Widget`,
  // GetAllFloorPlanList: `${ZoneCameraEndPoint}/GetAllFloorPlan`,
  saveGoogleMapApIKeySetting: `${ClientSettingEndPoint}/GoogleApiKey`,
  SaveFtpSetting: `${ClientSettingEndPoint}/FTPConfiguration`,
  //SaveSSLCertificate: `${ClientSettingEndPoint}/SSLCertificate`,
  SaveSSLCertificate: `${SSLCertificateEndPoint}/SSLCertificateUpload`,
  StreamVideo: `${VideoEndPoint}/StreamVideo`,
  SaveReportSchedulerSetting: `${ClientSettingEndPoint}/ReportSchedule`,
  TurnReportSchedule: `${ClientSettingEndPoint}/TurnReportSchedule`,
  FloorZones: `${FloorEndPoint}/FloorZones`,

  // Zone
  AddUpdateZone: `${ZoneEndPoint}/AddUpdateZone`,
  GetAllZoneByFloorId: `${ZoneEndPoint}/GetAllZoneByFloorId`,
  DeleteZoneById: `${ZoneEndPoint}/DeleteZoneById`,
  AddZonePlanDetail: `${ZoneEndPoint}/ZonePlanDetail`,
  DeleteMappedCamera: `${ZoneEndPoint}/ZoneMappedDevice`,

  // Floor
  GetFloorList: `${FloorEndPoint}`,
  AddFloor: `${FloorEndPoint}`,
  DeleteFloor: `${FloorEndPoint}`,
  AddFloorPlanImage: `${FloorEndPoint}/FloorPlanImage`,
  GetFloorPlanImage: `${FloorEndPoint}/FloorPlanImage`,
  FetchFloorZoneNames: `${FloorEndPoint}/FloorZonesNameByIds`,

  // Devices
  ManageAddDevice: `${DeviceEndPoint}`,
  GetAllDeviceList: `${DeviceEndPoint}/GetAllDevices`,
  DeleteDevices: `${DeviceEndPoint}/DeleteDevices`,
  GetAllDevicewithoutZone: `${DeviceEndPoint}/GetDevicesWithoutZones`,
  GetAllChannels: `${DeviceEndPoint}/GetAllChannels`,
  MapCameraListByFeatures: `${DeviceEndPoint}/MapCameraListByFeatures`,

  // Manage Users
  GetAllUser: `${UsersEndPoint}/GetAllUser`,
  UpdateUser: `${UsersEndPoint}`,
  UserDelete: `${UsersEndPoint}`,

  //Manage Multisite
  AddChildSite: `${SiteEndPoint}/AddOrUpdateChildSite`,
  GetAllSite: `${SiteEndPoint}`,
  AddSubChildSite: `${SiteEndPoint}/AddOrUpdateSubChildSite`,
  DeleteChildSite: `${SiteEndPoint}/DeleteChildSite`,

  //Dashboard
  SaveDashboardName: `${DashboardEndPoint}`,
  GetDashboardDesign: `${DashboardEndPoint}`,
  GetFloorListByPermission: `${FloorEndPoint}/FloorsByPermission`,
  GetZonesListByFloorIdsPermission: `${FloorEndPoint}/FloorZoneByPermission`,

  //Notification
  GetNOtification: `${DashboardEndPoint}/UserNotification`,
  MarkReadUserNotification: `${DashboardEndPoint}/MarkReadUserNotification`,
  UserNotificationCount: `${DashboardEndPoint}/UserNotificationCount`,

  //Monitoring
  GetMonitoringDesign: `${MonitoringEndPoint}/GetMonitoring`,
  SaveMonitoringName: `${MonitoringEndPoint}/AddUpdateMonitoring`,
  AddUpdateGroup: `${MonitoringEndPoint}/AddUpdateGroup`,
  GetGroupAndItemData: `${MonitoringEndPoint}/GetMonitoringGroupAndItem`,
  AddUpdateGroupItem: `${MonitoringEndPoint}/AddUpdateGroupItem`,
  DeleteGroup: `${MonitoringEndPoint}`,
  DeleteMonitoring: `${MonitoringEndPoint}/Monitoring`,

  //Widget
  CameraCountByFeatures: `${WidgetEndPoint}/CameraCountByFeatures`,
  TotalCameraCount: `${WidgetEndPoint}/TotalCameraCount`,
  PeopleCapacityUtilization: `${WidgetEndPoint}/PeopleCapacityUtilization`,
  VehicleByTypeCount: `${WidgetEndPoint}/VehicleByTypeCount`,
  CameraCountByModel: `${WidgetEndPoint}/CameraCountByModel`,
  AveragePeopleCount: `${WidgetEndPoint}/AveragePeopleCount`,
  VehicleQueueAnalysis: `${WidgetEndPoint}/VehicleQueueAnalysis`,
  AveragePeopleCountChart: `${WidgetEndPoint}/AveragePeopleCountChart`,
  CumulativePeopleCountChart: `${WidgetEndPoint}/CumulativePeopleCountChart`,
  PeopleInOutCountChart: `${WidgetEndPoint}/PeopleInOutCountChart`,
  PeopleCameraCapacityUtilizationAnalysisByZones: `${WidgetEndPoint}/PeopleCameraCapacityUtilizationAnalysisByZones`,
  PeopleCameraCapacityUtilizationByZones: `${WidgetEndPoint}/PeopleCameraCapacityUtilizationByZones`,
  PeopleInOutTotal: `${WidgetEndPoint}/PeopleInOutTotal`,
  PeopleInOutChart: `${WidgetEndPoint}/PeopleInOutChart`,
  PedestrianAnalysis: `${WidgetEndPoint}/PedestrianAnalysis`,
  GenderWisePeopleCountAnalysis: `${WidgetEndPoint}/GenderWisePeopleCountAnalysis`,
  SlipFallAnalysis: `${WidgetEndPoint}/SlipFallAnalysis`,
  NewVsTotalVisitorsChart: `${WidgetEndPoint}/NewVsTotalVisitorChart`,
  VehicleCapacityUtilization: `${WidgetEndPoint}/VehicleCapacityUtilization`,
  VehicleCameraCapacityUtilizationAnalysisByZones: `${WidgetEndPoint}/VehicleCameraCapacityUtilizationAnalysisByZones`,
  VehicleByTypeLineChartData: `${WidgetEndPoint}/VehicleByTypeLineChartData`,
  WrongWayAnalysis: `${WidgetEndPoint}/WrongWayAnalysis`,
  VehicleUTurnAnalysis: `${WidgetEndPoint}/VehicleUTurnAnalysis`,
  VehicleCameraCapacityUtilizationByZones: `${WidgetEndPoint}/VehicleCameraCapacityUtilizationByZones`,
  AverageVehicleCount: `${WidgetEndPoint}/AverageVehicleCount`,
  GetAllDeviceData: `${WidgetEndPoint}/GetAllDeviceData`,
  VehicleTurningMovementAnalysis: `${WidgetEndPoint}/VehicleTurningMovementAnalysis`,
  ShoppingCartQueueAnalysis: `${WidgetEndPoint}/ShoppingCartQueueAnalysis`,
  ForkliftQueueAnalysis: `${WidgetEndPoint}/ForkliftQueueAnalysis`,
  PeopleCountByZones: `${WidgetEndPoint}/PeopleCountByZones`,
  VehicleSpeedViolationAnalysis: `${WidgetEndPoint}/VehicleSpeedViolationAnalysis`,
  BlockedExitDetecion: `${WidgetEndPoint}/BlockedExitAnalysis`,
  VehicleInOutChart: `${WidgetEndPoint}/VehicleInOutChart`,
  VehicleInOutTotal: `${WidgetEndPoint}/VehicleInOutTotal`,
  AverageVehicleCountChart: `${WidgetEndPoint}/AverageVehicleCountChart`,
  VehicleInOutCountChart: `${WidgetEndPoint}/VehicleInOutCountChart`,
  TrafficJamAnalysis: `${WidgetEndPoint}/TrafficJamAnalysis`,
  StoppedVehicleCountbyType: `${WidgetEndPoint}/StoppedVehicleByTypeAnalysis`,
  ForkliftCountAnalysis: `${WidgetEndPoint}/ForkliftCountAnalysis`,
  PeopleQueueAnalysis: `${WidgetEndPoint}/PeopleQueueAnalysis`,
  ProxomityDetectionAnalysis: `${WidgetEndPoint}/ProxomityDetectionAnalysis`,
  HeatMapAllDevice: `${DeviceEndPoint}/MapCameraListByFeatures`,
  DeviceByFloorZone: `${DeviceEndPoint}/GetDevicesByFloorAndZones`,
  HeatmapDataByDevice: `${WidgetEndPoint}/HeatMapWidgetData`,
  ForkliftSpeedDetectionAnalysis: `${WidgetEndPoint}/ForkliftSpeedDetectionAnalysis`,
  ShoppingCartCountAnalysis: `${WidgetEndPoint}/ShoppingCartCountAnalysis`,
  WidgetWiseHeatMapAllDevice: `${DeviceEndPoint}/CameraListHeatmap`,

  // Map Widgets
  PeopleCountForMap: `${WidgetEndPoint}/PeopleCountingmap`,
  VehicleCountForMap: `${WidgetEndPoint}/VehicleCountForMap`,
  SlipandFallDetectionForMap: `${WidgetEndPoint}/SlipandFallDetectionForMap`,
  PedestrianDetectionForMap: `${WidgetEndPoint}/PedestrianDetectionForMap`,
  VehicleQueueManagementForMap: `${WidgetEndPoint}/VehicleQueueManagementForMap`,
  VehicleSpeedDetectionForMap: `${WidgetEndPoint}/VehicleSpeedDetectionForMap`,
  TrafficJamDetectionForMap: `${WidgetEndPoint}/TrafficJamDetectionForMap`,
  ShoppingCountForMap: `${WidgetEndPoint}/ShoppingCountForMap`,
  ForkliftCountForMap: `${WidgetEndPoint}/ForkliftCountForMap`,

  //Setting - General
  SaveTimeZoneSetting: `${ClientSettingEndPoint}/ClientOperationalTimeZone`,
  SaveOperationalTimeSetting: `${ClientSettingEndPoint}/ClientOperationalTiming`,
  NewVsTotalVisitorCount: `${WidgetEndPoint}/NewVsTotalVisitorCount`,
  BackupDatabase: `${MongoBackupRestoreEndPoint}`,
  RestoreDatabase: `${MongoBackupRestoreEndPoint}`,

  RestoreChunkDatabase: `${MongoBackupRestoreEndPoint}/chunk`,
  RestoreFinalDatabase: `${MongoBackupRestoreEndPoint}/finalize`,

  //User Profile
  GetUserProfile: `${UsersEndPoint}/UserProfile`,
  UploadProfileImage: `${UsersEndPoint}/UploadProfileImage`,
  SaveUserPreferences: `${UsersEndPoint}/UserPreferences`,

  // People Widget
  GenderWisePeopleCounting: `${PeopleWidgetEndPoint}/GenderWisePeopleCounting`,

  //Event logs
  GetAllEventLogsList: `${DeviceEndPoint}/GetDeviceEventsLogs`,
  UpdateEventLogsStatus: `${DeviceEndPoint}/UpdateDeviceEventsStatus`,

  //Exception logs
  GetAllExceptionLogsList: `${ExceptionEndPoint}/GetExceptionLogs`,

  //reports
  GetAllReports: `${ReportEndPoint}/GetAllReport`,
  AddEditReports: `${ReportEndPoint}/AddUpdateReport`,
  DeleteReport: `${ReportEndPoint}`,
  GenerateReportPDF: `${ReportEndPoint}/GenerateReportPDF`,
  GetReportDetailsbyId: `${ReportEndPoint}/GenerateReportById`,
  GetAllFloorBySiteId: `${ReportEndPoint}/GetAllFloorBySiteId`,
  GetAllZoneBySiteId: `${ReportEndPoint}/GetAllZoneBySiteId`,

  CameraStream: `${CameraStreamEndPoint}`,
};

export default apiUrls;
