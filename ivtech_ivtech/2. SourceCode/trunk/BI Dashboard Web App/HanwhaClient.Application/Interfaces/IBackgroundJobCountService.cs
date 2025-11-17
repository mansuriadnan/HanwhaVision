using HanwhaClient.Model.DbEntities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Application.Interfaces
{
    public interface IBackgroundJobCountService
    {
        List<PeopleCount> PeopleCountList { get; set; }
        List<VehicleCount> VehicleCount { get; set; }
        List<MultiLaneVehicleCount> MultiLaneVehicleCounts { get; set; }
        List<ShoppingCartCount> ShoppingCartCount { get; set; }
        List<ForkliftCount> ForkliftCounts { get; set; }
    }
}
