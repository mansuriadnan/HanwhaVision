using HanwhaAdminApi.Model.DbEntities;


namespace HanwhaAdminApi.Infrastructure.Interfaces
{
    public interface IClientSettingRepository :  IRepositoryBase<AdminSettings>
    {
        Task<AdminSettings> GetClientSettingsAsync();
    }
}
