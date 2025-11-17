using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.Dto;

namespace HanwhaClient.Infrastructure.Interfaces
{
    public interface IZoneCameraRepository : IRepositoryBase<ZoneCamera>
    {
        Task<IEnumerable<ZoneCamera>> GetCamerasByZoneId(string zoneId);
        Task<IEnumerable<ZoneCamera>> GetCamerasByZoneIds(IEnumerable<string> zoneIds);
        Task<IEnumerable<ZoneCamera>> GetAllDevicesByFilter(DeviceRequest cameraRequest = null);
        Task<bool> UpdateZoneDeviceByZoneCameraIdAsync(MappedDevices zoneCameraData, string userId);
        Task<IEnumerable<string>> GetDevicebyFloorAndZoneAsync(IEnumerable<string> floorId, IEnumerable<string>? zoneId);
        Task<IEnumerable<ZoneCamera>> GetZoneMappedDevices(IEnumerable<string> zoneIds);
        Task<IEnumerable<ZoneCamera>> GetZoneCameraDetails(IEnumerable<string> deviceId);
    }
}
