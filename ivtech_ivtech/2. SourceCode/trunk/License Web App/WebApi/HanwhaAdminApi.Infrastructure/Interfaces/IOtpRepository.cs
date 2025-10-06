using HanwhaAdminApi.Model.DbEntities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Net.WebRequestMethods;

namespace HanwhaAdminApi.Infrastructure.Interfaces
{
    public interface IOtpRepository
    {
        Task<Otp> CreateOtpAsync(Otp otpModel);
        Task<Otp> GetOtpByEmailAsync(string email);
        Task UpdateOtpUsedStatusAsync(string id);
        Task DeleteOtp(string id);
    }
}
