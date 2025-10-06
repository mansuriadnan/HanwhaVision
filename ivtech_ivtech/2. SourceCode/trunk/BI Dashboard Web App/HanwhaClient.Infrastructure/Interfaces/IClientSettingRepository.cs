using HanwhaClient.Model.DbEntities;

namespace HanwhaClient.Infrastructure.Interfaces
{
    public interface IClientSettingRepository : IRepositoryBase<ClientSettings>
    {
        Task<ClientSettings> GetClientSettingsAsync();
    }
}
