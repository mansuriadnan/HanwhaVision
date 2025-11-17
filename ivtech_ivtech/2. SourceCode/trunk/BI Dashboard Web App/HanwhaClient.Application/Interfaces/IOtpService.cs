using HanwhaClient.Model.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Application.Interfaces
{
    public interface IOtpService
    {
        Task<OtpResponseDto> GenerateOtpAsync(OtpRequestDto request);
        Task<bool> ValidateOtpAsync(OtpRequestDto request, string providedOtp);
    }
}
