using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.Dto;

namespace HanwhaClient.Infrastructure.Interfaces
{
    public interface IMultiLaneVehicleCountRepository : IRepositoryBase<MultiLaneVehicleCount>
    {
        Task<IEnumerable<VehicleTurningMovementResponse>> VehicleTurningMovementAnalysisData(string deviceId, DateTime startdate, DateTime enddate, int channel,int intervalMinute);
    }
    
}
