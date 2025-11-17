using HanwhaClient.Infrastructure.Connection;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.Dto;
using MongoDB.Bson;
using MongoDB.Driver;

namespace HanwhaClient.Infrastructure.Repository
{
    public class ZoneCameraRepository : RepositoryBase<ZoneCamera>, IZoneCameraRepository
    {

        public ZoneCameraRepository(MongoDbConnectionService mongoDbConnectionService) : base(mongoDbConnectionService, AppDBConstants.ZoneCamera)
        {

        }
        public async Task<IEnumerable<ZoneCamera>> GetCamerasByZoneId(string zoneId)
        {
            var filter = Builders<ZoneCamera>.Filter.And(
                Builders<ZoneCamera>.Filter.Eq(x => x.ZoneId, zoneId),
                Builders<ZoneCamera>.Filter.Eq(x => x.IsDeleted, false));
            var data = await dbEntity.Find(filter).ToListAsync();
            return data;
        }

        public async Task<IEnumerable<ZoneCamera>> GetCamerasByZoneIds(IEnumerable<string> zoneIds)
        {
            var filter = Builders<ZoneCamera>.Filter.And(
                            Builders<ZoneCamera>.Filter.In(x => x.ZoneId, zoneIds),
                            Builders<ZoneCamera>.Filter.Eq(x => x.IsDeleted, false)
                        );
            var data = await dbEntity.Find(filter).ToListAsync();
            return data;
        }

        public async Task<IEnumerable<ZoneCamera>> GetAllDevicesByFilter(DeviceRequest cameraRequest)
        {
            var filters = new List<FilterDefinition<ZoneCamera>>();
            if (cameraRequest != null && !string.IsNullOrEmpty(cameraRequest.SearchText))
            {
                filters.Add(Builders<ZoneCamera>.Filter.Regex(x => x.ZoneId, new BsonRegularExpression(cameraRequest.SearchText, "i")));
                filters.Add(Builders<ZoneCamera>.Filter.Regex(x => x.FloorId, new BsonRegularExpression(cameraRequest.SearchText, "i")));
            }

            var zoneFloorFilter = filters.Any() ? Builders<ZoneCamera>.Filter.Or(filters) : Builders<ZoneCamera>.Filter.Empty;
            var data = await dbEntity.Find(zoneFloorFilter).ToListAsync();
            return data;
        }

        public async Task<bool> UpdateZoneDeviceByZoneCameraIdAsync(MappedDevices zoneCameraData, string userId)
        {
            var update = Builders<ZoneCamera>.Update
                        .Set(z => z.Position, new DevicePosition
                        {
                            X = zoneCameraData.position.x,
                            Y = zoneCameraData.position.y,
                            Angle = zoneCameraData.position.angle
                        })
                        .Set(z => z.FOVColor, zoneCameraData.fovcolor)
                        .Set(z => z.FOVLength, zoneCameraData.fovlength)
                        .Set(z => z.PeopleLineIndex, zoneCameraData.peopleLineIndex)
                        .Set(z => z.VehicleLineIndex, zoneCameraData.vehicleLineIndex)
                        .Set(z => z.Channel, zoneCameraData.Channel)
                        .Set(z => z.IsSphere, zoneCameraData.isSphere)
                        .Set(z => z.UpdatedBy, userId)
                        .Set(z => z.UpdatedOn, DateTime.UtcNow);

            var filter = Builders<ZoneCamera>.Filter.Eq(x => x.Id, zoneCameraData.ZoneCameraId);
            var result = await dbEntity.UpdateOneAsync(filter, update);
            return result.ModifiedCount > 0;
        }

        public async Task<IEnumerable<string>> GetDevicebyFloorAndZoneAsync(IEnumerable<string> floorId, IEnumerable<string>? zoneId)
        {
            ProjectionDefinition<ZoneCamera> projection = Builders<ZoneCamera>.Projection
            .Include("deviceId");

            var filters = new List<FilterDefinition<ZoneCamera>>();
            filters.Add(Builders<ZoneCamera>.Filter.In(x => x.FloorId, floorId));
            filters.Add(Builders<ZoneCamera>.Filter.Eq(x => x.IsDeleted, false));
            if (zoneId != null && zoneId.Count() > 0)
            {
                filters.Add(Builders<ZoneCamera>.Filter.In(x => x.ZoneId, zoneId));
            }
            var filter = Builders<ZoneCamera>.Filter.And(filters);
            var data = await dbEntity.Find(filter).Project<ZoneCamera>(projection).ToListAsync();
            return data.Select(x => x.DeviceId);
        }

        public async Task<IEnumerable<ZoneCamera>> GetZoneMappedDevices(IEnumerable<string> zoneIds)
        {
            ProjectionDefinition<ZoneCamera> projection = Builders<ZoneCamera>.Projection
            .Include("position")
            .Include("fovLength")
            .Include("fovColor")
            .Include("lineIndex")
            .Include("isSphere")
            .Include("zoneId")
            .Include("deviceId")
            .Include("peopleLineIndex")
            .Include("vehicleLineIndex")
            .Include("channel")
            .Include("_id");

            var filter = Builders<ZoneCamera>.Filter.In(x => x.ZoneId, zoneIds);
            var deleteFilter = Builders<ZoneCamera>.Filter.Eq(x => x.IsDeleted, false);
            filter = Builders<ZoneCamera>.Filter.And(filter, deleteFilter);
            var data = await dbEntity.Find(filter).Project<ZoneCamera>(projection).ToListAsync();
            return data;

        }

        public async Task<IEnumerable<ZoneCamera>> GetZoneCameraDetails(IEnumerable<string> deviceId)
        {
            var filter = Builders<ZoneCamera>.Filter.In(x => x.DeviceId ,deviceId);
            var deleteFilter = Builders<ZoneCamera>.Filter.Eq(x => x.IsDeleted, false);
            filter = Builders<ZoneCamera>.Filter.And(filter, deleteFilter);
            var data = await dbEntity.Find(filter).ToListAsync();
            return data;
        }
        
    }
}
