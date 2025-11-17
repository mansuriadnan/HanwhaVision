using HanwhaAdminApi.Model.Common;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaAdminApi.Core.Services.License
{
    public class LicenseValidator
    {
        private static RSA _rsa = RSA.Create();

        public static (bool isValid, string errorMessage, dynamic? licenseData) ValidateLicense(string licenseFilePath, string publicKeyPath, string currentHardwareId)
        {
            if (!File.Exists(licenseFilePath))
            {
                Console.WriteLine("License file not found.");
                return (false, AppMessageConstants.LicenseFileNotFound, null);
            }

            if (!File.Exists(publicKeyPath))
            {
                Console.WriteLine("License authentication key not found.");
                return (false, AppMessageConstants.LicenseAuthenticationKey, null);
            }

            string licenseJson = File.ReadAllText(licenseFilePath);
            var signedLicense = JsonConvert.DeserializeObject<dynamic>(licenseJson);

            string licenseDataJson = JsonConvert.SerializeObject(signedLicense.Data);
            string signature = signedLicense.Signature;

            // Load public key
            //_rsa.ImportFromPem(publicKeyPath);
            _rsa.ImportFromPem(File.ReadAllText(publicKeyPath));

            // Verify signature
            byte[] dataBytes = Encoding.UTF8.GetBytes(licenseDataJson);
            byte[] signatureBytes = Convert.FromBase64String(signature);
            bool isSignatureValid = _rsa.VerifyData(dataBytes, signatureBytes, HashAlgorithmName.SHA256, RSASignaturePadding.Pkcs1);

            if (!isSignatureValid)
            {
                Console.WriteLine("Invalid license signature.");
                return (false, AppMessageConstants.InvalidLicenseSignature, null);
            }

            //// Validate expiryDate
            string licenseExpiryData = signedLicense.Data.ExpiryDate;
            if (!CheckLicenseExpiry(licenseExpiryData))
            {
                return (false, AppMessageConstants.LicenseExpired, null);
            }

            // Verify hardware ID
            string licenseHardwareId = signedLicense.Data.HardwareId.ToString();
            if (!string.IsNullOrEmpty(licenseHardwareId) && licenseHardwareId != currentHardwareId)
            {
                Console.WriteLine("License does not match this hardware.");
                return (false, AppMessageConstants.LicenseMismatch, null);
            }

            Console.WriteLine("License is valid.");
            return (true, string.Empty, signedLicense.Data);
        }

        private static bool CheckLicenseExpiry(string licenseExpiryData)
        {
            // Attempt to parse the expiry date
            if (DateTime.TryParse(licenseExpiryData, out DateTime expiryDate))
            {
                DateTime currentDate = DateTime.Now;

                // Compare expiry date with current date
                if (expiryDate < currentDate)
                {
                    return false;
                }
                else if (expiryDate == currentDate)
                {
                    return true;
                }
                else
                {
                    return true;
                }
            }
            else
            {
                return false;
            }
        }
    }
}
