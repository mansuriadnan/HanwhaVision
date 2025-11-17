using HanwhaClient.Infrastructure.Connection;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.DeviceApiResponse;
using HanwhaClient.Model.Dto;
using MongoDB.Bson;
using MongoDB.Driver;
using MongoDB.Driver.Core.Misc;
using MongoDB.Driver.Linq;
using System.Linq;
using System.Text.RegularExpressions;

namespace HanwhaClient.Infrastructure.Repository
{
    public class DeviceMasterRepository : RepositoryBase<DeviceMaster>, IDeviceMasterRepository
    {
        public DeviceMasterRepository(MongoDbConnectionService mongoDbConnectionService) : base(mongoDbConnectionService, AppDBConstants.DeviceMaster)
        {
        }

        public async Task<(IEnumerable<DeviceMaster> deviceDetails, int deviceCount)> GetAllDevicesByFilterAsync(DeviceRequest deviceRequest)
        {
            var filters = new List<FilterDefinition<DeviceMaster>>();

            ProjectionDefinition<DeviceMaster> projection = Builders<DeviceMaster>.Projection
            .Include("deviceName")
            .Include("model")
            .Include("location")
            .Include("serialNumber")
            .Include("deviceType")
            .Include("ipAddress")
            .Include("userName")
            .Include("password")
            .Include("devicePort")
            .Include("isHttps")
            .Include("location")
            .Include("isOnline")
            .Include("_id");

            if (!string.IsNullOrEmpty(deviceRequest.SearchText))
            {
                var searchRegex = new BsonRegularExpression(deviceRequest.SearchText, "i");

                filters.Add(
                    Builders<DeviceMaster>.Filter.Or(
                        Builders<DeviceMaster>.Filter.Regex(x => x.DeviceName, searchRegex),
                        Builders<DeviceMaster>.Filter.Regex(x => x.Model, searchRegex),
                        Builders<DeviceMaster>.Filter.Regex(x => x.SerialNumber, searchRegex),
                        Builders<DeviceMaster>.Filter.Regex(x => x.MacAddress, searchRegex),
                        Builders<DeviceMaster>.Filter.Regex(x => x.IpAddress, searchRegex)
                    )
                );                
            }
            if (deviceRequest.ZonesDeviceIds != null && deviceRequest.ZonesDeviceIds.Any())
            {
                var zoneFilter = Builders<DeviceMaster>.Filter.In(x => x.Id, deviceRequest.ZonesDeviceIds);

                if (filters.Any())
                {
                    // Combine existing filters with OR
                    filters[0] = Builders<DeviceMaster>.Filter.Or(filters[0], zoneFilter);
                }
                else
                {
                    filters.Add(zoneFilter);
                }
            }

            filters.Add(Builders<DeviceMaster>.Filter.Eq(x => x.IsDeleted, false));

            var finalFilter = filters.Any() ? Builders<DeviceMaster>.Filter.And(filters) : Builders<DeviceMaster>.Filter.Empty;

            // Sorting
            string sortField = deviceRequest.SortBy ?? "deviceName"; // default sort field
            bool sortDescending = deviceRequest.SortOrder == -1;     // -1 = desc, 1 = asc

            var sortDefinition = sortDescending
                ? Builders<DeviceMaster>.Sort.Descending(sortField)
                : Builders<DeviceMaster>.Sort.Ascending(sortField);

            var data = await dbEntity.Find(finalFilter).Sort(sortDefinition).Skip((deviceRequest.PageNo - 1) * deviceRequest.PageSize).Limit(deviceRequest.PageSize).ToListAsync();
            int totalCount = (int)await dbEntity.CountDocumentsAsync(finalFilter);
            return (data, totalCount);
        }

        public async Task<int> GetCameraCountAsync()
        {
            var filter = Builders<DeviceMaster>.Filter.Where(x => x.IsDeleted == false);
            var result = await dbEntity.CountDocumentsAsync(filter);
            return ((int)result);

        }

