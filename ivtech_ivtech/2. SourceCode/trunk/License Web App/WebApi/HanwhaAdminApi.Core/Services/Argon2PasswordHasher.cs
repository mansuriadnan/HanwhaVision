using HanwhaAdminApi.Core.Interfaces;
using Isopoh.Cryptography.Argon2;

namespace HanwhaAdminApi.Core.Services
{
    public class Argon2PasswordHasher : IPasswordHasher
    {
        public string HashPassword(string password)
        {
            return Argon2.Hash(password);
        }

        public bool VerifyPassword(string hash, string password)
        {
            return Argon2.Verify(hash, password);
        }
    }
}
