using HanwhaClient.Model.Common;
using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.DeviceApiResponse;
using HanwhaClient.Model.Dto;

namespace HanwhaClient.Application.Interfaces
{
    public interface IDeviceMasterService
    {
        Task<(bool isSuccess, string ErrorMessage)> AddUpdateDevices(DeviceRequestDto deviceRequestDto, string userId);
        Task<DeviceResponse> GetAllDevicesByFilterAsync(DeviceRequest deviceRequest);
        Task<long> DeleteDevicesAsync(IEnumerable<string> id, string userId);
        Task<IEnumerable<DevicesWithoutZonesResponseDto>> GetDevicesWithoutZones();
        Task<IEnumerable<AllChannelsResDto>> GetAllChannels(AllChannelsReqDto dto);
        Task<IEnumerable<DeviceDetailResponse>> GetPeopleDeviceListAsync();
        Task<IEnumerable<DeviceDetailResponse>> GetVehicleDeviceListAsync();
        Task<IEnumerable<DeviceDetailResponse>> GetShoppingCartDeviceListAsync();
        Task<IEnumerable<DeviceDetailResponse>> GetForkliftDeviceListAsync();
        Task<IEnumerable<DeviceMaster>> GetAllDevicesAsync();
        Task<bool> ChangeDeviceStatusAsync(string deviceId, bool status);
        Task<DeviceEventsLogsRes> GetDeviceEventsLogsAsync(DeviceEventsLogsRequest request, IEnumerable<string> roles);
        Task<DeviceEventsLogsRes> GetDeviceEventsLogsAsync1(DeviceEventsLogsRequest request, IEnumerable<string> roles);
        Task<bool> UpdateDeviceEventsStatusAsync(DeviceChangeStatusRequest deviceChangeStatusRequest, string userId);
        Task<IEnumerable<MapCameraListByFeatures>> MapCameraListByFeaturesAsync(string feature, string? floorId);
        Task<IEnumerable<MapCameraListByFeatures>> GetCameraListByHeatmapTypeAsync(string heatmapType);
        Task<IEnumerable<MapCameraListByFeatures>> GetDevicesByFloorAndZonesAsync(IEnumerable<string> floorIds, IEnumerable<string>? zoneIds);
        Task<IEnumerable<DeviceResponseDetail>> GetDevicesByDeviceIdAsync(IEnumerable<string> deviceIds);
    }
}
