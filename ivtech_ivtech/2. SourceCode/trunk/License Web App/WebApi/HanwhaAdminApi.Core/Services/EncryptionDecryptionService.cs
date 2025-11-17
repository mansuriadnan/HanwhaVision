using HanwhaAdminApi.Core.Interfaces;
using Microsoft.Extensions.Configuration;
using System.Security.Cryptography;
using System.Text;

namespace HanwhaAdminApi.Core.Services
{
    public class EncryptionDecryptionService : IEncryptionDecryptionService
    {
        private string EncryptionDecryptionServiceKey;
        public EncryptionDecryptionService(IConfiguration configuration)
        {
            //this.config = config.Value;
            EncryptionDecryptionServiceKey = configuration.GetSection("EncryptionDecryptionService:Key").Value;
        }

        //For Moq Testing
        
        /// <summary>
        /// Return encrypted data from the plain text
        /// </summary>
        /// <param name="plainText"></param>
        /// <returns></returns>
        public string EncryptString(string plainText)
        {
            byte[] iv = new byte[16];
            byte[] array;

            using (Aes aes = Aes.Create())
            {
                aes.Key = Encoding.UTF8.GetBytes(EncryptionDecryptionServiceKey);
                aes.IV = iv;

                ICryptoTransform encryptor = aes.CreateEncryptor(aes.Key, aes.IV);

                using (MemoryStream memoryStream = new MemoryStream())
                {
                    using (CryptoStream cryptoStream = new CryptoStream((Stream)memoryStream, encryptor, CryptoStreamMode.Write))
                    {
                        using (StreamWriter streamWriter = new StreamWriter((Stream)cryptoStream))
                        {
                            streamWriter.Write(plainText);
                        }

                        array = memoryStream.ToArray();
                    }
                }
            }

            return Convert.ToBase64String(array);
        }

        /// <summary>
        /// Return plain text from the cipher text
        /// </summary>
        /// <param name="cipherText"></param>
        /// <returns></returns>
        public string DecryptString(string cipherText)
        {
            if (string.IsNullOrEmpty(cipherText))
                return string.Empty;

            // check if string is not base64 encoded
            if (cipherText.Length % 4 != 0
                || cipherText.Contains(" ")
                || cipherText.Contains("\t")
                || cipherText.Contains("\r")
                || cipherText.Contains("\n"))
            {
                return cipherText;
            }

            byte[] iv = new byte[16];
            byte[] buffer = Convert.FromBase64String(cipherText);

            using (Aes aes = Aes.Create())
            {
                aes.Key = Encoding.UTF8.GetBytes(EncryptionDecryptionServiceKey);
                aes.IV = iv;
                ICryptoTransform decryptor = aes.CreateDecryptor(aes.Key, aes.IV);

                using (MemoryStream memoryStream = new MemoryStream(buffer))
                {
                    using (CryptoStream cryptoStream = new CryptoStream((Stream)memoryStream, decryptor, CryptoStreamMode.Read))
                    {
                        using (StreamReader streamReader = new StreamReader((Stream)cryptoStream))
                        {
                            return streamReader.ReadToEnd();
                        }
                    }
                }
            }
        }
    }
}
