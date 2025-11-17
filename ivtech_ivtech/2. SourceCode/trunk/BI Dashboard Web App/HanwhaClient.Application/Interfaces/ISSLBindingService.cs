using HanwhaClient.Model.Dto;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Application.Interfaces
{
    public interface ISSLBindingService
    {
        Task<SSLBindingResponse> AddSSLBindingAsync(SSLBindingRequest request);
        Task<SSLBindingResponse> AddSSLBindingWithUploadAsync(IFormFile pfxFile, SSLBindingUploadRequest request);
        Task<List<object>> GetSiteBindingsAsync(string siteName);
        Task<bool> RemoveSSLBindingAsync(string siteName, int port);
    }
}
