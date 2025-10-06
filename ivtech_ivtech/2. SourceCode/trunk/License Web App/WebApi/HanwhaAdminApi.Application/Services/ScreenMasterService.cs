
using HanwhaAdminApi.Application.Interfaces;
using HanwhaAdminApi.Infrastructure.Interfaces;
using HanwhaAdminApi.Model.DbEntities;

namespace HanwhaAdminApi.Application.Services
{
    public class ScreenMasterService : IScreenMasterService
    {
        private readonly IScreenMasterRepository _screenMasterRepository;

        public ScreenMasterService(IScreenMasterRepository screenMasterRepository)
        {
            this._screenMasterRepository = screenMasterRepository;
        }

        public async Task<IEnumerable<ScreenMaster>> GetAllScreenMasters()
        {
            var data = await _screenMasterRepository.GetAllAsync();
            return data;
        }
    }
}
