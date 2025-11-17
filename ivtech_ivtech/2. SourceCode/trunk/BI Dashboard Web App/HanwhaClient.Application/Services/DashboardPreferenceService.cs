using AutoMapper;
using HanwhaClient.Application.Interfaces;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.Dto;
using MongoDB.Driver;
using Newtonsoft.Json;

namespace HanwhaClient.Application.Services
{
    public class DashboardPreferenceService : IDashboardPreferenceService
    {
        private readonly IDashboardPreferenceRepository _dashboardPreferenceRepository;
        private readonly IUserNotificationRepository _userNotificationRepository;
        private readonly IMapper _mapper;
        private readonly ICacheService _cacheService;

        public DashboardPreferenceService(IDashboardPreferenceRepository DashboardPreferenceRepository,
            IMapper mapper,
            IUserNotificationRepository userNotificationRepository,
            ICacheService cacheService)
        {
            _dashboardPreferenceRepository = DashboardPreferenceRepository;
            _mapper = mapper;
            _userNotificationRepository = userNotificationRepository;
            _cacheService = cacheService;
        }

        public async Task<(string Id, string ErrorMessage)> SaveDashboardDesignAsync(SaveDashboardDesign dashboardDesign, string userId)
        {
            if (!string.IsNullOrEmpty(dashboardDesign.Id))
            {
                var updateBuilder = Builders<DashboardPreference>.Update;
                var updates = new List<UpdateDefinition<DashboardPreference>>();

                if (!string.IsNullOrEmpty(dashboardDesign.DashboardName))
                {
                    bool dashboardNameExits = await _dashboardPreferenceRepository.IsDashboardNameExistsAsync(userId, dashboardDesign.DashboardName);
                    if (dashboardNameExits)
                    {
                        return (string.Empty, AppMessageConstants.DashboardNameAlreadyExist);
                    }
                    updates.Add(updateBuilder.Set(c => c.DashboardName, dashboardDesign.DashboardName));
                }

                if (!string.IsNullOrEmpty(dashboardDesign.DashboardDesignjson))
                {
                    var serializedData = JsonConvert.SerializeObject(dashboardDesign.DashboardDesignjson);
                    updates.Add(updateBuilder.Set(c => c.DashboardPreferenceJson, serializedData));
                }

                updates.Add(updateBuilder.Set(c => c.UpdatedBy, userId));
                updates.Add(updateBuilder.Set(c => c.UpdatedOn, DateTime.UtcNow));

                var update = updateBuilder.Combine(updates);

                var data = await _dashboardPreferenceRepository.UpdateFieldsAsync(dashboardDesign.Id, update);
                await _cacheService.RemoveAsync(CacheConstants.GetDashboardPreferences + userId);
                return (dashboardDesign.Id, "");
            }
            else
            {
                if (string.IsNullOrEmpty(dashboardDesign.DashboardName))
                {
                    return ("", AppMessageConstants.DashboardNameMandatory);
                }

                bool dashboardNameExits = await _dashboardPreferenceRepository.IsDashboardNameExistsAsync(userId, dashboardDesign.DashboardName);
                if (!dashboardNameExits)
                {
                    DashboardPreference dashboardPreferenceData = new DashboardPreference();
                    if (string.IsNullOrEmpty(dashboardDesign.DashboardDesignjson))
                    {
                        dashboardPreferenceData.DashboardPreferenceJson = null;
                    }
                    else
                    {
                        dashboardPreferenceData.DashboardPreferenceJson = JsonConvert.SerializeObject(dashboardDesign.DashboardDesignjson);
                    }
                    dashboardPreferenceData.UserId = userId;
                    dashboardPreferenceData.DashboardName = dashboardDesign.DashboardName;
                    dashboardPreferenceData.CreatedBy = userId;
                    dashboardPreferenceData.CreatedOn = DateTime.UtcNow;
                    dashboardPreferenceData.UpdatedBy = userId;
                    dashboardPreferenceData.UpdatedOn = DateTime.UtcNow;

                    var data = await _dashboardPreferenceRepository.InsertAsync(dashboardPreferenceData);
                    await _cacheService.RemoveAsync(CacheConstants.GetDashboardPreferences + userId);
                    return (data, "");
                }
                return ("", AppMessageConstants.DashboardNameAlreadyExist);
            }
        }

        public async Task<IEnumerable<GetDashboardPreferenceResponse>> GetDashboardPreferenceByUserIdAsync(string userId)
        {
            var cachedDashboardPreference = await _cacheService.GetAsync<IEnumerable<GetDashboardPreferenceResponse>>(CacheConstants.GetDashboardPreferences + userId);
            if (cachedDashboardPreference != null)
            {
                return cachedDashboardPreference;
            }

            var data = await _dashboardPreferenceRepository.GetDashboardPreferenceByUserIdAsync(userId);
            var updatedData = data.Select(item =>
                              {
                                  item.DashboardPreferenceJson = item.DashboardPreferenceJson != null ? JsonConvert.DeserializeObject<object>(item.DashboardPreferenceJson)?.ToString() : null;
                                  return item;
                              }).ToList();

            await _cacheService.SetAsync(CacheConstants.GetDashboardPreferences + userId, _mapper.Map<IEnumerable<GetDashboardPreferenceResponse>>(updatedData));
            return _mapper.Map<IEnumerable<GetDashboardPreferenceResponse>>(updatedData);
        }

        public async Task<bool> DeleteDashboardAsync(string id, string userId)
        {
            var data = await _dashboardPreferenceRepository.SoftDeleteAsync(id, userId);
            await _cacheService.RemoveAsync(CacheConstants.GetDashboardPreferences + userId);
            return data;
        }

        public async Task<IEnumerable<UserNotificationResponse>> GetUserNotificationAsync(int pageNo, int pageSize)
        {
            return await _userNotificationRepository.GetUserNotificationAsync(pageNo, pageSize);
        }
    }
}
