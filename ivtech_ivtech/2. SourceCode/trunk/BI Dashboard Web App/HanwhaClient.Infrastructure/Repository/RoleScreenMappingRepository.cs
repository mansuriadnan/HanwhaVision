using HanwhaClient.Infrastructure.Connection;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.Role;
using MongoDB.Driver;

namespace HanwhaClient.Infrastructure.Repository
{
    public class RoleScreenMappingRepository : RepositoryBase<RoleScreenMapping>, IRoleScreenMappingRepository
    {
        public RoleScreenMappingRepository(MongoDbConnectionService mongoDbConnectionService) : base(mongoDbConnectionService, AppDBConstants.RoleScreenMapping, true)
        {
        }

        public async Task<RoleScreenMapping> GetRoleScreenMappingAsync(string roleId)
        {
            var filter = Builders<RoleScreenMapping>.Filter.And(
                Builders<RoleScreenMapping>.Filter.Eq(x => x.RoleId, roleId),
                Builders<RoleScreenMapping>.Filter.Eq(x => x.IsDeleted, false));
            var data = await dbEntity.Find(filter).FirstOrDefaultAsync();
            return data;
        }

        public async Task<long> SaveRoleScreenMappingAsync(string roleId, IEnumerable<ScreenMapping> obj, string userId)
        {
            var filter = Builders<RoleScreenMapping>.Filter.Eq(x => x.RoleId, roleId);

            var update = Builders<RoleScreenMapping>.Update
            .Set(c => c.ScreenMappings, obj)
                    .Set(c => c.UpdatedOn, DateTime.UtcNow)
                    .Set(c => c.UpdatedBy, userId);
            var updatedData = await dbEntity.UpdateOneAsync(filter, update);
            return updatedData.ModifiedCount;
        }

        public async Task<long> DeleteRoleScreenMappingByRoleIdAsync(string roleId, string userId)
        {
            var filter = Builders<RoleScreenMapping>.Filter.Eq(x => x.RoleId, roleId);
            var update = Builders<RoleScreenMapping>.Update
                     .Set(c => c.IsDeleted, true)
                     .Set(c => c.UpdatedOn, DateTime.UtcNow)
                     .Set(c => c.UpdatedBy, userId)
                     .Set(c => c.DeletedOn, DateTime.UtcNow);

            var updatedData = await dbEntity.UpdateOneAsync(filter, update);
            return updatedData.ModifiedCount;
        }

        public async Task<long> UpdateFloorRoleScreenMappingAsync(SaveFloorRoleMappingRequest floorRoleScreenMappingRequest, string userId)
        {
            var filter = Builders<RoleScreenMapping>.Filter.Eq(x => x.RoleId, floorRoleScreenMappingRequest.RoleId);
            var update = Builders<RoleScreenMapping>.Update
                     .Set(c => c.DataAccessPermissions, floorRoleScreenMappingRequest.DataAccessPermissions)
                     .Set(c => c.UpdatedOn, DateTime.UtcNow)
                     .Set(c => c.UpdatedBy, userId);

            var updatedData = await dbEntity.UpdateOneAsync(filter, update);
            return updatedData.ModifiedCount;
        }

        public async Task<long> UpdateWidgetRoleScreenMappingAsync(SaveWidgetAccessPermissionRequest widgetRoleScreenMappingRequest, string userId)
        {
            var filter = Builders<RoleScreenMapping>.Filter.Eq(x => x.RoleId, widgetRoleScreenMappingRequest.RoleId);
            var update = Builders<RoleScreenMapping>.Update
                     .Set(c => c.WidgetAccessPermissions, widgetRoleScreenMappingRequest.WidgetAccessPermissions)
                     .Set(c => c.UpdatedOn, DateTime.UtcNow)
                     .Set(c => c.UpdatedBy, userId);

            var updatedData = await dbEntity.UpdateOneAsync(filter, update);
            return updatedData.ModifiedCount;
        }

        public async Task<IEnumerable<RoleScreenMapping>> GetMultipleRoleScreenMappingAsync(IEnumerable<string> roleId)
        {
            var filter = Builders<RoleScreenMapping>.Filter.In(x => x.RoleId, roleId);
            var data = await dbEntity.Find(filter).ToListAsync();
            return data;
        }
    }
}
