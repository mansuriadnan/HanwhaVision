using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.Dto;

namespace HanwhaClient.Application.Interfaces
{
    public interface IZoneService
    {
        Task<IEnumerable<ZoneResponseDto>> GetZoneByFloorIdAsync(string siteId);
        Task<(string id,string errorMessage)> AddUpdateZone(ZoneRequestDto zoneRequestDto, string userId);
        Task<bool> DeleteZoneAsync(string zoneId, string userId);
        Task<bool> DeleteZoneMappedDeviceAsync(string zoneCameraId, string userId);
        Task<(bool isSuccess, string ErrorMessage)> AddZonePlanDetailAsync(AddZonePlanRequest zonePlanDetails, string userId);
        Task<ZoneResDto> GetZoneByZoneIdAsync(string zoneId);
    }
}
