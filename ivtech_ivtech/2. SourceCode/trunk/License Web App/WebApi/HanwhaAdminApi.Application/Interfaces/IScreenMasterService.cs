using HanwhaAdminApi.Model.DbEntities;

namespace HanwhaAdminApi.Application.Interfaces
{
    public interface IScreenMasterService
    {
       Task<IEnumerable<ScreenMaster>> GetAllScreenMasters();
    }
}
