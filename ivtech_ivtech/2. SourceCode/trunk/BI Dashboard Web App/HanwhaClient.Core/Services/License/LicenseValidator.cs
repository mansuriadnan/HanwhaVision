using HanwhaClient.Core.Interfaces;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using static System.Net.Mime.MediaTypeNames;

namespace HanwhaClient.Core.Services.License
{
    public class LicenseValidator
    {
        private static RSA _rsa = RSA.Create();
        private readonly IEncryptionDecryptionService _encryptionDecryptionService;
        private readonly IConfiguration _configuration;
        public LicenseValidator(IEncryptionDecryptionService encryptionDecryptionService)
        {
            this._encryptionDecryptionService = encryptionDecryptionService;
        }

        public (bool isValid, string errorMessage, dynamic? licenseData) ValidateLicense(string licenseFilePath, string publicKeyPath, string currentHardwareId)
        {
            if (!File.Exists(licenseFilePath))
            {
                Console.WriteLine("License file not found.");
                return (false, "License file not found.", null);
            }

            if (!File.Exists(publicKeyPath))
            {
                Console.WriteLine("License authentication key not found.");
                return (false, "License authentication key not found.", null);
            }

            string licenseJson = File.ReadAllText(licenseFilePath);

            var signedLicense = JsonConvert.DeserializeObject<dynamic>(licenseJson);

            string licenseDataJson = _encryptionDecryptionService.DecryptString(Convert.ToString(signedLicense.Data));
            string signature = signedLicense.Signature;

            var signedLicenseData = JsonConvert.DeserializeObject<dynamic>(licenseDataJson);
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
                return (false, "Invalid license signature.", null);
            }

            //// Validate startDate
            string licenseStartDate = signedLicenseData.StartDate;
            if (!CheckLicenseStartDate(licenseStartDate))
            {
                return (false, $"License is valid from {licenseStartDate}.", null);
            }

            //// Validate expiryDate
            string licenseExpiryData = signedLicenseData.ExpiryDate;
            string licenseType = signedLicenseData.LicenseType;
            if (licenseType.ToLower() == "trial" && !CheckLicenseExpiry(licenseExpiryData))
            {
                return (false, "License is expired.", null);
            }

            string licenseHardwareId = signedLicenseData.MACAddress.ToString().ToUpper().Replace(":", "").Replace("-", "");
            string normalizedCurrentHardwareId = currentHardwareId.ToUpper().Replace(":", "").Replace("-", "");

            if (licenseHardwareId != normalizedCurrentHardwareId)
            {
                Console.WriteLine("The uploaded license file is invalid for this machine.");
                return (false, "The uploaded license file is invalid for this machine.", null);
            }

            // Verify hardware ID
            //string licenseHardwareId = signedLicenseData.MACAddress.ToString();
            //if (licenseHardwareId != currentHardwareId)
            //{
            //    Console.WriteLine("License does not match this hardware.");
            //    return (false, "License does not match this hardware.", null);
            //}

            Console.WriteLine("License is valid.");
            return (true, string.Empty, signedLicenseData);
        }

        private static bool CheckLicenseExpiry(string licenseExpiryData)
        {
            // Attempt to parse the expiry date
            if (DateTime.TryParse(licenseExpiryData, out DateTime expiryDate))
            {
                DateTime currentDate = DateTime.Now;

                // Normalize expiry to the end of the day (11:59:59 PM)
                DateTime expiryEndOfDay = expiryDate.Date.AddDays(1).AddTicks(-1);

                // Check if current date is within allowed range
                return currentDate <= expiryEndOfDay;
            }
            else
            {
                return false; // invalid date format
            }
        }


        //private static bool CheckLicenseExpiry(string licenseExpiryData)
        //{
        //    // Attempt to parse the expiry date
        //    if (DateTime.TryParse(licenseExpiryData, out DateTime expiryDate))
        //    {
        //        DateTime currentDate = DateTime.Now;

        //        // Compare expiry date with current date
        //        if (expiryDate < currentDate)
        //        {
        //            return false;
        //        }
        //        else if (expiryDate == currentDate)
        //        {
        //            return true;
        //        }
        //        else
        //        {
        //            return true;
        //        }
        //    }
        //    else
        //    {
        //        return false;
        //    }
        //}

        private static bool CheckLicenseStartDate(string licenseStartData)
        {
            // Attempt to parse the start date
            if (DateTime.TryParse(licenseStartData, out DateTime startDate))
            {
                DateTime currentDate = DateTime.Now.Date;

                // Compare start date with current date
                if (startDate > currentDate)
                {
                    return false;
                }
                else if (startDate == currentDate)
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
