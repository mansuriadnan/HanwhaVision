using AutoMapper;
using HanwhaAdminApi.Application.Interfaces;
using HanwhaAdminApi.Core.Interfaces;
using HanwhaAdminApi.Core.Services;
using HanwhaAdminApi.Infrastructure.Interfaces;
using HanwhaAdminApi.Model.Common.ReferenceData;
using HanwhaAdminApi.Model.DbEntities;
using HanwhaAdminApi.Model.Dto;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using System;
using System.Security.Cryptography;

namespace HanwhaAdminApi.Application.Services
{
    public class UsersService : IUsersService
    {
        private readonly IOtpRepository _otpRepository;
        private readonly IUsersRepository _usersRepository;
        private readonly IRoleRepository _roleRepository;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IMapper _mapper;
        private readonly IOtpService _otpService;
        private readonly IEmailTemplateService _EmailTemplateService;
        private readonly EmailSenderService _EmailSenderService;
        private readonly IConfiguration _configuration;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UsersService(IUsersRepository usersRepository,
            IRoleRepository roleRepository,
            IPasswordHasher passwordHasher,
            IMapper mapper,
            IOtpService otpService,
            IOtpRepository otpRepository,
            EmailSenderService emailSenderService,
            IEmailTemplateService emailTemplateService,
            IConfiguration configuration
,
            IHttpContextAccessor httpContextAccessor)
        {
            this._usersRepository = usersRepository;
            this._roleRepository = roleRepository;
            this._passwordHasher = passwordHasher;
            this._mapper = mapper;
            _otpService = otpService;
            _otpRepository = otpRepository;
            _EmailSenderService = emailSenderService;
            _EmailTemplateService = emailTemplateService;
            _configuration = configuration;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<(IEnumerable<UserMaster> data, Dictionary<string, object> referenceData)> GetAllUsersAsync()
        {
            var users = await _usersRepository.GetAllUserAsync();

            Dictionary<string, object> referenceData = new();

            if (users != null && users.Count() > 0)
            {
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
            }

            return await Task.FromResult((users, referenceData));
        }

        public async Task<List<OptionModel<string, string>>> GetUserMasterReferenceDataAsync(IEnumerable<string> ids)
        {
            var options = new List<OptionModel<string, string>>();
            ProjectionDefinition<UserMaster> projection = Builders<UserMaster>.Projection
            .Include("Firstname")
            .Include("Lastname")
            .Include("_id");
            var users = await _usersRepository.GetManyAsync(ids, projection);
            options = users.Select(x => new OptionModel<string, string>(x.Id, x.Firstname + " " + x.Lastname)).ToList();
            return options;
        }

        public async Task<(string Id, string ErrorMessage)> SaveUserAsync(UsersRequestModel userRequest, string userId)
        {
            try
            {
                var isExist = await _usersRepository.IsUsernameExistAsync(userRequest.Username, userRequest.Id);
                if (isExist)
                    return ("", $"Username {userRequest.Username} already exist.");

                isExist = await _usersRepository.IsEmailnameExistAsync(userRequest.Email, userRequest.Id);
                if (isExist)
                    return ("", $"Email {userRequest.Email} already exist.");

                var user = _mapper.Map<UserMaster>(userRequest);

                if (string.IsNullOrEmpty(user.Id))
                {
                    var plainTextPass = user.Password;
                    user.CreatedBy = userId;
                    user.CreatedOn = DateTime.Now;
                    user.UpdatedBy = userId;
                    user.UpdatedOn = DateTime.Now;
                    user.Password = _passwordHasher.HashPassword(user.Password);
                    var data = await _usersRepository.InsertAsync(user);

                    var mappings = await _roleRepository.GetManyAsync(user.RoleIds);
                    var roleNames = string.Join(", ", mappings.Select(r => r.RoleName)); // assuming "RoleName" is the property
                    EmailTemplate WelcomeUserEmailTemplate = _EmailTemplateService.GetEmailTemplateByTitle("User Created").Result;
                    if (WelcomeUserEmailTemplate != null)
                    {
                        var emailBody = WelcomeUserEmailTemplate.EmailTemplateHtml;

                        var request1 = _httpContextAccessor.HttpContext?.Request;
                        var frontendUrl = request1?.Headers["Origin"].ToString();
                        //var referer = request1?.Headers["Referer"].ToString();

                        // Build values
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

                        await _EmailSenderService.SendEmailAsync(
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
                        .Set(c => c.UpdatedOn, DateTime.Now)
                        .Set(c => c.UpdatedBy, userId)
                        .Set(c => c.IsDeleted, user.IsDeleted);
                    await _usersRepository.UpdateFieldsAsync(user.Id, update);
                    return await Task.FromResult((user.Id, ""));
                }
            }
            catch (Exception ex)
            {
                var msg = ex.Message;
                throw;
            }
        }

        public async Task<UserMaster> GetUserAsync(string id)
        {
            var data = await _usersRepository.GetAsync(id);
            return await Task.FromResult(data);
        }

        public async Task<bool> DeleteUserAsync(string id, string userId)
        {
            var getUser = _usersRepository.GetAsync(id);
            if (getUser != null)
            {
                bool deletedCount = await _usersRepository.SoftDeleteAsync(id, userId);
                return await Task.FromResult(deletedCount);
            }
            return false;
        }

        public async Task<bool> ForgotPasswordAsync(ForgotPasswordDto forgotPasswordDto)
        {
            bool isEmail = await _usersRepository.IsEmailnameExistAsync(forgotPasswordDto.Email);
            var existingOtp = await _otpRepository.GetOtpByEmailAsync(forgotPasswordDto.Email);
            var userData = await _usersRepository.GetUserByEmailAsync(forgotPasswordDto.Email);


            if (isEmail && userData != null)
            {
                if (existingOtp != null && !existingOtp.IsDeleted)
                {
                    await _otpRepository.DeleteOtp(existingOtp.Id);
                }
                string otpCode = GenerateRandomOtp();

                var otpModel = new Otp
                {
                    Email = forgotPasswordDto.Email,
                    OtpCode = otpCode,
                    CreatedBy = userData.CreatedBy,
                    UpdatedBy = userData.UpdatedBy,
                    CreatedOn = DateTime.UtcNow,
                    ExpiredOn = DateTime.UtcNow.AddMinutes(Convert.ToDouble(_configuration["OtpExpirationMinutes"])),
                    IsUtilized = false,
                    UpdatedOn = DateTime.UtcNow
                };

                await _otpRepository.CreateOtpAsync(otpModel);

                EmailTemplate forgotPasswordTemplate = await _EmailTemplateService.GetEmailTemplateByTitle("Forgot Password OTP");

                if (forgotPasswordTemplate != null)
                {
                    var emailBody = forgotPasswordTemplate.EmailTemplateHtml
                                         .Replace("[[UserName]]", userData.Firstname + " " + userData.Lastname)
                                         .Replace("[[OTPCode]]", otpCode)
                                         .Replace("[[OTPValidityDuration]]", Convert.ToString(_configuration["OtpExpirationMinutes"]));

                    var emailSubject = forgotPasswordTemplate.EmailTemplateDescription;


                    // EmailTemplate ForgotPasswordEmailTemplate  = _EmailTemplateService.GetEmailTemplateByTitle("Forgot Password Email").Result;
                    _EmailSenderService.SendEmailAsync(new List<string> { forgotPasswordDto.Email }, null, null, emailSubject, emailBody, null);
                }

                return isEmail;
            }
            return isEmail;
        }

        public async Task<bool> ResetPasswordAsync(ResetPasswordDto resetPasswordDto, string userId)
        {
            var userData = await _usersRepository.GetUserByUserIdAsync(userId);
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
                EmailTemplate ResetPasswordTemplate = _EmailTemplateService.GetEmailTemplateByTitle("Change Password").Result;

                if (ResetPasswordTemplate != null)
                {
                    var request1 = _httpContextAccessor.HttpContext?.Request;
                    var frontendUrl = request1?.Headers["Origin"].ToString();
                    var emailBody = ResetPasswordTemplate.EmailTemplateHtml
                                         .Replace("[[UserName]]", userData.Firstname + " " + userData.Lastname)
                                         .Replace("[[LoginURL]]", frontendUrl ?? "");

                    var emailSubject = ResetPasswordTemplate.EmailTemplateDescription;


                    // EmailTemplate ForgotPasswordEmailTemplate  = _EmailTemplateService.GetEmailTemplateByTitle("Forgot Password Email").Result;
                    _EmailSenderService.SendEmailAsync(new List<string> { userData.Email }, null, null, emailSubject, emailBody, null);
                }

                //_EmailSenderService.SendEmailAsync(new List<string> { userData.Email }, null, null, ResetPasswordTemplate.EmailTemplateTitle, ResetPasswordTemplate.EmailTemplateHtml, null);
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
            await _otpRepository.DeleteOtp(existingOtp.Id);

            var userData = await _usersRepository.GetUserByEmailAsync(resetPasswordDto.Email);
            if (userData == null)
            {
                return false;
            }

            // Hash the new password
            string newHashedPassword = _passwordHasher.HashPassword(resetPasswordDto.NewPassword);

            // Update password
            await _usersRepository.UpdatePasswordAsync(userData.Id, newHashedPassword);

            EmailTemplate ResetPasswordTemplate = _EmailTemplateService.GetEmailTemplateByTitle("Change Password").Result;

            if (ResetPasswordTemplate != null)
            {
                var request1 = _httpContextAccessor.HttpContext?.Request;
                var frontendUrl = request1?.Headers["Origin"].ToString();
                var emailBody = ResetPasswordTemplate.EmailTemplateHtml
                                     .Replace("[[UserName]]", userData.Firstname + " " + userData.Lastname)
                                     .Replace("[[LoginURL]]", frontendUrl);

                var emailSubject = ResetPasswordTemplate.EmailTemplateDescription;


                // EmailTemplate ForgotPasswordEmailTemplate  = _EmailTemplateService.GetEmailTemplateByTitle("Forgot Password Email").Result;
                _EmailSenderService.SendEmailAsync(new List<string> { userData.Email }, null, null, emailSubject, emailBody, null);
            }


            return true;
        }

        public async Task<(UserMaster data, Dictionary<string, object> referenceData)> GetUsersProfile(string userId)
        {
            var userData = await _usersRepository.GetAsync(userId);
            Dictionary<string, object> referenceData = new();
            ProjectionDefinition<RoleMaster> projection = Builders<RoleMaster>.Projection
            .Include("roleName")
            .Include("_id");
            var roles = await _roleRepository.GetManyAsync(userData.RoleIds, projection);
            referenceData.Add("roleIds", roles.Select(x => new OptionModel<string, string>(x.Id, x.RoleName)).ToList());
            return (userData, referenceData);
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
                .Set(c => c.UpdatedOn, DateTime.Now);
            var data = await _usersRepository.UpdateFieldsAsync(userId, update);
            return data;
        }

        public async Task<bool> SendOtpByUserIdAsync(string id, string newEmailId)
        {
            var getEmailId = _usersRepository.GetAsync(id);
            var emailId = getEmailId?.Result.Email;
            if (emailId != null)
            {
                var existingOtp = await _otpRepository.GetOtpByEmailAsync(emailId);
                if (existingOtp != null && !existingOtp.IsDeleted)
                {
                    await _otpRepository.DeleteOtp(existingOtp.Id);
                }
                string otpCode = GenerateRandomOtp();

                var otpModel = new Otp
                {
                    Email = emailId,
                    OtpCode = otpCode,
                    CreatedOn = DateTime.UtcNow,
                    CreatedBy = getEmailId?.Result.Id,
                    UpdatedBy = getEmailId?.Result.Id,
                    ExpiredOn = DateTime.UtcNow.AddMinutes(Convert.ToDouble(_configuration["OtpExpirationMinutes"])),
                    IsUtilized = false,
                    UpdatedOn = DateTime.UtcNow
                };

                await _otpRepository.CreateOtpAsync(otpModel);

                EmailTemplate forgotPasswordTemplate = await _EmailTemplateService.GetEmailTemplateByTitle("Update Email Address");

                if (forgotPasswordTemplate != null)
                {
                    var emailBody = forgotPasswordTemplate.EmailTemplateHtml
                                         .Replace("[[UserName]]", getEmailId?.Result.Firstname + " " + getEmailId?.Result.Lastname)
                                         .Replace("[[OTPCode]]", otpCode)
                                         .Replace("[[NewEmail]]", newEmailId)
                                         .Replace("[[OTPValidityDuration]]", Convert.ToString(_configuration["OtpExpirationMinutes"]));

                    var emailSubject = forgotPasswordTemplate.EmailTemplateDescription;


                    // EmailTemplate ForgotPasswordEmailTemplate  = _EmailTemplateService.GetEmailTemplateByTitle("Forgot Password Email").Result;
                    _EmailSenderService.SendEmailAsync(new List<string> { emailId }, null, null, emailSubject, emailBody, null);
                }

                return true;
            }
            return false;
        }

        private string GenerateRandomOtp()
        {
            //return "123456";
            return RandomNumberGenerator.GetInt32(100000, 999999).ToString();
        }
    }
}
