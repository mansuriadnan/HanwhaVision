using HanwhaClient.Application.Interfaces;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.DbEntities;

namespace HanwhaClient.Application.Services
{
    public class ScreenMasterService : IScreenMasterService
    {
        private readonly IScreenMasterRepository _screenMasterRepository;
        private readonly IWidgetRepository _widgetRepository;
        private readonly ICacheService _cacheService;
        private readonly string _cacheKey = "ScreenMasterKey";
        private static readonly TimeSpan _CacheExpiration = TimeSpan.FromMinutes(10);

        public ScreenMasterService(IScreenMasterRepository screenMasterRepository, ICacheService cacheService, IWidgetRepository widgetRepository)
        {
            this._screenMasterRepository = screenMasterRepository;
            this._cacheService = cacheService;
            _widgetRepository = widgetRepository;
        }

        public async Task<IEnumerable<ScreenMaster>> GetAllScreenMasters()
        {
            var cachedRoles = await _cacheService.GetAsync<IEnumerable<ScreenMaster>>(_cacheKey);
            if (cachedRoles != null)
            {
                return cachedRoles;
            }
            var data = await _screenMasterRepository.GetAllAsync();
            if (data != null)
            {
                await _cacheService.SetAsync(_cacheKey, data, _CacheExpiration);
            }
            return await Task.FromResult(data);
        }
        public async Task<IEnumerable<WidgetMaster>> GetAllWidgetMasters()
        {
            var getAllData = await _widgetRepository.GetAllAsync();
            return getAllData;
        }
    }
}
