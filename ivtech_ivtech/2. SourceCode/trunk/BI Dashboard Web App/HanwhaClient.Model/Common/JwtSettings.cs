using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Model.Common
{
    public class JwtSettings
    {
        public string Secret { get; set; }
        public string RSAPrivateKey { get; set; }
        public string RSAPublicKey { get; set; }
        public string Issuer { get; set; }
        public string Audience { get; set; }
        public int TokenExpirationInMinutes { get; set; }
        public int RefreshTokenExpirationInDays { get; set; }
        public string SymmetricSecurityKey { get; set; }
    }

    public class Logs
    {
        public bool LogException { get; set; }
        public bool LogRequestResponse { get; set; }
    }
}
