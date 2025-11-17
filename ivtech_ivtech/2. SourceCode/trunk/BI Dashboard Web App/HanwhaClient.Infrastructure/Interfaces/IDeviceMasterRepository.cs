using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.DeviceApiResponse;
using HanwhaClient.Model.Dto;

namespace HanwhaClient.Infrastructure.Interfaces
{
    public interface IDeviceMasterRepository : IRepositoryBase<DeviceMaster>
    {
        Task<(IEnumerable<DeviceMaster> deviceDetails, int deviceCount)> GetAllDevicesByFilterAsync(DeviceRequest deviceRequest);
        Task<int> GetCameraCountAsync();
        Task<IEnumerable<DeviceDetailResponse>> GetPeopleDeviceListAsync();
        Task<IEnumerable<DeviceDetailResponse>> GetVehicleDeviceListAsync();
        Task<IEnumerable<DeviceDetailResponse>> GetShoppingCartDeviceListAsync();
        Task<IEnumerable<DeviceDetailResponse>> GetForkliftDeviceListAsync();
        Task<IEnumerable<CameraSeriesCountResponse>> GetCameraSeriesCountAsync(IEnumerable<string> deviceIds);
        Task<IEnumerable<CameraFeaturesCountResponse>> CameraCountByFeaturesAsync(IEnumerable<string> deviceIds);
        Task<IEnumerable<DeviceMaster>> GetDevicesWithoutZones();
        Task<bool> UpdateIsFullyMappedDevice(string deviceId, bool isDefaultZone);
        Task<IEnumerable<DeviceMaster>> GetAllDeviceByDeviceIds(IEnumerable<string> deviceIds);
        Task<IEnumerable<DeviceMaster>> MapCameraListByFeaturesAsync(string feature, IEnumerable<string>? deviceId);
        Task<IEnumerable<ZoneCamera>> GetUnMappeddevicesforWidget();
        Task<bool> IsDeviceExistsAsync(string deviceIpAdress, string? deviceId);
        Task<DeviceMaster> GetDeviceDataByIpAddressAsync(string deviceIpAddress);
    }
}
