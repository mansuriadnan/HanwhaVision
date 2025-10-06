using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaAdminApi.Model.Common
{
    public static class AppMessageConstants
    {
        public const string InsertSuccess = "The record has been successfully added.";
        public const string UpdateSuccess = "The record has been successfully updated.";
        public const string InsertUpdateFailure = "Failed to save the record. Please try again.";
        public const string DeleteSuccess = "The record has been successfully deleted.";
        public const string DeleteFailure = "Failed to delete the record. Please try again.";
        public const string ValidationError = "One or more validation errors occurred.";
        public const string NotFound = "The requested record was not found.";
        public const string DuplicateEntry = "This record already exists.";
        public const string UnauthorizedAccess = "You are not authorized to perform this action.";
        public const string InsufficientPermission = "You do not have sufficient permissions to access this resource.";
        public const string ForbiddenAccess = "Access denied for user with role: ";
        public const string DataRetrieved = "Data retrieved successfully.";
        public const string InvalidLicenseSignature = "Invalid license signature.";
        public const string LicenseAuthenticationKey = "License authentication key not found.";
        public const string LicenseAuthenticated = "License authenticated successfully.";
        public const string LicenseExpired = "The license has expired.";
        public const string LicenseFileNotFound = "License file not found.";
        public const string LicenseMismatch = "The license does not match with your MAC address.";
        public const string FileUploadSuccess = "File uploaded successfully.";
        public const string FileUploadFailure = "File upload failed.";
        public const string RoleExistsFailure = "This role has already been assigned to the user.";
        public const string OtpExpiredInvalid = "Your One-Time Password (OTP) has expired or is invalid. Please generate a new OTP to continue.";
        public const string OtpValidated = "The entered OTP has been validated. Please set up your new password.";
        public const string OtpValidatedUser = "The entered OTP has been validated successfully.";
        public const string OtpSentToEmail = "OTP successfully sent to your registered email.";
        public const string OtpReSentToEmail = "OTP has been resent successfully to your registered email.";
        public const string EmailNotRegistered = "Email is not registered.";
        public const string ResetPasswordSuccess = "Your password has been changed successfully.";
        public const string OldPasswordMismatch = "Your old password does not match our records.";
        public const string FileSendSuccess = "File sent successfully.";
        public const string FileSendFailure = "File failed to send.";
        public const string InvalidDataModel = "Invalid data model.";
        public const string RoleAlreadyAssigned = "The role is already assigned to these users.";
        public const string CountryIdRequired = "Country ID is required.";
        public const string NoStatesAvailable = "No states found for this country.";
        public const string CountryOrStateIdRequired = "Either Country ID or State ID must be provided.";
        public const string NoCitiesFound = "No cities found for the given country or states.";
        public const string DistributorExists = "This distributor cannot be deleted as they have associated customers.";
        public const string SomethingWentWrong = "Something went wrong. Please try again.";
        public const string CustomerExits = "You cannot delete this customer because they have one or more licenses associated with their account.";
        public const string NoRoleRecords = "No records found for the specified role.";
    }
}
