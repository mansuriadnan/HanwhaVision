using HanwhaClient.Application.Interfaces;
using HanwhaClient.Model.DbEntities;


namespace HanwhaClient.Application.Services
{
    public class BackgroundJobCountService : IBackgroundJobCountService
    {
        public List<PeopleCount> PeopleCountList { get; set; } = new List<PeopleCount>();
        public List<VehicleCount> VehicleCount { get; set; } = new List<VehicleCount>();
        public List<MultiLaneVehicleCount> MultiLaneVehicleCounts { get; set; } = new List<MultiLaneVehicleCount>();
        public List<ShoppingCartCount> ShoppingCartCount { get; set; } = new List<ShoppingCartCount>();
        public List<ForkliftCount> ForkliftCounts { get; set; } = new List<ForkliftCount>();
    }
}
