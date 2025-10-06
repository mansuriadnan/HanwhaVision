using HanwhaClient.Infrastructure.Connection;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.DbEntities;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace HanwhaClient.Infrastructure.Repository
{
    public class RoleRepository : RepositoryBase<RoleMaster>, IRoleRepository
    {
        public RoleRepository(MongoDbConnectionService mongoDbConnectionService) : base(mongoDbConnectionService, AppDBConstants.RoleMaster, true)
        {
        }

        public async Task<bool> IsRoleNameExistAsync(string rolename, string roleId = null)
        {
            var filter = Builders<RoleMaster>.Filter.And(Builders<RoleMaster>.Filter.Eq(x => x.RoleName, rolename.ToLower()),
                                                         Builders<RoleMaster>.Filter.Eq(x => x.IsDeleted, false));

            var options = new FindOptions
            {
                Collation = new Collation("en", strength: CollationStrength.Secondary) // Case-insensitive issue
            };

            if (!string.IsNullOrEmpty(roleId))
            {
                filter = Builders<RoleMaster>.Filter.And(
                    filter,
                    Builders<RoleMaster>.Filter.Ne(x => x.Id, roleId));
            }
            var data = await dbEntity.Find(filter, options).AnyAsync();
            return data;
        }

        public async Task<string> GetRoleIdByRoleName(string roleName)
        {
            var filter = Builders<RoleMaster>.Filter.And(
                Builders<RoleMaster>.Filter.Where(x => x.RoleName.ToLower() == roleName.ToLower()),
                Builders<RoleMaster>.Filter.Eq(x => x.IsDeleted, false));
            var data = await dbEntity.Find(filter).FirstOrDefaultAsync();
            return data?.Id;
        }
        public async Task<IEnumerable<RoleMaster>> GetAllRoles()
        {
            var filter = Builders<RoleMaster>.Filter.And(
              Builders<RoleMaster>.Filter.Eq(x => x.IsDeleted, false),
              Builders<RoleMaster>.Filter.And(
              Builders<RoleMaster>.Filter.Ne(x => x.RoleName, "Super Admin")));

            var data = await dbEntity.Find(filter).ToListAsync();
            return data;
        }
    }
}
