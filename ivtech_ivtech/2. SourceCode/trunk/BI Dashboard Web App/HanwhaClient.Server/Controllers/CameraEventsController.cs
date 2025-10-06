using HanwhaClient.Application.Interfaces;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.DbEntities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json.Linq;
using System.Net;
using System.Text;
using System.Text.Json;

namespace HanwhaClient.Server.Controllers
{

    [Route("api/events")]
    [ApiController]
    public class CameraEventsController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly IEventTriggerService _eventTriggerService;
        private readonly IDeviceMasterService _deviceMasterService;

        public CameraEventsController(HttpClient httpClient,
            IEventTriggerService eventTriggerService,
            IDeviceMasterService deviceMasterService)
         {
            _httpClient = httpClient;
            _eventTriggerService = eventTriggerService;
            _deviceMasterService = deviceMasterService;
        }

        [HttpGet("stream")]
        public async Task StreamCameraEvents()
        {
            var devices = await _deviceMasterService.GetAllDevicesAsync();

            // Run each device stream in parallel and wait for all to start
            await Task.WhenAll(devices.Select(async device =>
            {
                string cameraUrl = (device.IsHttps ? "https://" : "http://") + device.IpAddress + WiseAPIConstant.EventTrack;

            var handler = new HttpClientHandler { Credentials = new NetworkCredential(device.UserName, device.Password), ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator };

                using (var httpClient = new HttpClient(handler))
                {
                    var request = new HttpRequestMessage(HttpMethod.Get, cameraUrl);
                    request.Headers.Add("Accept", "application/json");

                    try
                    {
                        var jsonBuilder = new StringBuilder();
                        int braceBalance = 0;

                        using (var response = await httpClient.SendAsync(request, HttpCompletionOption.ResponseHeadersRead))
                        {
                            response.EnsureSuccessStatusCode();
                            using (var stream = await response.Content.ReadAsStreamAsync())
                            using (var reader = new StreamReader(stream))
                            {
                                while (!reader.EndOfStream)
                                {
                                    string line = await reader.ReadLineAsync();
                                    if (string.IsNullOrWhiteSpace(line) || line.StartsWith("--SamsungTechwin") || line.StartsWith("Content-type"))
                                    {
                                    continue;
                                    }

                                // Count opening and closing braces to detect complete JSON
                                braceBalance += line.Count(c => c == '{');
                                    braceBalance -= line.Count(c => c == '}');

                                    jsonBuilder.AppendLine(line);

                                    if (braceBalance == 0 && jsonBuilder.Length > 0)
                                    {
                                        // We have a complete JSON block
                                        string fullJson = jsonBuilder.ToString();
                                        jsonBuilder.Clear();

                                        try
                                        {
                                            Console.WriteLine($"Complete JSON Received from {device.IpAddress}:\n" + fullJson);
                                            await _eventTriggerService.TrackTriggerEventAsync(fullJson, device);
                                        }
                                        catch (JsonException ex)
                                        {
                                            Console.WriteLine($"JSON Parse Error for {device.IpAddress}: {ex.Message}");
                                            Console.WriteLine("Raw JSON block:\n" + fullJson);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Exception for {device.IpAddress}: {ex.Message}");
                    }
                }
            }));
        }

    }

}
