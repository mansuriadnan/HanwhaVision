using HanwhaClient.Model.Auth;
using HanwhaClient.Model.DbEntities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Application.Interfaces
{
    public interface IAuthService
    {
        Task<TokenResponseModel> LoginAsync(string username, string password);
        Task<TokenResponseModel> RefreshTokenAsync(string refreshToken);
        JWTUserTokenModel GetUserFromToken(string token);
    }
}
