using HanwhaClient.Application.Interfaces;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Infrastructure.Repository;
using HanwhaClient.Model.Dto;
using MongoDB.Driver.Core.Connections;
using Quartz;

namespace HanwhaClient.Server.BackgroundTask
{

    public class CheckZoneOccupancy : IJob
    {
        private readonly IFloorService _floorService;
        private readonly IZoneService _zoneService;
        private readonly IPeopleCountRepository _peopleCountRepository;
        private readonly IZoneCameraRepository _zoneCameraRepository;
        private readonly IUserNotificationService _userNotificationService;
        private readonly IVehicleRepository _vehicleRepository;
        private static Dictionary<string, bool> _zoneNotification = new();

        public CheckZoneOccupancy(IFloorService floorService,
                                  IZoneService zoneService,
                                  IPeopleCountRepository peopleCountRepository,
                                  IZoneCameraRepository zoneCameraRepository,
                                  IUserNotificationService userNotificationService,
                                  IVehicleRepository vehicleRepository)
        {
            _floorService = floorService;
            _zoneService = zoneService;
            _peopleCountRepository = peopleCountRepository;
            _zoneCameraRepository = zoneCameraRepository;
            _userNotificationService = userNotificationService;
            _vehicleRepository = vehicleRepository;
        }
        public async Task Execute(IJobExecutionContext context)
        {
            var floors = await _floorService.GetAllFloorsAsync();

            foreach (var floor in floors)
            {
                var zones = await _zoneService.GetZoneByFloorIdAsync(floor.Id);

                foreach (var zone in zones)
                {
                    var zoneCameraList = await _zoneCameraRepository.GetCamerasByZoneId(zone.Id);

                    if (!_zoneNotification.ContainsKey(zone.Id + "people"))
                        _zoneNotification[zone.Id + "people"] = false;

                    if (!_zoneNotification.ContainsKey(zone.Id + "vehicle"))
                        _zoneNotification[zone.Id + "vehicle"] = false;


                    List<CameraCapacityUtilizationByDevice> peopleCameraCapacityLst = new List<CameraCapacityUtilizationByDevice>();
                    List<CameraCapacityUtilizationByDevice> vehicleCameraCapacityLst = new List<CameraCapacityUtilizationByDevice>();
                    foreach (var camera in zoneCameraList)
                    {
                        

                        IEnumerable<CameraCapacityUtilizationByDevice> peopleResult = await _peopleCountRepository.GetPeopleCameraCapacityUtilizationByDeviceAsync(camera.DeviceId, DateTime.Today, DateTime.UtcNow, new TimeSpan(00, 00, 00), camera.Channel, camera.PeopleLineIndex);
                        if (peopleResult != null && peopleResult.Count() > 0)
                        {
                            peopleCameraCapacityLst.Add(new CameraCapacityUtilizationByDevice { DeviceId = camera.DeviceId, UtilizationCount = peopleResult.Average(x => x.UtilizationCount) });
                        }

                        IEnumerable<CameraCapacityUtilizationByDevice> vehicleResult = await _vehicleRepository.GetVehicleCameraCapacityUtilizationByDeviceAsync(camera.DeviceId, DateTime.Today, DateTime.UtcNow, new TimeSpan(00, 00, 00), camera.Channel, camera.VehicleLineIndex);
                        if (vehicleResult != null && vehicleResult.Count() > 0)
                        {
                            vehicleCameraCapacityLst.Add(new CameraCapacityUtilizationByDevice { DeviceId = camera.DeviceId, UtilizationCount = vehicleResult.Average(x => x.UtilizationCount) });
                        }
                    }

                    int peopleUtilizationCount = (int)peopleCameraCapacityLst.Sum(x => x.UtilizationCount);
                    int peopleCount = peopleCameraCapacityLst.Count();
                    int peopleUtilization = peopleCount > 0 ? peopleUtilizationCount / peopleCount : 0;

                    if (zone.PeopleOccupancy != null && zone.PeopleOccupancy > 0 && peopleUtilizationCount > zone.PeopleOccupancy)
                    {
                        var isNotificationSend = _zoneNotification[zone.Id + "people"];
                        if (!isNotificationSend) {
                            await _userNotificationService.AddUserNotification("People utilization alert : " + zone.Name,
                              "People utilization alert : " + zone.Name, "Acknowledge", null);

                            _zoneNotification[zone.Id + "people"] = true;
                        }
                        
                    }
                    else if (zone.PeopleOccupancy != null && zone.PeopleOccupancy > 0 && peopleUtilizationCount < zone.PeopleOccupancy)
                    {
                        _zoneNotification[zone.Id + "people"] = false;
                    }

                    int vehicleUtilizationCount = (int)vehicleCameraCapacityLst.Sum(x => x.UtilizationCount);
                    int vehicleCount = vehicleCameraCapacityLst.Count();
                    int vehicleUtilization = vehicleCount > 0 ? vehicleUtilizationCount / vehicleCount : 0;

                    if (zone.VehicleOccupancy != null && zone.VehicleOccupancy > 0 && vehicleUtilizationCount > zone.VehicleOccupancy)
                    {
                        var isNotificationSend = _zoneNotification[zone.Id + "vehicle"];
                        if (!isNotificationSend)
                        {
                            await _userNotificationService.AddUserNotification("vehicle utilization alert : " + zone.Name,
                              "vehicle utilization alert : " + zone.Name, "Acknowledge", null);

                            _zoneNotification[zone.Id + "vehicle"] = true;
                        }
                    }
                    else if (zone.VehicleOccupancy != null && zone.VehicleOccupancy > 0 && vehicleUtilizationCount < zone.VehicleOccupancy)
                    {
                        _zoneNotification[zone.Id + "vehicle"] = false;
                    }
                }
            }
        }
    }
}
