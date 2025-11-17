using HanwhaClient.Model.Common;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Core.Services
{
    public class RsaKeyService
    {
        private readonly JwtSettings _jwtSettings;
        private readonly RSA _rsaKey;

        public RsaKeyService(IOptions<JwtSettings> jwtSettings)
        {
            _jwtSettings = jwtSettings.Value;
            _rsaKey = RSA.Create();
            _rsaKey.ImportRSAPrivateKey(Convert.FromBase64String(_jwtSettings.RSAPrivateKey), out _);
        }

        public RSA GetPrivateKey()
        {
            return _rsaKey;
        }

        public RSA GetPublicKey()
        {
            var rsaPublic = RSA.Create();
            rsaPublic.ImportRSAPublicKey(Convert.FromBase64String(_jwtSettings.RSAPublicKey), out _);
            return rsaPublic;
        }
    }
}
