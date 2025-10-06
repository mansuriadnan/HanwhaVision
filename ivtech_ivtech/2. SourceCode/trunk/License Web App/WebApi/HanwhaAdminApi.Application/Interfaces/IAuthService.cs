using HanwhaAdminApi.Model.Auth;

namespace HanwhaAdminApi.Application.Interfaces
{
    public interface IAuthService
    {
        Task<TokenResponseModel> LoginAsync(string username, string password);
        Task<TokenResponseModel> RefreshTokenAsync(string refreshToken);
    }
}
