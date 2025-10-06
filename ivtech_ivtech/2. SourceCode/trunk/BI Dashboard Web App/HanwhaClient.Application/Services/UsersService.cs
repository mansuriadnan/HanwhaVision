using AutoMapper;
using DocumentFormat.OpenXml.Office2010.Excel;
using HanwhaClient.Application.Interfaces;
using HanwhaClient.Core.Interfaces;
using HanwhaClient.Core.Services;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.Common.ReferenceData;
using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.Dto;
using HanwhaClient.Model.License;
using HanwhaClient.Model.User;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using MongoDB.Driver;

namespace HanwhaClient.Application.Services
{
    public class UsersService : IUsersService
    {
        private readonly IOtpRepository _otpRepository;
        private readonly IUsersRepository _usersRepository;
        private readonly IRoleRepository _roleRepository;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IMapper _mapper;
        private readonly IOtpService _otpService;
        private readonly IEmailTemplateService _emailTemplateService;
        private readonly EmailSenderService _emailSenderService;
        private readonly IConfiguration _configuration;
        private readonly IPermissionService _permissionService;
        private readonly IClientTimeZoneRepository _clientTimeZoneRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UsersService(IUsersRepository usersRepository,
            IRoleRepository roleRepository,
            IPasswordHasher passwordHasher,
            IMapper mapper,
            IOtpService otpService,
            IOtpRepository otpRepository,
            EmailSenderService emailSenderService,
            IEmailTemplateService emailTemplateService,
            IConfiguration configuration,
            IPermissionService permissionService,
            IClientTimeZoneRepository clientTimeZoneRepository,
            IHttpContextAccessor httpContextAccessor)
        {
            this._usersRepository = usersRepository;
            this._roleRepository = roleRepository;
            this._passwordHasher = passwordHasher;
            this._mapper = mapper;
            this._otpService = otpService;
            this._otpRepository = otpRepository;
            this._emailSenderService = emailSenderService;
            this._emailTemplateService = emailTemplateService;
            this._configuration = configuration;
            this._permissionService = permissionService;
            this._clientTimeZoneRepository = clientTimeZoneRepository;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<(IEnumerable<UserMaster> data, Dictionary<string, object> referenceData)> GetAllUsersAsync()
        {
            var users = await _usersRepository.GetAllUserAsync();

            Dictionary<string, object> referenceData = new();
            var options = new List<OptionModel<string, string>>();
            var roleIds = users.Where(x => x.RoleIds != null).SelectMany(x => x.RoleIds).Distinct();
            var mappings = await _roleRepository.GetManyAsync(roleIds);
            options = mappings.Select(x => new OptionModel<string, string>(x.Id, x.RoleName)).ToList();
            referenceData.Add("roleIds", options);

            var CreatedByIds = users.Select(x => x.CreatedBy).Distinct().ToList();
            var createByReferenceData = await GetUserMasterReferenceDataAsync(CreatedByIds);
            referenceData.Add("createdBy", createByReferenceData);

            var UpdatedByIds = users.Select(x => x.UpdatedBy).Distinct().ToList();
            var UpdateByReferenceData = await GetUserMasterReferenceDataAsync(UpdatedByIds);
            referenceData.Add("updatedBy", UpdateByReferenceData);


            return await Task.FromResult((users, referenceData));
        }

        public async Task<(string Id, string ErrorMessage)> SaveUserAsync(UsersRequestModel userRequest, string userId)
        {
            LicenseDataModel licenseData = _permissionService._licenseData;

            if (licenseData != null && !licenseData.IsValid)
            {
                return ("", licenseData.ErrorMessage);
            }

            int CurrentUserCount = await _usersRepository.GetUserCountAsync();

            if (licenseData != null && CurrentUserCount >= licenseData.NumberOfUsers)
            {
                return ("", AppMessageConstants.UserLimitExceededLicense);
            }

            var isExist = await _usersRepository.IsUsernameExistAsync(userRequest.Username, userRequest.Id);
            if (isExist)
                return ("", $"Username {userRequest.Username} already exist.");

            isExist = await _usersRepository.IsEmailnameExistAsync(userRequest.Email, userRequest.Id);
            if (isExist)
                return ("", $"Email {userRequest.Email} already exist.");

            var user = _mapper.Map<UserMaster>(userRequest);

            if (user.DataAccessPermission == null)
            {
                user.DataAccessPermission = new DataAccessPermission() { FloorIds = [], ZoneIds = [] };
            }
            if (string.IsNullOrEmpty(user.Id))
            {
                var plainTextPass = user.Password;
                user.Username = user.Username;
                user.Password = _passwordHasher.HashPassword(user.Password);
                user.CreatedOn = DateTime.UtcNow;
                user.UpdatedOn = DateTime.UtcNow;
                user.CreatedBy = userId;
                user.UpdatedBy = userId;

                var data = await _usersRepository.InsertAsync(user);
                var mappings = await _roleRepository.GetManyAsync(user.RoleIds);
                var roleNames = string.Join(", ", mappings.Select(r => r.RoleName)); // assuming "RoleName" is the property
                EmailTemplates WelcomeUserEmailTemplate = _emailTemplateService.GetEmailTemplateByTitle("User Created").Result;
                if (WelcomeUserEmailTemplate != null)
                {
                    var emailBody = WelcomeUserEmailTemplate.EmailTemplateHtml;

                    var request1 = _httpContextAccessor.HttpContext?.Request;
                    var frontendUrl = request1?.Headers["Origin"].ToString();
                    //var referer = request1?.Headers["Referer"].ToString();

                    // Build valuesd
                    string fullName = $"{user.Firstname} {user.Lastname}";
                    var userMaster = await _usersRepository.GetUserByUserIdAsync(userId); // assuming you have this method

                    // Replace placeholders
                    emailBody = emailBody.Replace("[[UserName]]", user.Firstname + " " + user.Lastname);
                    emailBody = emailBody.Replace("[[FullName]]", fullName);
                    emailBody = emailBody.Replace("[[Username]]", user.Username);
                    emailBody = emailBody.Replace("[[Password]]", plainTextPass);
                    emailBody = emailBody.Replace("[[UserEmail]]", user.Email);
                    emailBody = emailBody.Replace("[[UserRole]]", roleNames); // assuming RoleNames is available
                    emailBody = emailBody.Replace("[[LoginURL]]", frontendUrl);
                    emailBody = emailBody.Replace("[[CreatedBy]]", userMaster.Firstname + " " + userMaster.Lastname);

                    await _emailSenderService.SendEmailAsync(
                        new List<string> { userRequest.Email },
                        null,
                        null,
                        WelcomeUserEmailTemplate.EmailTemplateTitle,
                        emailBody,
                        null
                    );
                }
                return await Task.FromResult((data, ""));
            }
            else
            {
                var update = Builders<UserMaster>.Update
                .Set(c => c.Username, user.Username)
                .Set(c => c.Firstname, user.Firstname)
                .Set(c => c.Lastname, user.Lastname)
                .Set(c => c.Email, user.Email)
                .Set(c => c.RoleIds, user.RoleIds)
                .Set(c => c.UpdatedOn, DateTime.UtcNow)
                .Set(c => c.UpdatedBy, userId)
                .Set(c => c.DataAccessPermission, user.DataAccessPermission);
                var userData = await _usersRepository.GetAsync(userRequest.Id);

                if (userData != null && userRequest.Email != userData.Email)
                {
                    var updateEmailAddress = await _emailTemplateService.GetEmailTemplateByTitle("Update Email Address");

                    if (updateEmailAddress != null)
                    {
                        var emailBody = updateEmailAddress.EmailTemplateHtml
                                             .Replace("[[UserName]]", user.Firstname + " " + user.Lastname)
                                             .Replace("[[OTPCode]]", "123456")
                                             .Replace("[[NewEmail]]", userRequest.Email)
                                             .Replace("[[OTPValidityDuration]]", Convert.ToString(_configuration["OtpExpirationMinutes"]));

                        var emailSubject = updateEmailAddress.EmailTemplateDescription;


                        // EmailTemplate ForgotPasswordEmailTemplate  = _EmailTemplateService.GetEmailTemplateByTitle("Forgot Password Email").Result;
                        await _emailSenderService.SendEmailAsync(new List<string> { userData.Email }, null, null, emailSubject, emailBody, null);
                    }
                }

                if (userRequest.Password != "")
                    update = update.Set(c => c.Password, _passwordHasher.HashPassword(user?.Password));

                if (userRequest.Password != "")
                {
                    EmailTemplates changePasswordTemplate = _emailTemplateService.GetEmailTemplateByTitle("Change Password").Result;

                    if (changePasswordTemplate != null)
                    {
                        var request1 = _httpContextAccessor.HttpContext?.Request;
                        var frontendUrl = request1?.Headers["Origin"].ToString();
                        var emailBody = changePasswordTemplate.EmailTemplateHtml
                                             .Replace("[[UserName]]", user.Firstname + " " + user.Lastname)
                                             .Replace("[[LoginURL]]", frontendUrl ?? "");

                        var emailSubject = changePasswordTemplate.EmailTemplateDescription;

                       await _emailSenderService.SendEmailAsync(new List<string> { userData.Email }, null, null, emailSubject, emailBody, null);
                    }
                }
                await _usersRepository.UpdateFieldsAsync(user.Id, update);
                return await Task.FromResult((user.Id, ""));
            }
        }

        public async Task<UserMaster> GetUserAsync(string id)
        {
            var data = await _usersRepository.GetAsync(id);
            return await Task.FromResult(data);
        }

        public async Task<bool> DeleteUserAsync(string id, string userId)
        {
            var data = await _usersRepository.SoftDeleteAsync(id, userId);
            return await Task.FromResult(data);
        }

        public async Task<bool> ForgotPasswordAsync(ForgotPasswordDto forgotPasswordDto)
        {
            // First, validate the OTP
            //  var otpValidationRequest = new OtpRequestDto { Email = resetPasswordDto.Email };
            //bool isOtpValid = await _otpService.ValidateOtpAsync(otpValidationRequest, otpValidationRequest.);

            //if (!isOtpValid)
            //{
            //    return false;
            //}

            // Check if user exists

            bool isEmail = await _usersRepository.IsEmailnameExistAsync(forgotPasswordDto.Email);
            if (isEmail)
            {
                string otpCode = GenerateRandomOtp();

                var otpModel = new Otp
                {
                    Email = forgotPasswordDto.Email,
                    OtpCode = otpCode,
                    CreatedOn = DateTime.UtcNow,
                    ExpiredOn = DateTime.UtcNow.AddMinutes(Convert.ToDouble(_configuration["AppSettings:OtpExpirationMinutes"])),
                    IsUtilized = false
                };

                await _otpRepository.CreateOtpAsync(otpModel);
                _emailSenderService.SendEmailAsync(new List<string> { forgotPasswordDto.Email }, null, null, "Forgot password OTP", "Your otp is :--> " + otpCode, null);
                return isEmail;
            }


            // Hash the new password
            //string hashedPassword = passwordHasher.HashPassword(forgotPasswordDto.NewPassword);

            //// Update password
            //await usersRepository.UpdatePasswordAsync(forgotPasswordDto.Email, hashedPassword);

            return isEmail;
            ;
        }

        private string GenerateRandomOtp()
        {
            return "1234";
        }

        public async Task<bool> ResetPasswordAsync(ResetPasswordDto resetPasswordDto)
        {
            var userData = await _usersRepository.GetUserByUserIdAsync(resetPasswordDto.UserId);
            if (userData == null)
            {
                return false;
            }

            // Hash the new password
            bool hashedPassword = _passwordHasher.VerifyPassword(userData.Password ?? "", resetPasswordDto.OldPassword);

            if (hashedPassword)
            {
                string newHashedPassword = _passwordHasher.HashPassword(resetPasswordDto.NewPassword);
                // Update password
                await _usersRepository.UpdatePasswordAsync(resetPasswordDto.UserId, newHashedPassword);
                EmailTemplates ResetPasswordTemplate = _emailTemplateService.GetEmailTemplateByTitle("User password reset").Result;
                _emailSenderService.SendEmailAsync(new List<string> { userData.Email }, null, null, ResetPasswordTemplate.EmailTemplateTitle, ResetPasswordTemplate.EmailTemplateHtml, null);
                return true;
            }
            return false;
        }

        public async Task<bool> ForgotPasswordResetAsync(ForgotPasswordResetDto resetPasswordDto)
        {
            var existingOtp = await _otpRepository.GetOtpByEmailAsync(resetPasswordDto.Email);

            if (existingOtp == null || existingOtp.IsUtilized)
                return false;


            if (existingOtp.OtpCode != resetPasswordDto.Otp)
                return false;

            // Mark OTP as used
            await _otpRepository.UpdateOtpUsedStatusAsync(existingOtp.Id);

            var userData = await _usersRepository.GetUserByEmailAsync(resetPasswordDto.Email);
            if (userData == null)
            {
                return false;
            }

            // Hash the new password
            string newHashedPassword = _passwordHasher.HashPassword(resetPasswordDto.NewPassword);

            // Update password
            await _usersRepository.UpdatePasswordAsync(userData.Id, newHashedPassword);

            return true;
        }

        public async Task<bool> UserResetPassword(UserResetPassword userResetPassword)
        {
            var userData = await _usersRepository.GetUserByUserIdAsync(userResetPassword.UserId);
            if (userData == null)
            {
                return false;
            }
            string newHashedPassword = _passwordHasher.HashPassword(userResetPassword.NewPassword);
            await _usersRepository.UpdatePasswordAsync(userResetPassword.UserId, newHashedPassword);
            EmailTemplates ResetPasswordTemplate = _emailTemplateService.GetEmailTemplateByTitle("User password reset").Result;
            _emailSenderService.SendEmailAsync(new List<string> { userData.Email }, null, null, ResetPasswordTemplate.EmailTemplateTitle, ResetPasswordTemplate.EmailTemplateHtml, null);
            return true;

        }

        public async Task<bool> SaveUserProfileImage(IFormFile file, string userId)
        {
            using var memoryStream = new MemoryStream();
            await file.CopyToAsync(memoryStream);
            var fileBytes = memoryStream.ToArray();
            var base64Image = Convert.ToBase64String(fileBytes);
            var mimeType = file.ContentType;
            var base64ImageWithMime = $"data:{mimeType};base64,{base64Image}";
            var update = Builders<UserMaster>.Update
                .Set(c => c.ProfileImage, base64ImageWithMime)
                .Set(c => c.UpdatedBy, userId)
                .Set(c => c.UpdatedOn, DateTime.UtcNow);
            var data = await _usersRepository.UpdateFieldsAsync(userId, update);
            return data;
        }

        public async Task<List<OptionModel<string, string>>> GetUserMasterReferenceDataAsync(IEnumerable<string> ids)
        {
            var options = new List<OptionModel<string, string>>();
            ProjectionDefinition<UserMaster> projection = Builders<UserMaster>.Projection
            .Include("Username")
            .Include("_id");
            var users = await _usersRepository.GetManyAsync(ids, projection);
            options = users.Select(x => new OptionModel<string, string>(x.Id, x.Username)).ToList();
            return options;
        }

        public async Task<(UserMaster data, Dictionary<string, object> referenceData)> GetUsersProfile(string userId)
        {
            var userData = await _usersRepository.GetAsync(userId);
            Dictionary<string, object> referenceData = new();
            ProjectionDefinition<RoleMaster> projection = Builders<RoleMaster>.Projection
            .Include("roleName")
            .Include("_id");
            var roles = await _roleRepository.GetManyAsync(userData.RoleIds, projection);
            if (userData.userPreferences != null && userData.userPreferences?.TimezoneId != null)
            {
                var timeZone = await _clientTimeZoneRepository.GetTimeZone(userData.userPreferences?.TimezoneId ?? "");
                referenceData.Add("timeZone", new OptionModel<string, object>(timeZone?.Id ?? "", timeZone));
            }
            referenceData.Add("roleIds", roles.Select(x => new OptionModel<string, string>(x.Id, x.RoleName)).ToList());

            return (userData, referenceData);
        }

        public async Task<bool> AddUpdateUserPreferences(UserPreferencesRequest userPreferencesRequest)
        {
            UserPreferences userPreferences = new UserPreferences
            {
                Theme = userPreferencesRequest.Theme,
                IsOsSyncTimeZone = userPreferencesRequest.IsOsSyncTimeZone,
                TimezoneId = userPreferencesRequest.Timezone,
                IsDaylightSavings = userPreferencesRequest.IsDaylightSavings,
                Language = userPreferencesRequest.Language,
                TimeFormat = userPreferencesRequest.TimeFormat
            };
            var update = Builders<UserMaster>.Update
                .Set(c => c.userPreferences, userPreferences)
                .Set(c => c.UpdatedBy, userPreferencesRequest.UserId)
                .Set(c => c.UpdatedOn, DateTime.UtcNow);
            var data = await _usersRepository.UpdateFieldsAsync(userPreferencesRequest.UserId, update);
            return data;
        }

        public async Task<ClientTimezones> GetTimeZone(string userId)
        {
            var data = await _usersRepository.GetAsync(userId);
            var timeZoneId = data?.userPreferences?.TimezoneId;

            if (string.IsNullOrEmpty(timeZoneId))
            {
                var localTimeZone = TimeZoneInfo.Local;
                var offset = localTimeZone.GetUtcOffset(DateTime.UtcNow);

                return new ClientTimezones
                {
                    Id = localTimeZone.Id,
                    UtcOffset = $"{(offset.TotalHours >= 0 ? "+" : "-")}{offset:hh\\:mm}", // e.g., "+07:00"
                    Name = localTimeZone.DisplayName
                };
            }

            var clientData = await _clientTimeZoneRepository.GetAsync(timeZoneId);

            return clientData;
        }
    }
}
