using Microsoft.AspNetCore.Authorization;
using System.Text;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using HanwhaClient.Application.Interfaces;
using HanwhaClient.Infrastructure.Interfaces;
using static System.Net.WebRequestMethods;

namespace HanwhaClient.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CameraStreamController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;
        private readonly IDeviceMasterRepository _deviceMasterRepository;

        // Camera configuration - move these to appsettings.json in production
        private const string CAMERA_IP = "http://10.37.58.245/"; // Replace with your actual IP
        private const string USERNAME = "admin";  // Replace with your username
        private const string PASSWORD = "TeamIndia@2025";  // Replace with your password

        public CameraStreamController(IHttpClientFactory httpClientFactory, IConfiguration configuration, IDeviceMasterRepository deviceMasterRepository)
        {
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
            _deviceMasterRepository = deviceMasterRepository;
        }


        [HttpGet("snapshot")]
        public async Task<IActionResult> GetSnapshot([FromQuery] string ipAddress = "", [FromQuery] int channel = 0, [FromQuery] int profile = 1)
        {
            try
            {
                if (ipAddress == "")
                {
                    return StatusCode(StatusCodes.Status404NotFound, $"Failed to get snapshot. Status: StatusCodes.Status404NotFound");

                }

                var deviceData = await _deviceMasterRepository.GetDeviceDataByIpAddressAsync(ipAddress);
                if (deviceData == null)
                {

                    return StatusCode(StatusCodes.Status404NotFound, $"Failed to get snapshot. Status: StatusCodes.Status404NotFound");
                }

                string httpURL = deviceData.IsHttps ? "https://" : "http://";

                var cameraBaseUrl = httpURL + ipAddress;
                var username = deviceData.UserName;
                var password = deviceData.Password;



                var snapshotUrl = $"{cameraBaseUrl}/stw-cgi/video.cgi?msubmenu=snapshot&action=view&";

                // Create HTTP client with digest authentication
                var handler = new DigestAuthenticationHandler(username, password);
                using var client = new HttpClient(handler);

                var response = await client.GetAsync(snapshotUrl);

                if (!response.IsSuccessStatusCode)
                {
                    return StatusCode((int)response.StatusCode, $"Failed to get snapshot. Status: {response.StatusCode}");
                }

                var imageBytes = await response.Content.ReadAsByteArrayAsync();
                return File(imageBytes, "image/jpeg");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error getting snapshot: {ex.Message}");
            }
        }

    }
}
