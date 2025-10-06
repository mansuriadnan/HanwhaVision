using HanwhaClient.Application.Interfaces;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.DbEntities;

namespace HanwhaClient.Application.Services
{
    public class ClientTimeZoneService : IClientTimeZoneService
    {
        private readonly IClientTimeZoneRepository _clientTimeZoneRepository;
        private readonly ICacheService _cacheService;
        public ClientTimeZoneService(IClientTimeZoneRepository clientTimeZoneRepository, ICacheService cacheService)
        {
            _clientTimeZoneRepository = clientTimeZoneRepository;
            _cacheService = cacheService;
        }
        public async Task<IEnumerable<ClientTimezones>> GetClientTimezones()
        {
            var clientTimezones = await _cacheService.GetAsync<IEnumerable<ClientTimezones>>(CacheConstants.ClientTimeZones);
            if (clientTimezones != null)
            {
                return clientTimezones;
            }

            var data = await _clientTimeZoneRepository.GetAllAsync();
            await _cacheService.SetAsync(CacheConstants.ClientTimeZones, data.OrderBy(x => x.Name));
            return data.OrderBy(x => x.Name);
        }
    }
}
