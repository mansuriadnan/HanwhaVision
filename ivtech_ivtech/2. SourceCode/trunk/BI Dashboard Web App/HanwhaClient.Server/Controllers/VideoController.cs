using FluentFTP;
using HanwhaClient.Application.Interfaces;
using HanwhaClient.Infrastructure.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HanwhaClient.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VideoController : ControllerBase
    {
        private readonly IClientSettingService _clientSettingService;
        private readonly IDeviceEventsRepository _deviceEventsRepository;
        private readonly IDeviceMasterRepository _deviceMasterRepository;

        public VideoController(IClientSettingService clientSettingService, IDeviceEventsRepository deviceEventsRepository, IDeviceMasterRepository deviceMasterRepository, HttpClient httpClient)
        {
            _clientSettingService = clientSettingService;
            _deviceEventsRepository = deviceEventsRepository;
            _deviceMasterRepository = deviceMasterRepository;
           
        }

        [HttpGet("StreamVideoWithTempFile/{eventId}")]
        public async Task<IActionResult> StreamVideoWithTempFile(string eventId)
        {
            string tempFilePath = null;
            FtpClient client = null;
            //eventId = "68523fdaee19ef2ba1f14f64";
            //eventId = "68661a01984fdb5929953e00";
            try
            {
                var result = await _clientSettingService.GetClientSetting();
                var eventData = await _deviceEventsRepository.GetAsync(eventId);

                if (result?.FtpConfiguration == null || eventData == null)
                {
                    return NotFound("Configuration or event data not found");
                }

                var deviceData = await _deviceMasterRepository.GetAsync(eventData.DeviceId);

                if (deviceData == null)
                {
                    return NotFound("device data not found");
                }

                var deviceIp = deviceData.IpAddress.Split(":")[0];
                string ftpHost = result.FtpConfiguration.Host;
                string ftpUser = result.FtpConfiguration.Username;
                string ftpPass = result.FtpConfiguration.Password;

                string fileName = $"{deviceIp}-{eventData.DeviceTime:yy-MM-dd-HH-mm-ss}-EventRule_{eventData.RuleIndex}-CH{eventData.ChannelNo:D2}.mkv";
                //string fileName = "10.37.58.245-25-02-20-13-25-56-EventRule_1-CH01.mkv";
                //string fileName = "10.37.58.245-25-06-15-02-27-56-EventRule_1-CH01.mkv";
                //string fileName = "10.37.58.245-25-06-14-00-03-52-EventRule_1-CH01.mkv";
                //string fileName = "10.37.58.245-25-06-13-23-49-14-EventRule_1-CH01.mkv";
                //string fileName = "10.37.58.245-25-06-13-23-53-04-EventRule_1-CH01.mkv";
                //string fileName = "10.37.58.245-25-06-13-23-34-58-EventRule_1-CH01.mkv";

                client = new FtpClient(ftpHost, ftpUser, ftpPass);
                client.Connect();

                if (!client.FileExists(fileName))
                {
                    return NotFound($"Video file not found: {fileName}");
                }

                // Create temp file
                tempFilePath = Path.GetTempFileName();

                // Download file to temp location
                client.DownloadFile(tempFilePath, fileName);

                // Now we can use the temp file with full range support
                var fileStream = new FileStream(tempFilePath, FileMode.Open, FileAccess.Read, FileShare.Read);

                Response.Headers.Add("Accept-Ranges", "bytes");
                Response.Headers.Add("Content-Length", fileStream.Length.ToString());

                // The FileResult will handle the stream disposal and temp file cleanup
                return File(fileStream, "video/x-matroska", enableRangeProcessing: true);
            }
            catch (Exception ex)
            {
                // Clean up temp file if something goes wrong
                if (tempFilePath != null && System.IO.File.Exists(tempFilePath))
                {
                    try { System.IO.File.Delete(tempFilePath); } catch { }
                }

                client?.Dispose();
                return StatusCode(500, $"Error streaming video: {ex.Message}");
            }
            finally
            {
                client?.Dispose();
            }
        }

    }
}
