using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Model.Auth
{
    public class LoginRequestModel
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }

    public class TokenResponseModel
    {
        public string AccessToken { get; set; }
        public string RefreshToken { get; set; }
        public string ErrorMessage { get; set; }
    }

    public class JWTUserTokenModel
    {
        public string Id { get; set; } = null!;
        public string Username { get; set; } = null!;
        public List<string> RoleId { get; set; } = null!;
        public List<string> RoleName { get; set; } = null!;
    }

    public class RefreshTokenRequest
    {
        public string RefreshToken { get; set; }
    }
}