        public async Task<IEnumerable<DeviceDetailResponse>> GetPeopleDeviceListAsync()
        {
            var projection = Builders<DeviceMaster>.Projection
            .Include("_id")
            .Include("userName")
            .Include("password")
            .Include("isHttps")
            .Include("apiModel")
            .Include("ipAddress")
            .Include("channelEvent")
            .Include("objectCountingConfiguration");

            var filterPeopleCount = Builders<DeviceMaster>.Filter.Where(
                                    x => x.PeopleCount != null && x.IsDeleted == false && x.PeopleCount.Any(pc => pc.Enable == true));

            var filterChannelEvent = Builders<DeviceMaster>.Filter.Where(x =>
                                     x.ChannelEvent != null && x.IsDeleted == false && x.ChannelEvent.Any(ce => ce.Connected == true &&
                                     x.ObjectCountingConfiguration != null &&
                                     x.ObjectCountingConfiguration.Any(oc => oc.Channel == ce.Channel)));

            var finalFilter = Builders<DeviceMaster>.Filter.Or(filterPeopleCount, filterChannelEvent);

            var result = await dbEntity.Find(finalFilter).Project<DeviceMaster>(projection).ToListAsync();

            var response = result.Select(x => new DeviceDetailResponse
            {
                Id = x.Id,
                Username = x.UserName,
                Password = x.Password,
                IsHttps = x.IsHttps,
                IpAddress = x.IpAddress,
                ApiModel = x.APIModel,
                ChannelIndexList = (x.ObjectCountingConfiguration ?? new List<ChannelConfiguration>())
                                   .Where(occ => (x.ChannelEvent ?? new List<ChannelEvent>())
                                   .Any(ce => ce.Connected && ce.Channel == occ.Channel))
                                   .SelectMany(occ => (occ.CountingRules ?? new List<CountingRule>())
                                   .Where(cr => cr.Enable && cr.ObjectType == "Person")
                                   .SelectMany(cr => cr.Lines.Select(line => new PeopleWiseApiChannel
                                   {
                                       Channel = occ.Channel,
                                       IndexName = line.Name,
                                       LineIndex = line.Index,
                                       ChannelDataIndex = cr.Index
                                   }))).ToList()
            }).ToList();
            return response;
        }

        public async Task<IEnumerable<DeviceDetailResponse>> GetVehicleDeviceListAsync()
        {
            var projection = Builders<DeviceMaster>.Projection
            .Include("_id")
            .Include("userName")
            .Include("password")
            .Include("isHttps")
            .Include("apiModel")
            .Include("ipAddress")
            .Include("channelEvent")
            .Include("objectCountingConfiguration");

            var filterVehicleCount = Builders<DeviceMaster>.Filter.Where(
                                    x => x.VehicleCount != null && x.IsDeleted == false && x.VehicleCount.Any(pc => pc.Enable == true));

            var filterChannelEvent = Builders<DeviceMaster>.Filter.Where(x =>
                x.ChannelEvent != null && x.IsDeleted == false && x.ChannelEvent.Any(ce =>
                    ce.Connected == true &&
                    x.ObjectCountingConfiguration != null && x.ObjectCountingConfiguration.Any(oc => oc.Channel == ce.Channel)
                )
            );

            var finalFilter = Builders<DeviceMaster>.Filter.Or(filterVehicleCount, filterChannelEvent);

            var result = await dbEntity.Find(finalFilter).Project<DeviceMaster>(projection).ToListAsync();

            var response = result.Select(x => new DeviceDetailResponse
            {
                Id = x.Id,
                Username = x.UserName,
                Password = x.Password,
                IsHttps = x.IsHttps,
                IpAddress = x.IpAddress,
                ApiModel = x.APIModel,
                ChannelIndexList = (x.ObjectCountingConfiguration ?? new List<ChannelConfiguration>())
                                   .Where(occ => (x.ChannelEvent ?? new List<ChannelEvent>())
                                   .Any(ce => ce.Connected && ce.Channel == occ.Channel))
                                   .SelectMany(occ => (occ.CountingRules ?? new List<CountingRule>())
                                   .Where(cr => cr.Enable && cr.ObjectType == "Vehicle")
                                   .SelectMany(cr => cr.Lines.Select(line => new PeopleWiseApiChannel
                                   {
                                       Channel = occ.Channel,
                                       IndexName = line.Name,
                                       LineIndex = line.Index,
                                       ChannelDataIndex = cr.Index
                                   }))).ToList()
            }).ToList();
            return response;
        }

