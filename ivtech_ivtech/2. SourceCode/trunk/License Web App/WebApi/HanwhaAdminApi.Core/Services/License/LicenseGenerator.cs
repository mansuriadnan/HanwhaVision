using HanwhaAdminApi.Core.Interfaces;
using Newtonsoft.Json;
using System.Security.Cryptography;
using System.Text;

namespace HanwhaAdminApi.Core.Services.License
{
    public class LicenseGenerator
    {
        private static RSA _rsa = RSA.Create();
        private readonly IEncryptionDecryptionService _encryptionDecryptionService;
        public LicenseGenerator(IEncryptionDecryptionService encryptionDecryptionService)
        {
            this._encryptionDecryptionService = encryptionDecryptionService;
        }


        public byte[] GenerateLicense(
            string user, string licenseType, 
            string siteName, DateTime startDate,
            DateTime expiryDate, string macAddress, 
            string privateKeyPem, int numberOfUsers, 
            int trialDurationDays, int noOfChannel
            )
        {
            var licenseData = new
            {
                CompanyName = user,
                SiteName = siteName,
                LicenseType = licenseType,
                StartDate = startDate.ToString("yyyy-MM-dd"),
                ExpiryDate = expiryDate.ToString("yyyy-MM-dd"),
                MACAddress = macAddress,
                NumberOfUsers = numberOfUsers,
                //NumberOfCameras = numberOfCameras,
                //TrialDurationDays = trialDurationDays,
                NoOfChannel = noOfChannel
            };

            string licenseJson = JsonConvert.SerializeObject(licenseData);

            // Load private key
            _rsa.ImportFromPem(privateKeyPem);
            //_rsa.ImportFromPem(File.ReadAllText(privateKeyPath));

            // Sign the license data
            byte[] dataBytes = Encoding.UTF8.GetBytes(licenseJson);
            byte[] signatureBytes = _rsa.SignData(dataBytes, HashAlgorithmName.SHA256, RSASignaturePadding.Pkcs1);

            // Add signature to license JSON
            var signedLicense = new
            {
                Data = _encryptionDecryptionService.EncryptString(licenseJson),
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
