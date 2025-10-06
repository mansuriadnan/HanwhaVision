using HanwhaClient.Model.DbEntities;

namespace HanwhaClient.Application.Interfaces
{
    public interface IMultiLaneVehicleCountService
    {
        Task<String> InsertMultiLaneVehicleCount(MultiLaneVehicleCount multiLaneVehicleCount);
    }
}
