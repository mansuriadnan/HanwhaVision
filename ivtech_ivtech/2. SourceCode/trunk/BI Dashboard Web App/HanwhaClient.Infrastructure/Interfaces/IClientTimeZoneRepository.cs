using HanwhaClient.Model.DbEntities;

namespace HanwhaClient.Infrastructure.Interfaces
{
    public interface IClientTimeZoneRepository : IRepositoryBase<ClientTimezones>
    {
        Task<ClientTimezones> GetTimeZone(string id);
    }
}
