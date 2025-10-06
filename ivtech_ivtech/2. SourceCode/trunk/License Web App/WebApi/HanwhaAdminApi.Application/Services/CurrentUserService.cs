using HanwhaAdminApi.Application.Interfaces;
using Microsoft.AspNetCore.Http;

namespace HanwhaAdminApi.Application.Services
{
    public class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public string? UserId
        {
            get
            {
                var user = _httpContextAccessor.HttpContext?.User;
                return user?.Claims.FirstOrDefault(x => x.Type == "nameid")?.Value;
            }
        }
    }
}
