using HanwhaClient.Model.DbEntities;

namespace HanwhaClient.Application.Interfaces
{
    public interface IForkliftCountService
    {
        Task<String> InsertForkliftCount(ForkliftCount forkliftCount);
    }
}