        public async Task<IEnumerable<CameraSeriesCountResponse>> GetCameraSeriesCountAsync(IEnumerable<string> deviceIds)
        {
            var filter = Builders<DeviceMaster>.Filter.And(
                Builders<DeviceMaster>.Filter.In(x => x.Id, deviceIds),
                Builders<DeviceMaster>.Filter.Eq(x => x.IsDeleted, false));
            var docs = await dbEntity.Aggregate()
                                     .Match(filter)
                                     .Group(x => x.Model.Substring(0, 1),
                                            z => new
                                            {
                                                Token = z.Key,
                                                Count = z.Count()
                                            }
                                     ).ToListAsync();

            IEnumerable<CameraSeriesCountResponse> result = docs.Select(x => new CameraSeriesCountResponse
            {
                SeriesName = x.Token == "A" ? "AI Box" : x.Token + " Series" ,
                TotalCount = x.Count
            });

            return result;
        }

        public async Task<IEnumerable<DeviceMaster>> GetDevicesWithoutZones()
        {
            var filter = Builders<DeviceMaster>.Filter.And(
                Builders<DeviceMaster>.Filter.Eq(x => x.IsDeleted , false),
                Builders<DeviceMaster>.Filter.Eq(x => x.isDefaultZone, true));

            var data = await dbEntity.Find(filter).ToListAsync();
            return data;
        }

        public async Task<bool> UpdateIsFullyMappedDevice(string deviceId, bool isDefaultZone)
        {
            var update = Builders<DeviceMaster>.Update
                        .Set(x => x.isDefaultZone, isDefaultZone);


            var filter = Builders<DeviceMaster>.Filter.Eq(x => x.Id, deviceId);
            var result = await dbEntity.UpdateOneAsync(filter, update);
            return result.ModifiedCount > 0;
        }

        public async Task<IEnumerable<CameraFeaturesCountResponse>> CameraCountByFeaturesAsync(IEnumerable<string> deviceIds)
        {
            var filter = Builders<DeviceMaster>.Filter.And(
                         Builders<DeviceMaster>.Filter.In(x => x.Id, deviceIds),
                         Builders<DeviceMaster>.Filter.Eq(x => x.IsDeleted, false));
            var devices = await dbEntity.Find(filter).ToListAsync();

            var sunapiFeatures = devices.SelectMany(device => device.Features?.Sunapi?.Select(s => s.EventSource) ?? Enumerable.Empty<string>());
            var wiseAiFeatures = devices.SelectMany(device => device.Features?.WiseAI != null ? device.Features.WiseAI.SelectMany(wise => wise.GetType().GetProperties()
                .Where(prop => prop.PropertyType == typeof(bool) && (bool?)prop.GetValue(wise) == true)
                .Select(prop => prop.Name)) : Enumerable.Empty<string>());

            var combinedFeatureCounts = sunapiFeatures.Concat(wiseAiFeatures) // Merge both lists
                                        .GroupBy(feature => feature) // Group by feature name
                                        .Select(group => new CameraFeaturesCountResponse
                                        {
                                            FeaturesName = group.Key,
                                            TotalCount = group.Count()
                                        }).ToList();
            return combinedFeatureCounts;
        }
        // This method return devices which has shopping cart is configure
        public async Task<IEnumerable<DeviceDetailResponse>> GetShoppingCartDeviceListAsync()
        {
            var projection = Builders<DeviceMaster>.Projection
            .Include("_id")
            .Include("userName")
            .Include("password")
            .Include("isHttps")
            .Include("apiModel")
            .Include("ipAddress")
            .Include("channelEvent")
            .Include("objectCountingConfiguration");

            var filterPeopleCount = Builders<DeviceMaster>.Filter.Where(x => x.IsDeleted == false && x.APIModel == "WiseAI");

            var filterChannelEvent = Builders<DeviceMaster>.Filter.Where(x =>
                                     x.ChannelEvent != null && x.IsDeleted == false && x.ChannelEvent.Any(ce => ce.Connected == true &&
                                     x.ObjectCountingConfiguration != null &&
                                     x.ObjectCountingConfiguration.Any(oc => oc.Channel == ce.Channel)));

            var finalFilter = Builders<DeviceMaster>.Filter.Or(filterPeopleCount, filterChannelEvent);
            var result = await dbEntity.Find(finalFilter).Project<DeviceMaster>(projection).ToListAsync();
            var response = result.Select(x => new DeviceDetailResponse
            {
                Id = x.Id,
                Username = x.UserName,
                Password = x.Password,
                IsHttps = x.IsHttps,
                IpAddress = x.IpAddress,
                ApiModel = x.APIModel,
                ChannelIndexList = (x.ObjectCountingConfiguration ?? new List<ChannelConfiguration>())
                                   .Where(occ => (x.ChannelEvent ?? new List<ChannelEvent>())
                                   .Any(ce => ce.Connected && ce.Channel == occ.Channel))
                                   .SelectMany(occ => (occ.CountingRules ?? new List<CountingRule>())
                                   .Where(cr => cr.Enable && cr.ObjectType == "ShoppingCart")
                                   .SelectMany(cr => cr.Lines.Select(line => new PeopleWiseApiChannel
                                   {
                                       Channel = occ.Channel,
                                       IndexName = line.Name,
                                       LineIndex = line.Index,
                                       ChannelDataIndex = cr.Index
                                   }))).ToList()
            }).ToList();
            return response;
        }

