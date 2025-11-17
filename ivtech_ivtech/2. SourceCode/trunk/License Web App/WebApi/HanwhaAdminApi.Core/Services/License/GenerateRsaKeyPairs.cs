using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaAdminApi.Core.Services.License
{
    public class GenerateRsaKeyPairs
    {
        public static (string PrivateKeyPem, string PublicKeyPem) Generate()
        {
            using (var rsa = RSA.Create())
            {

                rsa.KeySize = 2048; // Key size in bits

                // Export the private key in PEM format
                var privateKey = rsa.ExportRSAPrivateKeyPem();
                //string privateKeyPem = ConvertToPem("PRIVATE KEY", privateKey);
                Console.WriteLine("Private Key:");
                Console.WriteLine(privateKey);

                // Export the public key in PEM format
                var publicKey = rsa.ExportRSAPublicKeyPem();
                //string publicKeyPem = ConvertToPem("PUBLIC KEY", publicKey);
                Console.WriteLine("\nPublic Key:");
                Console.WriteLine(publicKey);
                return (privateKey, publicKey);
            }
        }

        static string ConvertToPem(string label, byte[] data)
        {
            var base64 = Convert.ToBase64String(data, Base64FormattingOptions.InsertLineBreaks);
            return $"-----BEGIN {label}-----\n{base64}\n-----END {label}-----";

        }
    }
}
