using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization.Formatters.Binary;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Xml;

namespace HanwhaClient.Core.Services.License
{
    public class LicenseGenerator
    {
        private static RSA _rsa = RSA.Create();

        public static byte[] GenerateLicense(string user, string licenseType, DateTime expiryDate, string hardwareId, string PrivateKeyPem, int NumberOfUsers, int NumberOfCameras)
        {            
            var licenseData = new
            {
                CompanyName = user,
                LicenseType = licenseType,
                ExpiryDate = expiryDate.ToString("yyyy-MM-dd"),
                HardwareId = hardwareId,
                NumberOfUsers = NumberOfUsers,
                NumberOfCameras = NumberOfCameras
            };

            string licenseJson = JsonConvert.SerializeObject(licenseData);

            // Load private key
            _rsa.ImportFromPem(PrivateKeyPem);
            //_rsa.ImportFromPem(File.ReadAllText(privateKeyPath));

            // Sign the license data
            byte[] dataBytes = Encoding.UTF8.GetBytes(licenseJson);
            byte[] signatureBytes = _rsa.SignData(dataBytes, HashAlgorithmName.SHA256, RSASignaturePadding.Pkcs1);

            // Add signature to license JSON
            var signedLicense = new
            {
                Data = licenseData,
                Signature = Convert.ToBase64String(signatureBytes)
            };

            // Save to file
            //File.WriteAllText(outputFilePath, JsonConvert.SerializeObject(signedLicense, Newtonsoft.Json.Formatting.Indented));
            //JsonSerializer.S(obj);
            var result = JsonConvert.SerializeObject(signedLicense, Newtonsoft.Json.Formatting.Indented);
            byte[] resultBytes = Encoding.UTF8.GetBytes(result);
            return resultBytes;
            Console.WriteLine("License file generated successfully.");
        }

        

    }
}
