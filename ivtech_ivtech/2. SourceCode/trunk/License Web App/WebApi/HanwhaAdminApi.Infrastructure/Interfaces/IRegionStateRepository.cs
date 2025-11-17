using HanwhaAdminApi.Model.DbEntities;

namespace HanwhaAdminApi.Infrastructure.Interfaces
{
    public interface IRegionStateRepository : IRepositoryBase<StateMaster>
    {
        Task<IEnumerable<StateMaster>> GetStatesByCountryIdAsync(string Id);
    }
}
