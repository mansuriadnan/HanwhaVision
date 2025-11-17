using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.Dto;
using HanwhaClient.Model.Role;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Application.Interfaces
{
    public interface IMonitoringService
    {
        Task<string> AddUpdateMonitoringAsync(MonitoringRequestModel model, string userId);
        Task<string> AddUpdateMonitoringGroupAsync(MonitoringGroupRequest model, string userId);
        Task<string> AddUpdateMonitoringGroupItemAsync(MonitoringGroupItemRequest model, string userId);
        Task<IEnumerable<MonitoringResponseModel>> GetMonitoringAsync();
        Task<IEnumerable<MonitoringGroupWithItemsResponse>> GetAllMonitoringGroupsAsync(string MonitoringGroupId);
        Task<string> DeleteMonitoringGroupAsync(string monitoringId, string groupId);
        Task<bool> DeleteMonitoringAsync(string monitoringId, string userId);
        Task<string> DeleteMonitoringGroupItemAsync(string monitoringId, string groupId, string monitoringGroupItemId);

    }
}