        public async Task<IEnumerable<DeviceDetailResponse>> GetForkliftDeviceListAsync()
        {
            var projection = Builders<DeviceMaster>.Projection
            .Include("_id")
            .Include("userName")
            .Include("password")
            .Include("isHttps")
            .Include("apiModel")
            .Include("ipAddress")
            .Include("channelEvent")
            .Include("objectCountingConfiguration");

            var filterPeopleCount = Builders<DeviceMaster>.Filter.Where(x => x.IsDeleted == false && x.APIModel == "WiseAI" );

            var filterChannelEvent = Builders<DeviceMaster>.Filter.Where(x =>
                                     x.ChannelEvent != null && x.IsDeleted == false && x.ChannelEvent.Any(ce => ce.Connected == true &&
                                     x.ObjectCountingConfiguration != null &&
                                     x.ObjectCountingConfiguration.Any(oc => oc.Channel == ce.Channel)));

            var finalFilter = Builders<DeviceMaster>.Filter.Or(filterPeopleCount, filterChannelEvent);
            var result = await dbEntity.Find(finalFilter).Project<DeviceMaster>(projection).ToListAsync();
            var response = result.Select(x => new DeviceDetailResponse
            {
                Id = x.Id,
                Username = x.UserName,
                Password = x.Password,
                IsHttps = x.IsHttps,
                IpAddress = x.IpAddress,
                ApiModel = x.APIModel,
                ChannelIndexList = (x.ObjectCountingConfiguration ?? new List<ChannelConfiguration>())
                                   .Where(occ => (x.ChannelEvent ?? new List<ChannelEvent>())
                                   .Any(ce => ce.Connected && ce.Channel == occ.Channel))
                                   .SelectMany(occ => (occ.CountingRules ?? new List<CountingRule>())
                                   .Where(cr => cr.Enable && cr.ObjectType == "Forklift")
                                   .SelectMany(cr => cr.Lines.Select(line => new PeopleWiseApiChannel
                                   {
                                       Channel = occ.Channel,
                                       IndexName = line.Name,
                                       LineIndex = line.Index,
                                       ChannelDataIndex = cr.Index
                                   }))).ToList()
            }).ToList();
            return response;
        }

        public async Task<IEnumerable<DeviceMaster>> GetAllDeviceByDeviceIds(IEnumerable<string> deviceIds)
        {
            var filter = Builders<DeviceMaster>.Filter.And(
                Builders<DeviceMaster>.Filter.In(x => x.Id, deviceIds),
                Builders<DeviceMaster>.Filter.Eq(x => x.IsDeleted, false));
            var devices = await dbEntity.Find(filter).ToListAsync();
            return devices;
        }

        public async Task<IEnumerable<DeviceMaster>> MapCameraListByFeaturesAsync(string feature, IEnumerable<string>? deviceId)
        {
            var projection = Builders<DeviceMaster>.Projection
                             .Include("_id")
                             .Include("apiModel")
                             .Include("deviceName")
                             .Include("deviceType")
                             .Include("features.sunapi")
                             .Include("features.wiseAI");

            var filters = new List<FilterDefinition<DeviceMaster>>();

            if (feature == "PeopleCount")
            {
                filters.Add(Builders<DeviceMaster>.Filter.And(
                    Builders<DeviceMaster>.Filter.Eq(x => x.APIModel, "WiseAI"),
                    Builders<DeviceMaster>.Filter.ElemMatch("features.wiseAI",
                        Builders<BsonDocument>.Filter.In("objectcountingTypes", new[] { "Person" }))));
            }

            if (feature == "VehicleCount")
            {
                filters.Add(Builders<DeviceMaster>.Filter.And(
                    Builders<DeviceMaster>.Filter.Eq(x => x.APIModel, "WiseAI"),
                    Builders<DeviceMaster>.Filter.ElemMatch("features.wiseAI",
                        Builders<BsonDocument>.Filter.In("objectcountingTypes", new[] { "Vehicle" }))));
            }

            filters.Add(Builders<DeviceMaster>.Filter.And(
                Builders<DeviceMaster>.Filter.Eq(x => x.APIModel, "WiseAI"),
                Builders<DeviceMaster>.Filter.Eq($"features.wiseAI.0.{feature}", true)));

            filters.Add(Builders<DeviceMaster>.Filter.And(
                Builders<DeviceMaster>.Filter.Eq(x => x.APIModel, "SUNAPI"),
                Builders<DeviceMaster>.Filter.ElemMatch("features.sunapi", Builders<BsonDocument>.Filter.Eq("eventSource", new BsonRegularExpression(feature, "i")))));


            var finalFilter = Builders<DeviceMaster>.Filter.Or(filters);

            if(deviceId != null && deviceId.Count() > 0)
            {
                var deviceIdFilter = Builders<DeviceMaster>.Filter.In(x => x.Id, deviceId);
                finalFilter = Builders<DeviceMaster>.Filter.And(finalFilter, deviceIdFilter);
            }
            var result = await dbEntity.Find(finalFilter).Project<DeviceMaster>(projection).ToListAsync();
            return result;
        }

