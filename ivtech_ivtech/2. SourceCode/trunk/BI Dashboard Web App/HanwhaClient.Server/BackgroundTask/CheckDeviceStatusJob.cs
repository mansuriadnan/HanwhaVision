using HanwhaClient.Application.Interfaces;
using HanwhaClient.Core.Interfaces;
using Quartz;
using System.Net.NetworkInformation;

namespace HanwhaClient.BackgroundTask
{
    public class CheckDeviceStatusJob : IJob
    {
        private readonly IDeviceMasterService _deviceMasterService;
        private readonly IFileLogger _fileLogger;
        private readonly IDeviceEventsMonitorJobService _deviceEventsMonitorJobService;
        public CheckDeviceStatusJob(IDeviceMasterService deviceMasterService, IFileLogger fileLogger, IDeviceEventsMonitorJobService deviceEventsMonitorJobService)
        {
            _deviceMasterService = deviceMasterService;
            _fileLogger = fileLogger;
            _deviceEventsMonitorJobService = deviceEventsMonitorJobService;
        }
        public async Task Execute(IJobExecutionContext context)
        {
            try
            {
                var devices = await _deviceMasterService.GetAllDevicesAsync();
                if (devices != null && devices.Count() > 0)
                {
                    var itemChunk = devices.Chunk(50);
                    foreach (var item in itemChunk)
                    {
                        foreach (var device in item)
                        {
                            var hostUrl = device.IpAddress.Contains(':') ? device.IpAddress.Split(":")[0] : device.IpAddress;

                            Ping ping = new Ping();

                            PingReply result = ping.Send(hostUrl);
                            var r = result.Status;
                            _deviceMasterService.ChangeDeviceStatusAsync(device.Id, r == IPStatus.Success);
                            if (device.IsOnline == false && r == IPStatus.Success)
                            {
                                _deviceEventsMonitorJobService.StartTaskForDevice(device);
                            }
                            if (r != IPStatus.Success)
                            {
                                _fileLogger.Log($"{device.IpAddress} ------> is offline");
                            }
                            Console.WriteLine(device.IpAddress + "-------------- result-----:  " + r);
                        }
                        await Task.Delay(500);
                    }
                }
            }
            catch (Exception)
            {

                throw;
            }

            return;
        }

    }
}
