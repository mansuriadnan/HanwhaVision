// src/constants/apiUrls.ts
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AuthEndPoint: string = `${API_BASE_URL}Auth`;
const UsersEndPoint: string = `${API_BASE_URL}Users`;
const RoleEndPoint: string = `${API_BASE_URL}Role`;
const permissionEndPoint: string = `${API_BASE_URL}Permission`;
const CameraEndPoint: string = `${API_BASE_URL}Camera`;
const RoleScreenMappingEndPoint: string = `${API_BASE_URL}RoleScreenMapping`;
const SiteEndPoint: string = `${API_BASE_URL}Site`;
const CustomerEndPoint: string = `${API_BASE_URL}Customer`;
const LicenceEndPoint: string = `${API_BASE_URL}license`;
const RegionEndPoint: string = `${API_BASE_URL}Region`;
const DistributorEndPoint: string = `${API_BASE_URL}Distributor`;

const apiUrls: Record<string, string> = {
  UserLogin: `${AuthEndPoint}/login`,
  RefreshToken: `${AuthEndPoint}/refreshToken`,
  GetAllPermission: `${permissionEndPoint}/GetAllPermission`,
  GetAllUser: `${UsersEndPoint}/GetAllUser`,
  UserDelete: `${UsersEndPoint}`,
  UpdateUser: `${UsersEndPoint}`,
  AddUser: `${UsersEndPoint}`,
  getUserPermission: `${RoleEndPoint}/UserRolePermission`,
  CreateUser: `${UsersEndPoint}/CreateUser`,
  ChangePassword: `${UsersEndPoint}/ResetPassword`,
  ForgotPassword: `${UsersEndPoint}/ForgotPassword`,
  ForgotResetPassword: `${UsersEndPoint}/ForgotResetPassword`,
  ValidateOtp: `${UsersEndPoint}/ValidateOtp`,
  GetAllRole: `${RoleEndPoint}/GetAllRole`,
  CreateRole: `${RoleEndPoint}/CreateRole`,
  UpdateRole: `${RoleEndPoint}/UpdateRole`,
  DeleteRole: `${RoleEndPoint}`,
  GetRoleScreen: `${RoleScreenMappingEndPoint}/RoleScreenMappings`,
  AddRolePermissionScreen: `${RoleScreenMappingEndPoint}/AddRolePermission`,
  AddCamera: `${CameraEndPoint}/AddCamera`,
  GetCameraData: `${CameraEndPoint}/GetCameraData`,
  GetAllSite: `${SiteEndPoint}/GetAllSite`,
  CreateSite: `${SiteEndPoint}/CreateSite`,
  UpdateSite: `${SiteEndPoint}/UpdateSite`,
  SiteDelete: `${SiteEndPoint}/SiteDelete`,
  GetAllCustomer: `${CustomerEndPoint}/GetAllCustomer`,
  GetTopCustomer: `${CustomerEndPoint}/TopCustomer`,
  TopLicenseDue: `${CustomerEndPoint}/TopLicenseDue`,
  DashboardOverview: `${CustomerEndPoint}/DashboardOverview`,
  UpdateCustomer: `${CustomerEndPoint}`,
  AddCustomer: `${CustomerEndPoint}`,
  DeleteCustomer: `${CustomerEndPoint}`,
  GetAllLicence: `${LicenceEndPoint}/GetAllLicenseRequest`,
  GetLicenceByID: `${LicenceEndPoint}/client`,
  UpdateLicence: `${LicenceEndPoint}/licenserequest`,
  AddLicence: `${LicenceEndPoint}/licenserequest`,
  licenseGenerate: `${LicenceEndPoint}/GenerateLicense`,
  GenerateLicense: `${LicenceEndPoint}/GenerateLicense`,
  ResendLicense: `${LicenceEndPoint}/ResendLicense`,
  DownloadLicense: `${LicenceEndPoint}/DownloadLicense`,
  GetAllCountries: `${RegionEndPoint}/GetAllCountries`,
  GetStatesByCountry: `${RegionEndPoint}/GetStatesByCountry`,
  GetCities: `${RegionEndPoint}/GetCities`,
  GetAllDistributor: `${DistributorEndPoint}`,
  AddUpdateDistributor: `${DistributorEndPoint}`,
  DeleteDistributor: `${DistributorEndPoint}`,
  GetUserProfile: `${UsersEndPoint}/UserProfile`,
  UploadProfileImage: `${UsersEndPoint}/UploadProfileImage`,
  SendOtp: `${UsersEndPoint}/SendOtp`,
};

export default apiUrls;
