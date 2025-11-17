// Controllers/CameraController.cs
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.Text;

namespace CameraStreamAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CameraController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<CameraController> _logger;

        // Camera configuration - Update these values
        private const string CAMERA_BASE_URL = "http://10.37.58.245/"; // Replace with your actual camera IP
        private const string CAMERA_USERNAME = "admin"; // Replace with your camera username
        private const string CAMERA_PASSWORD = "TeamIndia@2025"; // Replace with your camera password

        public CameraController(IHttpClientFactory httpClientFactory, ILogger<CameraController> logger)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

       


        //[HttpPost("stream")]
        //public async Task<IActionResult> GetStreamUrl()
        //{
        //    try
        //    {
        //        // Test camera connectivity first
        //        var isConnected = await TestCameraConnection();
        //        if (!isConnected)
        //        {
        //            return BadRequest("Unable to connect to camera. Please check camera IP, credentials, and network connectivity.");
        //        }

        //        // Return the stream URL for the frontend
        //        var streamUrl = $"/api/camera/proxy-stream";

        //        _logger.LogInformation("Stream URL provided to client: {StreamUrl}", streamUrl);

        //        return Ok(new { streamUrl = streamUrl });
        //    }
        //    catch (Exception ex)
        //    {
        //        _logger.LogError(ex, "Error getting stream URL");
        //        return StatusCode(500, $"Internal server error: {ex.Message}");
        //    }
        //}

        [HttpGet("proxy-stream")]
        public async Task ProxyStream()
        {
            try
            {
                var httpClient = _httpClientFactory.CreateClient();
                httpClient.Timeout = TimeSpan.FromMinutes(30); // Long timeout for streaming

                // Set up basic authentication
                var authValue = Convert.ToBase64String(Encoding.ASCII.GetBytes($"{CAMERA_USERNAME}:{CAMERA_PASSWORD}"));
                httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", authValue);

                // Camera stream URL
                var cameraStreamUrl = $"{CAMERA_BASE_URL}/stw-cgi/video.cgi?msubmenu=stream&action=view";

                _logger.LogInformation("Proxying stream from: {CameraUrl}", cameraStreamUrl);

                // Get the stream from camera
                var response = await httpClient.GetAsync(cameraStreamUrl, HttpCompletionOption.ResponseHeadersRead);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("Camera returned status: {StatusCode}", response.StatusCode);
                    Response.StatusCode = (int)response.StatusCode;
                    return;
                }

                // Set response headers for MJPEG stream
                Response.ContentType = response.Content.Headers.ContentType?.ToString() ?? "multipart/x-mixed-replace; boundary=frame";
                Response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate");
                Response.Headers.Add("Pragma", "no-cache");
                Response.Headers.Add("Expires", "0");

                // Stream the content
                using (var stream = await response.Content.ReadAsStreamAsync())
                {
                    await stream.CopyToAsync(Response.Body);
                }
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "HTTP request error while proxying stream");
                Response.StatusCode = 502; // Bad Gateway
                await Response.WriteAsync("Unable to connect to camera");
            }
            catch (TaskCanceledException ex)
            {
                _logger.LogWarning(ex, "Stream request was cancelled");
                // Client disconnected, this is normal
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while proxying stream");
                Response.StatusCode = 500;
                await Response.WriteAsync("Internal server error");
            }
        }

        //[HttpDelete("stream")]
        //public IActionResult StopStream()
        //{
        //    _logger.LogInformation("Stream stop requested");
        //    return Ok(new { message = "Stream stopped" });
        //}

        [HttpGet("snapshot")]
        public async Task<IActionResult> GetSnapshot()
        {
            try
            {
                var httpClient = _httpClientFactory.CreateClient();

                // Set up basic authentication
                var authValue = Convert.ToBase64String(Encoding.ASCII.GetBytes($"{CAMERA_USERNAME}:{CAMERA_PASSWORD}"));
                httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", authValue);

                // Camera snapshot URL
                var snapshotUrl = $"{CAMERA_BASE_URL}/stw-cgi/video.cgi?msubmenu=snapshot&action=view";

                var response = await httpClient.GetAsync(snapshotUrl);

                if (!response.IsSuccessStatusCode)
                {
                    return BadRequest($"Camera returned status: {response.StatusCode}");
                }

                var imageBytes = await response.Content.ReadAsByteArrayAsync();
                var contentType = response.Content.Headers.ContentType?.ToString() ?? "image/jpeg";

                return File(imageBytes, contentType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting snapshot");
                return StatusCode(500, $"Error getting snapshot: {ex.Message}");
            }
        }

        [HttpGet("status")]
        public async Task<IActionResult> GetCameraStatus()
        {
            try
            {
                var isConnected = await TestCameraConnection();
                return Ok(new
                {
                    isConnected = isConnected,
                    cameraUrl = CAMERA_BASE_URL,
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking camera status");
                return StatusCode(500, $"Error checking camera status: {ex.Message}");
            }
        }

        private async Task<bool> TestCameraConnection()
        {
            try
            {
                var httpClient = _httpClientFactory.CreateClient();
                httpClient.Timeout = TimeSpan.FromSeconds(10);

                // Set up basic authentication
                var authValue = Convert.ToBase64String(Encoding.ASCII.GetBytes($"{CAMERA_USERNAME}:{CAMERA_PASSWORD}"));
                httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", authValue);

                // Test with snapshot endpoint (lighter than stream)
                var testUrl = $"{CAMERA_BASE_URL}/stw-cgi/video.cgi?msubmenu=stream&action=view";

                var response = await httpClient.GetAsync(testUrl);
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Camera connection test failed");
                return false;
            }
        }

        [HttpGet("test-auth")]
        public async Task<IActionResult> TestAuthentication()
        {
            try
            {
                var results = new List<object>();

                // Test Method 1: Standard Basic Auth with UTF-8 encoding
                var result1 = await TestAuthMethod("UTF-8 Basic Auth", () =>
                {
                    var httpClient = CreateAuthenticatedHttpClient();
                    var request = new HttpRequestMessage(HttpMethod.Get, $"{CAMERA_BASE_URL}/stw-cgi/video.cgi?msubmenu=snapshot&action=view");
                    var authValue = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{CAMERA_USERNAME}:{CAMERA_PASSWORD}"));
                    request.Headers.Authorization = new AuthenticationHeaderValue("Basic", authValue);
                    return httpClient.SendAsync(request);
                });
                results.Add(result1);

                // Test Method 2: Basic Auth with ASCII encoding
                var result2 = await TestAuthMethod("ASCII Basic Auth", () =>
                {
                    var httpClient = CreateAuthenticatedHttpClient();
                    var request = new HttpRequestMessage(HttpMethod.Get, $"{CAMERA_BASE_URL}/stw-cgi/video.cgi?msubmenu=snapshot&action=view");
                    var authValue = Convert.ToBase64String(Encoding.ASCII.GetBytes($"{CAMERA_USERNAME}:{CAMERA_PASSWORD}"));
                    request.Headers.Authorization = new AuthenticationHeaderValue("Basic", authValue);
                    return httpClient.SendAsync(request);
                });
                results.Add(result2);

                // Test Method 3: URL encoded credentials
                var result3 = await TestAuthMethod("URL Encoded Credentials", () =>
                {
                    var httpClient = CreateAuthenticatedHttpClient();
                    var encodedUsername = Uri.EscapeDataString(CAMERA_USERNAME);
                    var encodedPassword = Uri.EscapeDataString(CAMERA_PASSWORD);
                    var testUrl = $"{CAMERA_BASE_URL}/stw-cgi/video.cgi?msubmenu=snapshot&action=view&username={encodedUsername}&password={encodedPassword}";
                    var request = new HttpRequestMessage(HttpMethod.Get, testUrl);
                    return httpClient.SendAsync(request);
                });
                results.Add(result3);

                // Test Method 4: No authentication (to see if camera requires it)
                var result4 = await TestAuthMethod("No Authentication", () =>
                {
                    var httpClient = _httpClientFactory.CreateClient();
                    httpClient.Timeout = TimeSpan.FromSeconds(10);
                    var request = new HttpRequestMessage(HttpMethod.Get, $"{CAMERA_BASE_URL}/stw-cgi/video.cgi?msubmenu=snapshot&action=view");
                    return httpClient.SendAsync(request);
                });
                results.Add(result4);

                return Ok(new
                {
                    cameraUrl = CAMERA_BASE_URL,
                    username = CAMERA_USERNAME,
                    testResults = results,
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during authentication testing");
                return StatusCode(500, $"Error during authentication testing: {ex.Message}");
            }
        }

        private HttpClient CreateAuthenticatedHttpClient()
        {
            var httpClient = _httpClientFactory.CreateClient();

            // Set a reasonable timeout
            httpClient.Timeout = TimeSpan.FromSeconds(30);

            // Add additional headers that some cameras might require
            httpClient.DefaultRequestHeaders.Add("User-Agent", "CameraStreamAPI/1.0");
            httpClient.DefaultRequestHeaders.Add("Accept", "*/*");
            httpClient.DefaultRequestHeaders.Add("Connection", "keep-alive");

            return httpClient;
        }

        private async Task<object> TestAuthMethod(string methodName, Func<Task<HttpResponseMessage>> requestFunc)
        {
            try
            {
                _logger.LogInformation("Testing authentication method: {Method}", methodName);

                using var response = await requestFunc();
                var content = await response.Content.ReadAsStringAsync();
                var contentPreview = content.Length > 100 ? content.Substring(0, 100) + "..." : content;

                return new
                {
                    method = methodName,
                    statusCode = (int)response.StatusCode,
                    statusDescription = response.ReasonPhrase,
                    isSuccess = response.IsSuccessStatusCode,
                    contentType = response.Content.Headers.ContentType?.ToString(),
                    contentLength = response.Content.Headers.ContentLength,
                    contentPreview = contentPreview,
                    headers = response.Headers.ToDictionary(h => h.Key, h => string.Join(", ", h.Value))
                };
            }
            catch (Exception ex)
            {
                return new
                {
                    method = methodName,
                    error = ex.Message,
                    isSuccess = false
                };
            }
        }
    }
}