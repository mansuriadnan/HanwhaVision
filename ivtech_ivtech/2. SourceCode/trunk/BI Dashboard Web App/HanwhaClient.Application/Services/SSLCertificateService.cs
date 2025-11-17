using DnsClient.Internal;
using HanwhaClient.Application.Interfaces;
using HanwhaClient.Model.Dto;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Web.Administration;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.Linq;
using System.Security.AccessControl;
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Application.Services
{
    public class SSLCertificateService : ISSLCertificateService
    {
        public async Task<CertificateUploadResult> UploadSSLCertificateAsync(IFormFile pfxFile, string password, string siteName, int port = 443)
        {
            var result = new CertificateUploadResult();

            try
            {
                // Step 1: Validate inputs
                if (pfxFile == null || pfxFile.Length == 0)
                {
                    result.Success = false;
                    result.ErrorMessage = "PFX file is required";
                    return result;
                }

                if (!pfxFile.FileName.ToLower().EndsWith(".pfx"))
                {
                    result.Success = false;
                    result.ErrorMessage = "Only .pfx files are supported";
                    return result;
                }

                // Step 2: Validate PFX file
                var validationResult = await ValidateSSLFileAsync(pfxFile, password);
                if (!validationResult.IsValid)
                {
                    result.Success = false;
                    result.ErrorMessage = string.Join("; ", validationResult.Errors);
                    return result;
                }

                // Step 3: Load PFX certificate
                byte[] pfxBytes;
                using (var memoryStream = new MemoryStream())
                {
                    await pfxFile.CopyToAsync(memoryStream);
                    pfxBytes = memoryStream.ToArray();
                }

                var certificate = new X509Certificate2(pfxBytes, password,
                    X509KeyStorageFlags.Exportable |
                    X509KeyStorageFlags.PersistKeySet |
                    X509KeyStorageFlags.MachineKeySet);

                // Step 4: Install certificate to Windows Certificate Store
                await InstallCertificateAsync(certificate);

                // Step 5: Grant permissions to application pool identity
                await GrantCertificatePermissionsAsync(certificate, siteName);

                // Step 6: Configure IIS SSL binding
                await ConfigureIISSSLBindingAsync(certificate, siteName, port);

                result.Success = true;
                result.CertificateInfo = new CertificateInfoDto
                {
                    Subject = certificate.Subject,
                    Issuer = certificate.Issuer,
                    Thumbprint = certificate.Thumbprint,
                    NotBefore = certificate.NotBefore,
                    NotAfter = certificate.NotAfter,
                    SerialNumber = certificate.SerialNumber
                };
            }
            catch (CryptographicException ex)
            {
                result.Success = false;
                result.ErrorMessage = "Invalid PFX file or incorrect password";
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.ErrorMessage = $"Error processing PFX certificate: {ex.Message}";
            }

            return result;
        }

        public async Task<SSLValidationResult> ValidateSSLFileAsync(IFormFile pfxFile, string password)
        {
            var result = new SSLValidationResult();

            try
            {
                if (pfxFile == null || pfxFile.Length == 0)
                {
                    result.Errors.Add("PFX file is required");
                    return result;
                }

                // Check file extension
                if (!pfxFile.FileName.ToLower().EndsWith(".pfx"))
                {
                    result.Errors.Add("File must have .pfx extension");
                    return result;
                }

                // Check file size (max 10MB)
                if (pfxFile.Length > 10 * 1024 * 1024)
                {
                    result.Errors.Add("PFX file size cannot exceed 10MB");
                    return result;
                }

                // Try to load the certificate to validate format and password
                byte[] pfxBytes;
                using (var memoryStream = new MemoryStream())
                {
                    await pfxFile.CopyToAsync(memoryStream);
                    pfxBytes = memoryStream.ToArray();
                }

                var certificate = new X509Certificate2(pfxBytes, password, X509KeyStorageFlags.DefaultKeySet);

                // Validate certificate properties
                if (!certificate.HasPrivateKey)
                {
                    result.Errors.Add("PFX certificate must contain a private key");
                }

                if (certificate.NotAfter < DateTime.Now)
                {
                    result.Errors.Add($"Certificate has expired on {certificate.NotAfter:yyyy-MM-dd}");
                }

                if (certificate.NotBefore > DateTime.Now)
                {
                    result.Errors.Add($"Certificate is not valid until {certificate.NotBefore:yyyy-MM-dd}");
                }

                // Add warnings
                if (certificate.NotAfter < DateTime.Now.AddDays(30))
                {
                    result.Warnings.Add($"Certificate expires soon: {certificate.NotAfter:yyyy-MM-dd}");
                }

                // Validate certificate chain
                var chain = new X509Chain();
                chain.ChainPolicy.RevocationMode = X509RevocationMode.NoCheck;
                if (!chain.Build(certificate))
                {
                    result.Warnings.Add("Certificate chain validation failed - certificate may not be trusted");
                }

                result.CertificateInfo = new CertificateInfoDto
                {
                    Subject = certificate.Subject,
                    Issuer = certificate.Issuer,
                    Thumbprint = certificate.Thumbprint,
                    NotBefore = certificate.NotBefore,
                    NotAfter = certificate.NotAfter,
                    SerialNumber = certificate.SerialNumber
                };

                result.IsValid = result.Errors.Count == 0;
            }
            catch (CryptographicException)
            {
                result.Errors.Add("Invalid PFX file or incorrect password");
            }
            catch (Exception ex)
            {
                result.Errors.Add($"Error validating PFX file: {ex.Message}");
            }

            return result;
        }

        private async Task InstallCertificateAsync(X509Certificate2 certificate)
        {
            await Task.Run(() =>
            {
                try
                {
                    // Try LocalMachine store first (requires elevated permissions)
                    using var store = new X509Store(StoreName.My, StoreLocation.LocalMachine);
                    store.Open(OpenFlags.ReadWrite);

                    // Check if certificate already exists
                    var existingCert = store.Certificates.Find(X509FindType.FindByThumbprint, certificate.Thumbprint, false);
                    if (existingCert.Count > 0)
                    {
                        foreach (X509Certificate2 cert in existingCert)
                        {
                            store.Remove(cert);
                        }
                    }

                    store.Add(certificate);
                    store.Close();

                }
                catch (CryptographicException ex) when (ex.Message.Contains("Access is denied"))
                {

                    // Fallback to CurrentUser store (doesn't require elevated permissions)
                    using var userStore = new X509Store(StoreName.My, StoreLocation.CurrentUser);
                    userStore.Open(OpenFlags.ReadWrite);

                    var existingCert = userStore.Certificates.Find(X509FindType.FindByThumbprint, certificate.Thumbprint, false);
                    if (existingCert.Count > 0)
                    {
                        foreach (X509Certificate2 cert in existingCert)
                        {
                            userStore.Remove(cert);
                        }
                    }

                    userStore.Add(certificate);
                    userStore.Close();

                }
            });
        }

        private void InstallCertificateUsingPowerShell(X509Certificate2 certificate)
        {
            try
            {
                // Export certificate to temporary file
                string tempPfxPath = Path.GetTempFileName() + ".pfx";
                string tempPassword = Guid.NewGuid().ToString();

                // Export the certificate with private key
                byte[] pfxBytes = certificate.Export(X509ContentType.Pkcs12, tempPassword);
                File.WriteAllBytes(tempPfxPath, pfxBytes);

                // Create PowerShell command to import certificate
                string psCommand = $@"
                $cert = Import-PfxCertificate -FilePath '{tempPfxPath}' -CertStoreLocation Cert:\LocalMachine\My -Password (ConvertTo-SecureString -String '{tempPassword}' -AsPlainText -Force)
                Write-Output $cert.Thumbprint
            ";

                var processInfo = new ProcessStartInfo
                {
                    FileName = "powershell.exe",
                    Arguments = $"-Command \"{psCommand}\"",
                    UseShellExecute = false,
                    CreateNoWindow = true,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true
                };

                using var process = Process.Start(processInfo);
                process?.WaitForExit();

                // Clean up temporary file
                if (File.Exists(tempPfxPath))
                {
                    File.Delete(tempPfxPath);
                }

                if (process?.ExitCode != 0)
                {
                    string error = process.StandardError.ReadToEnd();
                    throw new InvalidOperationException($"PowerShell certificate installation failed: {error}");
                }
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Failed to install certificate using PowerShell: {ex.Message}", ex);
            }
        }

        private async Task GrantCertificatePermissionsAsync(X509Certificate2 certificate, string siteName)
        {
            await Task.Run(() =>
            {
                try
                {
                    // Get the application pool identity for the site
                    string appPoolName = GetApplicationPoolForSite(siteName);
                    string appPoolIdentity = $@"IIS AppPool\{appPoolName}";

                    // Use icacls command to grant permissions to the certificate's private key
                    GrantPrivateKeyPermissionsUsingIcacls(certificate, appPoolIdentity);
                }
                catch (Exception ex)
                {
                    // Log the error but don't fail the entire operation
                    Console.WriteLine($"Warning: Could not grant certificate permissions: {ex.Message}");
                }
            });
        }

        private void GrantPrivateKeyPermissionsUsingIcacls(X509Certificate2 certificate, string identity)
        {
            try
            {
                // Get the private key
                var privateKey = certificate.GetRSAPrivateKey();
                if (privateKey == null)
                {
                    Console.WriteLine("Warning: Certificate does not have an RSA private key");
                    return;
                }

                string keyFilePath = null;

                // Handle CNG keys
                if (privateKey is RSACng cngKey)
                {
                    string keyName = cngKey.Key.KeyName;
                    keyFilePath = $@"C:\ProgramData\Microsoft\Crypto\RSA\MachineKeys\{keyName}";
                }
                // Handle CSP keys
                else if (privateKey is RSACryptoServiceProvider cspKey)
                {
                    string keyContainerName = cspKey.CspKeyContainerInfo.KeyContainerName;

                    // Find the actual key file in the MachineKeys directory
                    string machineKeysPath = @"C:\ProgramData\Microsoft\Crypto\RSA\MachineKeys";
                    var keyFiles = Directory.GetFiles(machineKeysPath);

                    foreach (string keyFile in keyFiles)
                    {
                        try
                        {
                            // Try to match the key container name with file content or use the container name directly
                            if (Path.GetFileName(keyFile).Contains(keyContainerName) ||
                                keyFile.EndsWith(keyContainerName))
                            {
                                keyFilePath = keyFile;
                                break;
                            }
                        }
                        catch
                        {
                            // Skip files that can't be accessed
                            continue;
                        }
                    }
                }

                // Grant permissions using icacls if we found the key file
                if (!string.IsNullOrEmpty(keyFilePath) && File.Exists(keyFilePath))
                {
                    var processInfo = new ProcessStartInfo
                    {
                        FileName = "icacls",
                        Arguments = $"\"{keyFilePath}\" /grant \"{identity}\":(R)",
                        UseShellExecute = false,
                        CreateNoWindow = true,
                        RedirectStandardOutput = true,
                        RedirectStandardError = true
                    };

                    using var process = Process.Start(processInfo);
                    process?.WaitForExit();

                    if (process?.ExitCode == 0)
                    {
                        Console.WriteLine($"Successfully granted certificate permissions to {identity}");
                    }
                    else
                    {
                        Console.WriteLine($"Warning: icacls command failed with exit code {process?.ExitCode}");
                    }
                }
                else
                {
                    Console.WriteLine($"Warning: Could not locate private key file for certificate");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Warning: Could not set certificate permissions: {ex.Message}");
            }
        }

        private string GetApplicationPoolForSite(string siteName)
        {
            using var serverManager = new ServerManager();
            var site = serverManager.Sites.FirstOrDefault(s => s.Name.Equals(siteName, StringComparison.OrdinalIgnoreCase));

            if (site?.Applications?.Count > 0)
            {
                return site.Applications[0].ApplicationPoolName;
            }

            return siteName; // Fallback to site name
        }

        private async Task ConfigureIISSSLBindingAsync(X509Certificate2 certificate, string siteName, int port)
        {
            await Task.Run(() =>
            {
                try
                {
                    using var serverManager = new ServerManager();
                    var site = serverManager.Sites.FirstOrDefault(s => s.Name.Equals(siteName, StringComparison.OrdinalIgnoreCase));

                    if (site == null)
                        throw new InvalidOperationException($"IIS site '{siteName}' not found");

                    // Remove existing HTTPS binding on the same port
                    var existingHttpsBinding = site.Bindings.FirstOrDefault(b =>
                        b.Protocol.Equals("https", StringComparison.OrdinalIgnoreCase) &&
                        b.EndPoint.Port == port);

                    if (existingHttpsBinding != null)
                    {
                        site.Bindings.Remove(existingHttpsBinding);
                    }

                    // Try LocalMachine store first, then CurrentUser
                    string certStore = "My";
                    try
                    {
                        var binding = site.Bindings.Add($"*:{port}:", certificate.GetCertHash(), certStore, SslFlags.None);
                        binding.Protocol = "https";
                        serverManager.CommitChanges();
                    }
                    catch (Exception ex) when (ex.Message.Contains("access") || ex.Message.Contains("denied"))
                    {

                        // Alternative: Use certificate thumbprint directly
                        var binding = site.Bindings.CreateElement();
                        binding.Protocol = "https";
                        binding.BindingInformation = $"*:{port}:";
                        binding.CertificateHash = certificate.GetCertHash();
                        binding.CertificateStoreName = "My";

                        site.Bindings.Add(binding);
                        serverManager.CommitChanges();
                    }
                }
                catch (UnauthorizedAccessException ex)
                {
                    throw new InvalidOperationException("Insufficient permissions to configure IIS. Please run with administrator privileges or configure application pool identity.", ex);
                }
                catch (Exception ex)
                {
                    throw;
                }
            });
        }
        public async Task<List<IISSiteDto>> GetAvailableSitesAsync()
        {
            return await Task.Run(() =>
            {
                using var serverManager = new ServerManager();
                return serverManager.Sites.Select(site => new IISSiteDto
                {
                    Name = site.Name,
                    Id = site.Id,
                    State = site.State.ToString(),
                    Bindings = site.Bindings.Select(b => $"{b.Protocol}://{b.Host}:{b.EndPoint.Port}").ToList()
                }).ToList();
            });
        }
    }
}
