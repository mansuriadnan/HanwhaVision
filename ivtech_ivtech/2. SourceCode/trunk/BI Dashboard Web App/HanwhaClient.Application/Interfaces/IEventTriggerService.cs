using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.DeviceApiResponse;
using System.Text.Json;

namespace HanwhaClient.Application.Interfaces
{
    public interface IEventTriggerService
    {
        Task<bool> TrackTriggerEventAsync(string eventJson, DeviceMaster deviceDetail);
        Task<bool> AddPeopleCountFromSunapiAsync(string ip, string userName, string password, string deviceId);
        Task<bool> AddVehicleCountFromSunapiAsync(string ip, string userName, string password, string deviceId);
        Task<bool> AddPeopleCountFromWiseAiAsync(string ip, string userName, string password, string deviceId, int channel);
        Task<bool> AddVehicleCountFromWiseAi(string ip, string userName, string password, string deviceId, int channel);
    }
}
