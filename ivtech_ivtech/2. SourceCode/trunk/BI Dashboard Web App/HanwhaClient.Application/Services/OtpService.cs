using HanwhaClient.Application.Interfaces;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.Dto;

namespace HanwhaClient.Application.Services
{
    // OtpService.cs (Service Implementation)
    public class OtpService : IOtpService
    {
        private readonly IOtpRepository _otpRepository;
        private readonly IUsersRepository _usersRepository;
        private const int OTP_EXPIRATION_MINUTES = 10;

        public OtpService(IOtpRepository otpRepository, IUsersRepository usersRepository)
        {
            _otpRepository = otpRepository;
            _usersRepository = usersRepository;
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
                    ExpiredOn = DateTime.UtcNow.AddMinutes(OTP_EXPIRATION_MINUTES),
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
            return "1234";
        }
    }
}
