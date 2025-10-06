using HanwhaAdminApi.Application.Interfaces;
using HanwhaAdminApi.Infrastructure.Interfaces;
using HanwhaAdminApi.Model.DbEntities;
using HanwhaAdminApi.Model.Dto;
using Microsoft.Extensions.Configuration;
using MongoDB.Driver.Linq;
using System.Security.Cryptography;

namespace HanwhaAdminApi.Application.Services
{
    public class OtpService : IOtpService
    {
        private readonly IOtpRepository _otpRepository;
        private readonly IUsersRepository _usersRepository;
        private readonly IConfiguration _configuration;


        public OtpService(IOtpRepository otpRepository, IUsersRepository usersRepository, IConfiguration configuration)
        {
            _otpRepository = otpRepository;
            _usersRepository = usersRepository;
            _configuration = configuration;
        }

        public async Task<OtpResponseDto> GenerateOtpAsync(OtpRequestDto request)
        {
            bool isEmail = await _usersRepository.IsEmailnameExistAsync(request.Email);
            if (isEmail)
            {
                string otpCode = GenerateRandomOtp();

                var otpModel = new Otp
                {
                    Email = request.Email,
                    OtpCode = otpCode,
                    CreatedOn = DateTime.UtcNow,
                    ExpiredOn = DateTime.UtcNow.AddMinutes(Convert.ToDouble(_configuration["OtpExpirationMinutes"])),
                    IsUtilized = false
                };

                await _otpRepository.CreateOtpAsync(otpModel);
                return new OtpResponseDto { Otp = otpCode };
            }
            else
            {
                return new OtpResponseDto { Otp = "" };
            }

        }

        public async Task<bool> ValidateOtpAsync(OtpRequestDto request, string providedOtp)
        {
            var existingOtp = await _otpRepository.GetOtpByEmailAsync(request.Email);

            //if (existingOtp == null || existingOtp.IsUsed)
            //    return false;

            if (existingOtp.ExpiredOn < DateTime.UtcNow)
                return false;

            if (existingOtp.OtpCode != providedOtp)
                return false;

            // Mark OTP as used
            //  await _otpRepository.UpdateOtpUsedStatusAsync(existingOtp.Id);

            return true;
        }

        private string GenerateRandomOtp()
        {

            return "123456";
            //return RandomNumberGenerator.GetInt32(100000, 999999).ToString();
        }
    }
}
