using HanwhaAdminApi.Model.Dto;

namespace HanwhaAdminApi.Application.Interfaces
{
    public interface IOtpService
    {
        Task<OtpResponseDto> GenerateOtpAsync(OtpRequestDto request);
        Task<bool> ValidateOtpAsync(OtpRequestDto request, string providedOtp);
    }
}
