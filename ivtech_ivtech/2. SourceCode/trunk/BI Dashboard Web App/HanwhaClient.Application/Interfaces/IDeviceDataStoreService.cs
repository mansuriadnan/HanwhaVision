using HanwhaClient.Model.DbEntities;

namespace HanwhaClient.Application.Interfaces
{
    public interface IDeviceDataStoreService
    {
        List<PeopleCount> CurrentPeopleCount { get; set; }
        List<VehicleCount> CurrentVehicleCount { get; set; }
        List<MultiLaneVehicleCount> MultiLaneVehicleCounts { get; set; }
        List<ShoppingCartCount> ShoppingCartCount { get; set; }
        List<ForkliftCount> ForkliftCounts { get; set; }
        void CachePeopleCount(PeopleCount peopleCount);
        void CacheVehicleCount(VehicleCount peopleCount);
        void CacheMultiLaneVehicleCount(MultiLaneVehicleCount multiLaneVehicleCount);
        void CacheShoppingCartCount(ShoppingCartCount shoppingCartCount);
        void CacheForkliftCount(ForkliftCount forkliftCount);
        Task<PeopleCount> GetCachePeopleCount(string deviceId, int channelNo);
        Task<VehicleCount> GetCacheVehicleCount(string deviceId, int channelNo);
        Task<MultiLaneVehicleCount> GetCacheMultiLaneVehicleCount(string deviceId, int channelNo);
        Task<ShoppingCartCount> GetCacheShoppingCartCount(string deviceId, int channelNo);
        Task<ForkliftCount> GetCacheForkliftCount(string deviceId, int channelNo);
        Task<bool> ClearCacheData();
    }
}
