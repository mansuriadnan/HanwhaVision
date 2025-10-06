using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace HanwhaClient.Model.Common
{
    public class AppMessageConstants
    {
        //public const string InsertUpdateSuccess = "Record saved successfully.";
        //public const string AuditLogDataRetrieved = "Audit log data retrieved successfully.";
        //public const string AuditLogCollectionNameRetrieved = "Audit log collection name retrieved successfully.";
        //public const string ErrorProcessingData = "An error occurred while processing data.";
        //public const string RecordSuccessfullyInserted = "Record inserted successfully.";
        //public const string CameraDataRetrieved = "Camera data retrieved successfully.";
        //public const string ClientSavedSuccessfully = "Client saved successfully.";
        //public const string ClientNotFound = "Client not found.";
        //public const string ClientDataRetrieved = "Client data retrieved successfully.";
        //public const string FileUploadSuccess = "File uploaded successfully.";
        //public const string LogoRetrieved = "Logo retrieved successfully.";
        //public const string SmtpSaved = "SMTP settings saved successfully.";
        //public const string CustomerRetrieved = "Customer data retrieved successfully.";
        //public const string CustomerCreated = "Customer created successfully.";
        //public const string CustomersCreated = "Customers created successfully.";
        //public const string CustomerUpdated = "Customer updated successfully.";
        //public const string DeviceDeleted = "Device deleted successfully.";
        //public const string DashboardSaved = "Dashboard saved successfully.";
        //public const string DashboardRetrieved = "Dashboard data retrieved successfully.";
        //public const string EmailTemplatesRetrieved = "Email templates retrieved successfully.";
        //public const string EmailTemplateSaved = "Email template saved successfully.";
        //public const string EmailTemplateSaveError = "Failed to save email template.";
        //public const string EmailSent = "Email sent successfully.";
        //public const string EmailSendError = "Failed to send email.";
        //public const string LicenseGenerated = "License generated successfully.";
        //public const string LicenseGenerationError = "Error generating license.";
        //public const string LicenseRequestSaved = "License request saved successfully.";
        //public const string LicenseRequestError = "Error saving license request.";
        //public const string FileUploadError = "Failed to upload file.";
        //public const string HardwareIdFetched = "Hardware ID fetched successfully.";
        //public const string RoleDeleted = "Role deleted successfully.";
        //public const string RoleNotFound = "Role not found.";
        //public const string PermissionSaved = "Role permissions saved successfully.";
        //public const string PermissionRetrieved = "Role permissions retrieved successfully.";
        //public const string FileUploaded = "File uploaded successfully.";
        //public const string NoRoleRecords = "No records found for the specified role.";
        //public const string UserDataRetrievedSuccessfully = "User data retrieved successfully.";
        //public const string UserSavedSuccessfully = "User saved successfully.";
        //public const string UserNotFound = "User not found.";
        //public const string UserDeletedSuccessfully = "User deleted successfully.";
        //public const string DashboardDeletedSuccessfully = "Dashboard deleted successfully.";
        //public const string RecordNotDeletedSuccessfully = "Failed to delete record.";
        //public const string AddCameraSuccess = "Camera updated successfully.";
        //public const string DeleteCamera = "Camera deleted successfully.";
        //public const string DataRetrieved = "Data retrieved successfully.";
        //public const string OperationalTimingSave = "Operational timing saved successfully.";
        //public const string ConfigureTImeZone = "Time Zone saved successfully.";
        //public const string RecordFoundButNotUpdated = "Record found, but no change was made";
        //public const string MonitoringSaved = "Monitoring saved successfully.";
        //public const string MonitoringGroupSaved = "Monitoring group saved successfully.";
        //public const string MonitoringGroupItemSaved = "Monitoring group item saved successfully.";
        //public const string ReportsSaved = "Report saved successfully.";
        //public const string UserPreferencesSaved = "User Preferences Saved successfully.";

        public const string LicenseAuthenticated = "License has been authenticated successfully.";
        public const string RoleExists = "This role is already assigned to another user.";
        public const string OtpSuccessfullyValidated = "The OTP has been successfully validated.";
        public const string OtpExpiredOrInvalid = "The OTP has expired or is invalid. Please request a new one to continue.";
        public const string OtpSuccessfullySentToEmail = "An OTP has been sent to your registered email address.";
        public const string EmailNotRegistered = "The provided email address is not registered.";
        public const string PasswordSuccessfullyReset = "Your password has been reset successfully.";
        public const string OldPasswordDoesNotMatch = "The old password you entered does not match our records.";
        public const string InvalidDataModel = "The provided data model is invalid.";
        public const string UnauthorizedAccessResource = "You are not authorized to access this resource.";
        public const string InsufficientPermissions = "You do not have the necessary permissions to perform this action.";
        public const string PermissionServiceNotAvailable = "The permission service is currently unavailable. Please try again later.";
        public const string UnauthorizedAccessAttempt = "An unauthorized access attempt has been detected.";
        public const string UserLimitExceededLicense = "The user limit has been reached. Please contact your administrator to upgrade the license.";
        public const string DeviceLimitExceededLicense = "The device limit has been reached. Please contact your administrator to upgrade the license.";
        public const string DashboardNameAlreadyExist = "A dashboard with this name already exists.";
        public const string DashboardNameMandatory = "Dashboard name is required.";
        public const string GoogleApisave = "Google API key saved successfully.";
        public const string FtpConfugurationSave = "FTP configuration saved successfully.";
        public const string PdfGenerated = "PDF file generated successfully.";
        public const string CsvGenerated = "CSV file generated successfully.";
        public const string ExcelGenerated = "Excel file generated successfully.";
        public const string FileUploadFailure = "No file was uploaded.";
        public const string RecordNotInserted = "Failed to insert the record.";
        public const string UserLoggedIn = "User logged in successfully.";
        public const string NewTokenGenerated = "New token generated successfully.";
        public const string DeviceAlreadyExists = "A device with the same IP address already exists.";
        public const string RestoreDatabase = "Database restored successfully.";
        public const string InvalidLicense = "The license is invalid. Please upload a valid license file.";
        public const string LicenseExpired = "The license has expired.";
        public const string CredetialWrongAddDevice = "Invalid credentials. Please check your username and password.";
        public const string InvalidGoogleKey = "The provided Google API key is invalid. Please verify the key and try again.";
        public const string DuplicateZoneName = "Zone name already exists on this floor. Please choose a different name.";
        public const string DuplicateFloor = "Floor name already exists. Please choose a different name.";
        public const string RecordAdded = "The record has been successfully added.";
        public const string RecordUpdated = "The record has been successfully updated.";
        public const string RecordDeleted = "The record has been successfully deleted.";
        public const string RecordRetrieved = "The record has been retrieved successfully.";
        public const string FileUploaded = "The file has been successfully uploaded.";
        public const string RecordNotFound = "No record found.";
        public const string SomethingWentWrong = "Something went wrong. Please try again.";
        public const string DeviceUnavailable = "This device is currently unavailable or offline. Please verify the connection and try again.";
        public const string SiteUnavailable = "This site is currently unavailable or offline. Please verify the site address and try again.";
        public const string ChildSiteUnAvailable = "Child site does not exist under the selected parent site.";
        public const string ApplicationCacheClear = "Application cache cleared.";



    }

}
