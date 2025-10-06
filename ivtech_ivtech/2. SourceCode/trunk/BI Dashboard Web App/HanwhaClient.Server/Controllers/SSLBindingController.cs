using HanwhaClient.Application.Interfaces;
using HanwhaClient.Model.Dto;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HanwhaClient.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SSLBindingController : ControllerBase
    {
        private readonly ISSLBindingService _sslBindingService;
        private readonly ILogger<SSLBindingController> _logger;

        public SSLBindingController(ISSLBindingService sslBindingService, ILogger<SSLBindingController> logger)
        {
            _sslBindingService = sslBindingService;
            _logger = logger;
        }

        [HttpPost("add")]
        public async Task<ActionResult<ApiResponse<SSLBindingResponse>>> AddSSLBinding([FromBody] SSLBindingRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.SiteName) ||
                    string.IsNullOrEmpty(request.PfxFilePath) ||
                    string.IsNullOrEmpty(request.PfxPassword))
                {
                    return BadRequest(new ApiResponse<SSLBindingResponse>
                    {
                        Success = false,
                        Error = "SiteName, PfxFilePath, and PfxPassword are required"
                    });
                }

                var result = await _sslBindingService.AddSSLBindingAsync(request);

                if (result.Success)
                {
                    return Ok(new ApiResponse<SSLBindingResponse>
                    {
                        Success = true,
                        Message = "SSL binding added successfully",
                        Data = result
                    });
                }
                else
                {
                    return BadRequest(new ApiResponse<SSLBindingResponse>
                    {
                        Success = false,
                        Error = result.Message
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in AddSSLBinding endpoint");
                return StatusCode(500, new ApiResponse<SSLBindingResponse>
                {
                    Success = false,
                    Error = "Internal server error occurred"
                });
            }
        }

        [HttpGet("bindings/{siteName}")]
        public async Task<ActionResult<ApiResponse<List<object>>>> GetSiteBindings(string siteName)
        {
            try
            {
                var bindings = await _sslBindingService.GetSiteBindingsAsync(siteName);

                return Ok(new ApiResponse<List<object>>
                {
                    Success = true,
                    Message = "Bindings retrieved successfully",
                    Data = bindings
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving site bindings");
                return StatusCode(500, new ApiResponse<List<object>>
                {
                    Success = false,
                    Error = ex.Message
                });
            }
        }

        [HttpDelete("remove/{siteName}/{port}")]
        public async Task<ActionResult<ApiResponse<bool>>> RemoveSSLBinding(string siteName, int port)
        {
            try
            {
                var result = await _sslBindingService.RemoveSSLBindingAsync(siteName, port);

                return Ok(new ApiResponse<bool>
                {
                    Success = true,
                    Message = result ? "SSL binding removed successfully" : "SSL binding not found",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing SSL binding");
                return StatusCode(500, new ApiResponse<bool>
                {
                    Success = false,
                    Error = ex.Message
                });
            }
        }

        [HttpPost("add-with-upload")]
        public async Task<ActionResult<ApiResponse<SSLBindingResponse>>> AddSSLBindingWithUpload(
    IFormFile pfxFile,
    [FromForm] string siteName,
    [FromForm] string pfxPassword,
    [FromForm] int port = 443,
    [FromForm] string ipAddress = "*")
        {
            try
            {
                // Validate required parameters
                if (string.IsNullOrEmpty(siteName) || string.IsNullOrEmpty(pfxPassword))
                {
                    return BadRequest(new ApiResponse<SSLBindingResponse>
                    {
                        Success = false,
                        Error = "SiteName and PfxPassword are required"
                    });
                }

                if (pfxFile == null || pfxFile.Length == 0)
                {
                    return BadRequest(new ApiResponse<SSLBindingResponse>
                    {
                        Success = false,
                        Error = "PFX file is required"
                    });
                }

                // Validate file size (max 10MB for certificate files)
                if (pfxFile.Length > 10 * 1024 * 1024)
                {
                    return BadRequest(new ApiResponse<SSLBindingResponse>
                    {
                        Success = false,
                        Error = "PFX file size cannot exceed 10MB"
                    });
                }

                var request = new SSLBindingUploadRequest
                {
                    SiteName = siteName,
                    PfxPassword = pfxPassword,
                    Port = port,
                    IpAddress = ipAddress
                };

                var result = await _sslBindingService.AddSSLBindingWithUploadAsync(pfxFile, request);

                if (result.Success)
                {
                    return Ok(new ApiResponse<SSLBindingResponse>
                    {
                        Success = true,
                        Message = "SSL binding added successfully with uploaded certificate",
                        Data = result
                    });
                }
                else
                {
                    return BadRequest(new ApiResponse<SSLBindingResponse>
                    {
                        Success = false,
                        Error = result.Message
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in AddSSLBindingWithUpload endpoint");
                return StatusCode(500, new ApiResponse<SSLBindingResponse>
                {
                    Success = false,
                    Error = "Internal server error occurred"
                });
            }
        }
    }
}
