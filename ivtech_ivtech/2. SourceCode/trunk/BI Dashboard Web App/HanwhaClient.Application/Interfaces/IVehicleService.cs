
using HanwhaClient.Model.DbEntities;

namespace HanwhaClient.Application.Interfaces
{
    public interface IVehicleService
    {
        Task<string> InsertVehicle(VehicleCount vehicleCountDetail);
    }
}
