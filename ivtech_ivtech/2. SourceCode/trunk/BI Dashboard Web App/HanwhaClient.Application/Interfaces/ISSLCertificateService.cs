using HanwhaClient.Model.Dto;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Application.Interfaces
{
    public interface ISSLCertificateService
    {
        Task<CertificateUploadResult> UploadSSLCertificateAsync(IFormFile pfxFile, string password, string siteName, int port = 443);
        Task<SSLValidationResult> ValidateSSLFileAsync(IFormFile pfxFile, string password);
        Task<List<IISSiteDto>> GetAvailableSitesAsync();
    }
}
