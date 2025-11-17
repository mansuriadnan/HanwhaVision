using HanwhaClient.Application.Interfaces;
using HanwhaClient.Model.DbEntities;

namespace HanwhaClient.Application.Services
{
    public class DeviceDataStoreService : IDeviceDataStoreService
    {
        public List<PeopleCount> CurrentPeopleCount { get; set; } = new List<PeopleCount>();
        public List<VehicleCount> CurrentVehicleCount { get; set; } = new List<VehicleCount>();
        public List<MultiLaneVehicleCount> MultiLaneVehicleCounts { get; set; } = new List<MultiLaneVehicleCount>();
        public List<ShoppingCartCount> ShoppingCartCount { get; set; } = new List<ShoppingCartCount>();
        public List<ForkliftCount> ForkliftCounts { get; set; } = new List<ForkliftCount>();
        public List<(string DeviceId, Task<bool> Task)> PeopleTaskCountTaskList { get; set; } = new List<(string DeviceId, Task<bool> Task)>();

        public void CachePeopleCount(PeopleCount peopleCount)
        {
            var existing = CurrentPeopleCount.FirstOrDefault(x => x.DeviceId == peopleCount.DeviceId && x.ChannelNo == peopleCount.ChannelNo);

            if (existing != null)
            {
                // Replace
                var index = CurrentPeopleCount.IndexOf(existing);
                CurrentPeopleCount[index] = peopleCount;
            }
            else
            {
                // Append
                CurrentPeopleCount.Add(peopleCount);
            }
        }

        public void CacheVehicleCount(VehicleCount vehicleCount)
        {
            var existing = CurrentVehicleCount.FirstOrDefault(x => x.DeviceId == vehicleCount.DeviceId && x.ChannelNo == vehicleCount.ChannelNo);

            if (existing != null)
            {
                // Replace
                var index = CurrentVehicleCount.IndexOf(existing);
                CurrentVehicleCount[index] = vehicleCount;
            }
            else
            {
                // Append
                CurrentVehicleCount.Add(vehicleCount);
            }
        }

        public void CacheMultiLaneVehicleCount(MultiLaneVehicleCount multiLaneVehicleCount)
        {
            var existing = MultiLaneVehicleCounts.FirstOrDefault(x => x.DeviceId == multiLaneVehicleCount.DeviceId && x.ChannelNo == multiLaneVehicleCount.ChannelNo);

            if (existing != null)
            {
                // Replace
                var index = MultiLaneVehicleCounts.IndexOf(existing);
                MultiLaneVehicleCounts[index] = multiLaneVehicleCount;
            }
            else
            {
                // Append
                MultiLaneVehicleCounts.Add(multiLaneVehicleCount);
            }
        }

        public void CacheShoppingCartCount(ShoppingCartCount shoppingCartCount)
        {
            var existing = ShoppingCartCount.FirstOrDefault(x => x.DeviceId == shoppingCartCount.DeviceId && x.ChannelNo == shoppingCartCount.ChannelNo);

            if (existing != null)
            {
                // Replace
                var index = ShoppingCartCount.IndexOf(existing);
                ShoppingCartCount[index] = shoppingCartCount;
            }
            else
            {
                // Append
                ShoppingCartCount.Add(shoppingCartCount);
            }
        }

        public void CacheForkliftCount(ForkliftCount forkliftCount)
        {
            var existing = ForkliftCounts.FirstOrDefault(x => x.DeviceId == forkliftCount.DeviceId && x.ChannelNo == forkliftCount.ChannelNo);

            if (existing != null)
            {
                // Replace
                var index = ForkliftCounts.IndexOf(existing);
                ForkliftCounts[index] = forkliftCount;
            }
            else
            {
                // Append
                ForkliftCounts.Add(forkliftCount);
            }
        }

        public Task<PeopleCount> GetCachePeopleCount(string deviceId, int channelNo)
        {
            return Task.FromResult(CurrentPeopleCount.FirstOrDefault(x => x.DeviceId == deviceId && x.ChannelNo == channelNo));
        }

        public Task<VehicleCount> GetCacheVehicleCount(string deviceId, int channelNo)
        {
            return Task.FromResult(CurrentVehicleCount.FirstOrDefault(x => x.DeviceId == deviceId && x.ChannelNo == channelNo));
        }

        public Task<MultiLaneVehicleCount> GetCacheMultiLaneVehicleCount(string deviceId, int channelNo)
        {
            return Task.FromResult(MultiLaneVehicleCounts.FirstOrDefault(x => x.DeviceId == deviceId && x.ChannelNo == channelNo));
        }

        public Task<ShoppingCartCount> GetCacheShoppingCartCount(string deviceId, int channelNo)
        {
            return Task.FromResult(ShoppingCartCount.FirstOrDefault(x => x.DeviceId == deviceId && x.ChannelNo == channelNo));
        }

        public Task<ForkliftCount> GetCacheForkliftCount(string deviceId, int channelNo)
        {
            return Task.FromResult(ForkliftCounts.FirstOrDefault(x => x.DeviceId == deviceId && x.ChannelNo == channelNo));
        }

        public Task<bool> ClearCacheData()
        {
            CurrentPeopleCount.Clear();
            CurrentVehicleCount.Clear();
            MultiLaneVehicleCounts.Clear();
            ShoppingCartCount.Clear();
            ForkliftCounts.Clear();
            return Task.FromResult(true);
        }
    }
}

