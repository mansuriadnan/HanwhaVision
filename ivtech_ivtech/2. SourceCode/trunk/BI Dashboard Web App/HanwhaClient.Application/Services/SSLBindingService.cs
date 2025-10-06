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
    public class SSLBindingService : ISSLBindingService
    {
        private readonly ILogger<SSLBindingService> _logger;

        public SSLBindingService(ILogger<SSLBindingService> logger)
        {
            _logger = logger;
        }

        public async Task<SSLBindingResponse> AddSSLBindingAsync(SSLBindingRequest request)
        {
            try
            {
                _logger.LogInformation($"Starting SSL binding process for site: {request.SiteName}");

                // Step 1: Import PFX certificate
                var certificate = ImportPfxCertificate(request.PfxFilePath, request.PfxPassword);
                _logger.LogInformation($"Certificate imported successfully. Thumbprint: {certificate.Thumbprint}");

                // Step 2: Create IIS binding
                using (var serverManager = new ServerManager())
                {
                    var site = serverManager.Sites[request.SiteName];
                    if (site == null)
                    {
                        throw new ArgumentException($"Site '{request.SiteName}' not found");
                    }

                    // Check if binding already exists
                    var existingBinding = site.Bindings.FirstOrDefault(b =>
                        b.Protocol == "https" &&
                        b.EndPoint.Port == request.Port);

                    if (existingBinding != null)
                    {
                        _logger.LogWarning($"HTTPS binding on port {request.Port} already exists. Updating certificate...");
                        existingBinding.CertificateHash = certificate.GetCertHash();
                        existingBinding.CertificateStoreName = "My";
                    }
                    else
                    {
                        // Create new binding
                        var binding = site.Bindings.Add($"{request.IpAddress}:{request.Port}:", certificate.GetCertHash(), "My");
                        binding.Protocol = "https";
                        _logger.LogInformation($"New HTTPS binding created on port {request.Port}");
                    }

                    // Commit changes
                    serverManager.CommitChanges();
                }

                return new SSLBindingResponse
                {
                    Success = true,
                    Message = "SSL binding created successfully",
                    CertificateThumbprint = certificate.Thumbprint,
                    SiteName = request.SiteName,
                    Port = request.Port
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating SSL binding");
                return new SSLBindingResponse
                {
                    Success = false,
                    Message = $"Error: {ex.Message}"
                };
            }
        }

        // Services/SSLBindingService.cs - Add new method
        public async Task<SSLBindingResponse> AddSSLBindingWithUploadAsync(IFormFile pfxFile, SSLBindingUploadRequest request)
        {
            try
            {
                _logger.LogInformation($"Starting SSL binding process with file upload for site: {request.SiteName}");

                // Validate uploaded file
                if (pfxFile == null || pfxFile.Length == 0)
                {
                    throw new ArgumentException("PFX file is required");
                }

                if (!pfxFile.FileName.ToLower().EndsWith(".pfx"))
                {
                    throw new ArgumentException("File must be a .pfx certificate file");
                }

                // Step 1: Import PFX certificate from uploaded file
                X509Certificate2 certificate;
                using (var memoryStream = new MemoryStream())
                {
                    await pfxFile.CopyToAsync(memoryStream);
                    certificate = ImportPfxCertificateFromBytes(memoryStream.ToArray(), request.PfxPassword);
                }

                _logger.LogInformation($"Certificate imported successfully from uploaded file. Thumbprint: {certificate.Thumbprint}");

                // Step 2: Create IIS binding (same as before)
                using (var serverManager = new ServerManager())
                {
                    var site = serverManager.Sites[request.SiteName];
                    if (site == null)
                    {
                        throw new ArgumentException($"Site '{request.SiteName}' not found");
                    }

                    // Check if binding already exists
                    var existingBinding = site.Bindings.FirstOrDefault(b =>
                        b.Protocol == "https" &&
                        b.EndPoint.Port == request.Port);

                    if (existingBinding != null)
                    {
                        _logger.LogWarning($"HTTPS binding on port {request.Port} already exists. Updating certificate...");
                        existingBinding.CertificateHash = certificate.GetCertHash();
                        existingBinding.CertificateStoreName = "My";
                    }
                    else
                    {
                        // Create new binding
                        var binding = site.Bindings.Add($"{request.IpAddress}:{request.Port}:", certificate.GetCertHash(), "My");
                        binding.Protocol = "https";
                        _logger.LogInformation($"New HTTPS binding created on port {request.Port}");
                    }

                    // Commit changes
                    serverManager.CommitChanges();
                }

                return new SSLBindingResponse
                {
                    Success = true,
                    Message = "SSL binding created successfully with uploaded certificate",
                    CertificateThumbprint = certificate.Thumbprint,
                    SiteName = request.SiteName,
                    Port = request.Port
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating SSL binding with uploaded file");
                return new SSLBindingResponse
                {
                    Success = false,
                    Message = $"Error: {ex.Message}"
                };
            }
        }

        // Add this new private method to handle byte array import
        private X509Certificate2 ImportPfxCertificateFromBytes(byte[] pfxBytes, string password)
        {
            var certificate = new X509Certificate2(pfxBytes, password, X509KeyStorageFlags.MachineKeySet | X509KeyStorageFlags.PersistKeySet);

            // Import into Local Machine Personal store
            using (var store = new X509Store(StoreName.My, StoreLocation.LocalMachine))
            {
                store.Open(OpenFlags.ReadWrite);

                // Check if certificate already exists
                var existingCert = store.Certificates.Find(X509FindType.FindByThumbprint, certificate.Thumbprint, false);
                if (existingCert.Count == 0)
                {
                    store.Add(certificate);
                }

                store.Close();
            }

            return certificate;
        }

        public async Task<List<object>> GetSiteBindingsAsync(string siteName)
        {
            try
            {
                using (var serverManager = new ServerManager())
                {
                    var site = serverManager.Sites[siteName];
                    if (site == null)
                    {
                        throw new ArgumentException($"Site '{siteName}' not found");
                    }

                    return site.Bindings.Select(b => new
                    {
                        Protocol = b.Protocol,
                        Port = b.EndPoint?.Port,
                        IpAddress = b.EndPoint?.Address?.ToString() ?? "*",
                        HostHeader = b.Host,
                        CertificateHash = b.CertificateHash != null ? Convert.ToHexString(b.CertificateHash) : null,
                        CertificateStore = b.CertificateStoreName
                    }).ToList<object>();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving site bindings");
                throw;
            }
        }

        public async Task<bool> RemoveSSLBindingAsync(string siteName, int port)
        {
            try
            {
                using (var serverManager = new ServerManager())
                {
                    var site = serverManager.Sites[siteName];
                    if (site == null)
                    {
                        throw new ArgumentException($"Site '{siteName}' not found");
                    }

                    var binding = site.Bindings.FirstOrDefault(b =>
                        b.Protocol == "https" &&
                        b.EndPoint.Port == port);

                    if (binding != null)
                    {
                        site.Bindings.Remove(binding);
                        serverManager.CommitChanges();
                        _logger.LogInformation($"SSL binding on port {port} removed successfully");
                        return true;
                    }

                    return false;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing SSL binding");
                throw;
            }
        }

        private X509Certificate2 ImportPfxCertificate(string pfxPath, string password)
        {
            if (!File.Exists(pfxPath))
            {
                throw new FileNotFoundException($"PFX file not found: {pfxPath}");
            }

            var certificate = new X509Certificate2(pfxPath, password, X509KeyStorageFlags.MachineKeySet | X509KeyStorageFlags.PersistKeySet);

            // Import into Local Machine Personal store
            using (var store = new X509Store(StoreName.My, StoreLocation.LocalMachine))
            {
                store.Open(OpenFlags.ReadWrite);

                // Check if certificate already exists
                var existingCert = store.Certificates.Find(X509FindType.FindByThumbprint, certificate.Thumbprint, false);
                if (existingCert.Count == 0)
                {
                    store.Add(certificate);
                }

                store.Close();
            }

            return certificate;
        }
    }
}
