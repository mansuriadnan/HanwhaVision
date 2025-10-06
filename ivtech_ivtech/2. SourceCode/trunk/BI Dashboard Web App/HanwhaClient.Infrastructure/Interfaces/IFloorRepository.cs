using HanwhaClient.Model.DbEntities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Infrastructure.Interfaces
{
    public interface IFloorRepository : IRepositoryBase<FloorPlanMaster>
    {
       // Task<string> AddCameraAsync(Camera camera);
        Task<FloorPlanMaster> GetFloorByIdAsync(string floorId);
        Task<string> GetDefalutFloorAsync();
        Task<bool> CheckFloorExistbyName(string floorName, string? floorId);
    }
}
