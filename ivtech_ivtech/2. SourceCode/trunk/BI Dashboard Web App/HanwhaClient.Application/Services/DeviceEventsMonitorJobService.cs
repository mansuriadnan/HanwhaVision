using HanwhaClient.Application.Interfaces;
using HanwhaClient.Core.Interfaces;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.DbEntities;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using System.Collections.Concurrent;
using System.Net;
using System.Text;

namespace HanwhaClient.Application.Services
{
    public class DeviceEventsMonitorJobService : IDeviceEventsMonitorJobService
    {
        private readonly ConcurrentDictionary<string, CancellationTokenSource> _deviceTasks = new();
        private readonly IServiceProvider _serviceProvider;
        
        public DeviceEventsMonitorJobService(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        public void StartTaskForDevice(DeviceMaster device)
        {
            if (_deviceTasks.ContainsKey(device.Id))
            {
                KillTaskForDevice(device.Id); // Cancel the existing task
            }

            var cancellationTokenSource = new CancellationTokenSource();
            _deviceTasks[device.Id] = cancellationTokenSource;

            Task.Run(() => RunHttpRequestForDevice(device, cancellationTokenSource.Token), cancellationTokenSource.Token);
        }

        private async Task RunHttpRequestForDevice(DeviceMaster device, CancellationToken cancellationToken)
        {
            try
            {
                using (var scope = _serviceProvider.CreateScope())
                {
                    var eventTriggerService = scope.ServiceProvider.GetRequiredService<IEventTriggerService>();

                    string cameraUrl = (device.IsHttps ? "https://" : "http://") + device.IpAddress + WiseAPIConstant.EventTrack;

                    var handler = new HttpClientHandler
                    {
                        Credentials = new NetworkCredential(device.UserName, device.Password),
                        ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
                    };

                    using (var httpClient = new HttpClient(handler))
                    {
                        var request = new HttpRequestMessage(HttpMethod.Get, cameraUrl);
                        request.Headers.Add("Accept", "application/json");

                        var jsonBuilder = new StringBuilder();
                        int braceBalance = 0;

                        using (var response = await httpClient.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken))
                        {
                            response.EnsureSuccessStatusCode();
                            using (var stream = await response.Content.ReadAsStreamAsync(cancellationToken))
                            using (var reader = new StreamReader(stream))
                            {
                                while (!reader.EndOfStream && !cancellationToken.IsCancellationRequested)
                                {
                                    try
                                    {
                                        string line = await reader.ReadLineAsync();
                                        if (string.IsNullOrWhiteSpace(line) || line.StartsWith("--SamsungTechwin") || line.StartsWith("Content-type"))
                                        {
                                            continue;
                                        }

                                        braceBalance += line.Count(c => c == '{');
                                        braceBalance -= line.Count(c => c == '}');

                                        jsonBuilder.AppendLine(line);
                                    }
                                    catch (Exception ex)
                                    {
                                        throw;
                                    }

                                    if (braceBalance == 0 && jsonBuilder.Length > 0)
                                     {
                                        

                                        try
                                        {
                                            string fullJson = jsonBuilder.ToString();
                                            jsonBuilder.Clear();
                                            Console.WriteLine($"Complete JSON Received from {device.IpAddress}:\n" + fullJson);
                                            await eventTriggerService.TrackTriggerEventAsync(fullJson, device);
                                        }
                                        catch (JsonException ex)
                                        {
                                            Console.WriteLine($"JSON Parse Error for {device.IpAddress}: {ex.Message}");
                                            Console.WriteLine("Raw JSON block:\n" );
                                            throw;
                                        }
                                        catch (Exception ex)
                                        {
                                            Console.WriteLine($"Error processing JSON for {device.IpAddress}: {ex.Message}");
                                            throw;
                                        }
                                    }
                                }
                                
                                Console.WriteLine($"Stream ended for {device.IpAddress}. Restarting...");
                                await Task.Delay(5000, cancellationToken);
                                StartTaskForDevice(device); 
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("The response ended prematurely"))
                {
                    StartTaskForDevice(device);
                }
                if (ex.Message.Contains("Unable to read data from the transport connection: An existing connection was forcibly closed by the remote host"))
                {
                    StartTaskForDevice(device);
                }
                Console.WriteLine($"Exception for {device.IpAddress}: {ex.Message}");
            }


        }

        private void KillTaskForDevice(string deviceId)
        {
            if (_deviceTasks.TryRemove(deviceId, out var cancellationTokenSource))
            {
                cancellationTokenSource.Cancel();

                cancellationTokenSource.Dispose();
            }
        }

        public void KillAllTaskofDevice()
        {
            foreach (var deviceId in _deviceTasks.Keys)
            {
                KillTaskForDevice(deviceId);
            }
        }
    }
}
