using HanwhaClient.Application.Interfaces;
using HanwhaClient.Helper;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.Dto;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Cryptography.X509Certificates;

namespace HanwhaClient.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SSLCertificateController : ControllerBase
    {
        private readonly ISSLCertificateService _sslService;

        public SSLCertificateController(ISSLCertificateService pfxService)
        {
            _sslService = pfxService;
        }

        [CustomAuthorize([ScreenNames.ViewSSLConfigurations])]
        [HttpPost("SSLCertificateUpload")]
        public async Task<ActionResult<StandardAPIResponse<string>>> SaveSSLCertificate(SSLUploadRequestDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _sslService.UploadSSLCertificateAsync(
                    dto.CertificateFile,
                    dto.Password,
                    "MyApp",
                    443
                );

                if (result.Success)
                {
                    //return Ok(new
                    //{
                    //    success = true,
                    //    message = "PFX certificate uploaded and configured successfully",
                    //    certificate = result.CertificateInfo
                    //});
                    return StandardAPIResponse<string>.SuccessResponse(dto.CertificateFile.FileName, AppMessageConstants.FileUploaded);
                }
                else
                {
                    //return BadRequest(new
                    //{
                    //    success = false,
                    //    message = result.ErrorMessage
                    //});

                    return StandardAPIResponse<string>.ErrorResponse("false", result.ErrorMessage, StatusCodes.Status401Unauthorized);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Internal server error occurred while processing PFX certificate"
                });
            }
        }

        [CustomAuthorize([ScreenNames.ViewSSLConfigurations])]
        [HttpPost("validate")]
        public async Task<IActionResult> ValidatePFXCertificate(IFormFile pfxFile)
        {
            try
            {
                var result = await _sslService.ValidateSSLFileAsync(pfxFile, "123@Adnan");

                return Ok(new
                {
                    isValid = result.IsValid,
                    errors = result.Errors,
                    warnings = result.Warnings,
                    certificate = result.CertificateInfo
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error validating PFX certificate" });
            }
        }

        [CustomAuthorize([ScreenNames.ViewSSLConfigurations])]
        [HttpGet("sites")]
        public async Task<IActionResult> GetIISSites()
        {
            try
            {
                var sites = await _sslService.GetAvailableSitesAsync();
                return Ok(sites);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving IIS sites" });
            }
        }
        [CustomAuthorize([ScreenNames.ViewSSLConfigurations])]
        [HttpGet("test-permissions")]
        public IActionResult TestPermissions()
        {
            try
            {
                using var store = new X509Store(StoreName.My, StoreLocation.LocalMachine);
                store.Open(OpenFlags.ReadWrite);
                store.Close();
                return Ok("LocalMachine store: SUCCESS");
            }
            catch (Exception ex)
            {
                try
                {
                    using var userStore = new X509Store(StoreName.My, StoreLocation.CurrentUser);
                    userStore.Open(OpenFlags.ReadWrite);
                    userStore.Close();
                    return Ok("CurrentUser store: SUCCESS");
                }
                catch (Exception ex2)
                {
                    return Ok($"Both stores failed - LocalMachine: {ex.Message}, CurrentUser: {ex2.Message}");
                }
            }
        }
    }
}
