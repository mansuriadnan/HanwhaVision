using HanwhaClient.Application.Interfaces;
using HanwhaClient.Model.Dto;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Web.Administration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Application.Services
{
    //public class DevelopmentFriendlyPFXCertificateService : ISSLCertificateService
    //{
    //    private readonly ILogger<DevelopmentFriendlyPFXCertificateService> _logger;
    //    private readonly IWebHostEnvironment _environment;

    //    public DevelopmentFriendlyPFXCertificateService(
    //        ILogger<DevelopmentFriendlyPFXCertificateService> logger,
    //        IWebHostEnvironment environment)
    //    {
    //        _logger = logger;
    //        _environment = environment;
    //    }

    //    public async Task<CertificateUploadResult> UploadSSLCertificateAsync(IFormFile pfxFile, string password, string siteName, int port = 443)
    //    {
    //        var result = new CertificateUploadResult();

    //        try
    //        {
    //            // Validate inputs
    //            if (pfxFile == null || pfxFile.Length == 0)
    //            {
    //                result.Success = false;
    //                result.ErrorMessage = "PFX file is required";
    //                return result;
    //            }

    //            // Load PFX certificate
    //            byte[] pfxBytes;
    //            using (var memoryStream = new MemoryStream())
    //            {
    //                await pfxFile.CopyToAsync(memoryStream);
    //                pfxBytes = memoryStream.ToArray();
    //            }

    //            var certificate = new X509Certificate2(pfxBytes, password,
    //                X509KeyStorageFlags.Exportable |
    //                X509KeyStorageFlags.PersistKeySet |
    //                X509KeyStorageFlags.MachineKeySet);

    //            // Install certificate with environment-aware approach
    //            await InstallCertificateAsync(certificate);

    //            // Configure IIS binding (only in production/IIS environment)
    //            if (!_environment.IsDevelopment() || IsRunningOnIIS())
    //            {
    //                await ConfigureIISSSLBindingAsync(certificate, siteName, port);
    //            }
    //            else
    //            {
    //                _logger.LogInformation("Development environment detected - skipping IIS binding configuration");
    //            }

    //            result.Success = true;
    //            result.CertificateInfo = new CertificateInfoDto
    //            {
    //                Subject = certificate.Subject,
    //                Issuer = certificate.Issuer,
    //                Thumbprint = certificate.Thumbprint,
    //                NotBefore = certificate.NotBefore,
    //                NotAfter = certificate.NotAfter,
    //                SerialNumber = certificate.SerialNumber
    //            };

    //            _logger.LogInformation($"PFX certificate successfully processed for site: {siteName}");

    //        }
    //        catch (CryptographicException ex)
    //        {
    //            result.Success = false;
    //            result.ErrorMessage = "Invalid PFX file or incorrect password";
    //            _logger.LogError(ex, "Cryptographic error processing PFX file");
    //        }
    //        catch (UnauthorizedAccessException ex)
    //        {
    //            result.Success = false;
    //            result.ErrorMessage = GetPermissionErrorMessage();
    //            _logger.LogError(ex, "Access denied error");
    //        }
    //        catch (Exception ex)
    //        {
    //            result.Success = false;
    //            result.ErrorMessage = $"Error processing PFX certificate: {ex.Message}";
    //            _logger.LogError(ex, "Error processing PFX certificate");
    //        }

    //        return result;
    //    }

    //    private async Task InstallCertificateAsync(X509Certificate2 certificate)
    //    {
    //        await Task.Run(() =>
    //        {
    //            bool installed = false;
    //            Exception lastException = null;

    //            // Try different approaches based on environment and permissions
    //            var approaches = GetCertificateInstallationApproaches();

    //            foreach (var approach in approaches)
    //            {
    //                try
    //                {
    //                    approach.InstallCertificate(certificate);
    //                    _logger.LogInformation($"Certificate installed using {approach.Name}");
    //                    installed = true;
    //                    break;
    //                }
    //                catch (Exception ex)
    //                {
    //                    _logger.LogWarning($"Failed to install certificate using {approach.Name}: {ex.Message}");
    //                    lastException = ex;
    //                    continue;
    //                }
    //            }

    //            if (!installed)
    //            {
    //                throw new InvalidOperationException(
    //                    $"Failed to install certificate using all available methods. Last error: {lastException?.Message}");
    //            }
    //        });
    //    }

    //    private List<ICertificateInstallationApproach> GetCertificateInstallationApproaches()
    //    {
    //        var approaches = new List<ICertificateInstallationApproach>();

    //        // Approach 1: LocalMachine store (Production/IIS)
    //        if (!_environment.IsDevelopment() || IsRunningOnIIS())
    //        {
    //            approaches.Add(new LocalMachineStoreApproach(_logger));
    //        }

    //        // Approach 2: CurrentUser store (Development)
    //        approaches.Add(new CurrentUserStoreApproach(_logger));

    //        // Approach 3: Development simulation (for testing without actual installation)
    //        if (_environment.IsDevelopment())
    //        {
    //            approaches.Add(new DevelopmentSimulationApproach(_logger));
    //        }

    //        return approaches;
    //    }

    //    private bool IsRunningOnIIS()
    //    {
    //        try
    //        {
    //            // Check if we're running under IIS
    //            return !string.IsNullOrEmpty(Environment.GetEnvironmentVariable("APP_POOL_ID"));
    //        }
    //        catch
    //        {
    //            return false;
    //        }
    //    }

    //    private string GetPermissionErrorMessage()
    //    {
    //        if (_environment.IsDevelopment())
    //        {
    //            return "Development environment: Run Visual Studio as Administrator or test on the actual IIS site. " +
    //                   "The LocalSystem setting only applies to the IIS-hosted application, not the VS development server.";
    //        }
    //        else
    //        {
    //            return "Insufficient permissions to access certificate store. " +
    //                   "Verify that the application pool identity has the required permissions.";
    //        }
    //    }

    //    private async Task ConfigureIISSSLBindingAsync(X509Certificate2 certificate, string siteName, int port)
    //    {
    //        await Task.Run(() =>
    //        {
    //            try
    //            {
    //                using var serverManager = new ServerManager();
    //                var site = serverManager.Sites.FirstOrDefault(s => s.Name.Equals(siteName, StringComparison.OrdinalIgnoreCase));

    //                if (site == null)
    //                {
    //                    _logger.LogWarning($"IIS site '{siteName}' not found - certificate installed but binding not configured");
    //                    return;
    //                }

    //                // Remove existing HTTPS binding on the same port
    //                var existingHttpsBinding = site.Bindings.FirstOrDefault(b =>
    //                    b.Protocol.Equals("https", StringComparison.OrdinalIgnoreCase) &&
    //                    b.EndPoint.Port == port);

    //                if (existingHttpsBinding != null)
    //                {
    //                    _logger.LogInformation($"Removing existing HTTPS binding on port {port}");
    //                    site.Bindings.Remove(existingHttpsBinding);
    //                }

    //                // Add new HTTPS binding with the PFX certificate
    //                var binding = site.Bindings.Add($"*:{port}:", certificate.GetCertHash(), "My");
    //                binding.Protocol = "https";
    //                binding.SslFlags = SslFlags.None;

    //                serverManager.CommitChanges();
    //                _logger.LogInformation($"HTTPS binding configured on port {port} with certificate thumbprint: {certificate.Thumbprint}");
    //            }
    //            catch (Exception ex)
    //            {
    //                _logger.LogError(ex, "Error configuring IIS SSL binding");
    //                throw;
    //            }
    //        });
    //    }
    //}

    // Certificate Installation Approaches
    public interface ICertificateInstallationApproach
    {
        string Name { get; }
        void InstallCertificate(X509Certificate2 certificate);
    }

    public class LocalMachineStoreApproach : ICertificateInstallationApproach
    {
        private readonly ILogger _logger;
        public string Name => "LocalMachine Certificate Store";

        public LocalMachineStoreApproach(ILogger logger)
        {
            _logger = logger;
        }

        public void InstallCertificate(X509Certificate2 certificate)
        {
            using var store = new X509Store(StoreName.My, StoreLocation.LocalMachine);
            store.Open(OpenFlags.ReadWrite);

            // Remove existing certificate if present
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
    }

    public class CurrentUserStoreApproach : ICertificateInstallationApproach
    {
        private readonly ILogger _logger;
        public string Name => "CurrentUser Certificate Store";

        public CurrentUserStoreApproach(ILogger logger)
        {
            _logger = logger;
        }

        public void InstallCertificate(X509Certificate2 certificate)
        {
            using var store = new X509Store(StoreName.My, StoreLocation.CurrentUser);
            store.Open(OpenFlags.ReadWrite);

            // Remove existing certificate if present
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
    }

    public class DevelopmentSimulationApproach : ICertificateInstallationApproach
    {
        private readonly ILogger _logger;
        public string Name => "Development Simulation (No actual installation)";

        public DevelopmentSimulationApproach(ILogger logger)
        {
            _logger = logger;
        }

        public void InstallCertificate(X509Certificate2 certificate)
        {
            // Simulate certificate installation for development
            _logger.LogInformation($"DEVELOPMENT MODE: Simulating certificate installation for {certificate.Subject}");
            _logger.LogInformation($"Certificate Thumbprint: {certificate.Thumbprint}");
            _logger.LogInformation($"Valid From: {certificate.NotBefore} To: {certificate.NotAfter}");

            // In development, we can validate the certificate without actually installing it
            if (!certificate.HasPrivateKey)
            {
                throw new InvalidOperationException("Certificate does not contain a private key");
            }

            if (certificate.NotAfter < DateTime.Now)
            {
                throw new InvalidOperationException("Certificate has expired");
            }
        }
    }
}