        public async Task<IEnumerable<ZoneCamera>> GetUnMappeddevicesforWidget()
        {
            IEnumerable<ZoneCamera> zoneCameras = Enumerable.Empty<ZoneCamera>();
            var filter = Builders<DeviceMaster>.Filter.Eq(x => x.isDefaultZone, true);
            var devices = await dbEntity.Find(filter).ToListAsync();

            foreach(var device in devices)
            {
                if(device.APIModel == "SUNAPI")
                {
                    zoneCameras = zoneCameras.Append(new ZoneCamera
                    {
                        DeviceId = device.Id,
                        Channel = 0,
                        PeopleLineIndex = device.PeopleCount != null ? device.PeopleCount.FirstOrDefault().Lines.Select(x => x.line).ToArray<int>() : [],
                        VehicleLineIndex = device.VehicleCount != null ? device.VehicleCount.FirstOrDefault().Lines.Select(x => x.line).ToArray<int>() : [],
                    });
                }
                else if (device.APIModel == "WiseAI")
                {
                    foreach (var channel in device.ObjectCountingConfiguration)
                    {
                        zoneCameras = zoneCameras.Append(new ZoneCamera
                        {
                            DeviceId = device.Id,
                            Channel = channel.Channel,
                            PeopleLineIndex = channel.CountingRules != null ? channel.CountingRules.Where(x => x.ObjectType == "Person").SelectMany(y => y.Lines).Select(z => z.Index).ToArray() : Array.Empty<int>(),
                            VehicleLineIndex = channel.CountingRules != null ? channel.CountingRules.Where(x => x.ObjectType == "Vehicle").SelectMany(y => y.Lines).Select(z => z.Index).ToArray() : Array.Empty<int>(),
                        });
                    }
                }
            }

            return zoneCameras;
        }

        public async Task<bool> IsDeviceExistsAsync(string deviceIpAddress, string? deviceId)
        {
            var filters = new List<FilterDefinition<DeviceMaster>>();
            filters.Add(Builders<DeviceMaster>.Filter.Regex("ipAddress", new BsonRegularExpression($"^{Regex.Escape(deviceIpAddress)}$", "i")));
            filters.Add(Builders<DeviceMaster>.Filter.Eq(x => x.IsDeleted, false));

            if (!string.IsNullOrEmpty(deviceId))
            {
                filters.Add(Builders<DeviceMaster>.Filter.Ne(x => x.Id, deviceId));
            }
            var filter = Builders<DeviceMaster>.Filter.And(filters);
            var data = await dbEntity.Find(filter).AnyAsync();
            return data; 
        }
        public async Task<DeviceMaster> GetDeviceDataByIpAddressAsync(string deviceIpAddress)
        {
            var filters = new List<FilterDefinition<DeviceMaster>>
    {
        Builders<DeviceMaster>.Filter.Regex("ipAddress", new BsonRegularExpression($"^{Regex.Escape(deviceIpAddress)}$", "i")),
        Builders<DeviceMaster>.Filter.Eq(x => x.IsDeleted, false)
    };

            var combinedFilter = Builders<DeviceMaster>.Filter.And(filters);

            var data = await dbEntity.Find(combinedFilter).FirstOrDefaultAsync();
            return data;
        }

    }
}

