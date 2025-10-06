
using HanwhaClient.Model.DbEntities;

namespace HanwhaClient.Application.Interfaces
{
    public interface IClientTimeZoneService
    {
        Task<IEnumerable<ClientTimezones>> GetClientTimezones();
    }
}
