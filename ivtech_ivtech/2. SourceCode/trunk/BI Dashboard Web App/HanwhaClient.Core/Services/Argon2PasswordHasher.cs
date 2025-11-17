using HanwhaClient.Core.Interfaces;
using Isopoh.Cryptography.Argon2;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Core.Services
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
