using HanwhaAdminApi.Infrastructure.Connection;
using HanwhaAdminApi.Infrastructure.Interfaces;
using HanwhaAdminApi.Model.Common;
using HanwhaAdminApi.Model.DbEntities;
using MongoDB.Driver;

namespace HanwhaAdminApi.Infrastructure.Repository
{
    public class UsersRepository : RepositoryBase<UserMaster>, IUsersRepository
    {
        public UsersRepository(MongoDbConnectionService mongoDbConnectionService) : base(mongoDbConnectionService, AppDBConstants.UserMaster)
        {

        }

        public async Task<UserMaster> GetUserByUsernameAsync(string username)
        {
            var filter = Builders<UserMaster>.Filter.And(
                         Builders<UserMaster>.Filter.Eq(x => x.IsDeleted, false),
                         Builders<UserMaster>.Filter.Or(
                         Builders<UserMaster>.Filter.Eq(x => x.Username, username),
                         Builders<UserMaster>.Filter.Eq(x => x.Email, username)));


            var excludeSysadminFilter = Builders<UserMaster>.Filter.And(
                                            Builders<UserMaster>.Filter.Ne(x => x.Username, "sysadmin"),
                                            Builders<UserMaster>.Filter.Ne(x => x.Email, "systemadmin@example.com"));

            var combinedFilter = Builders<UserMaster>.Filter.And(filter, excludeSysadminFilter);

            var data = await dbEntity.Find(combinedFilter).FirstOrDefaultAsync();
            return data;
        }

        public async Task<bool> IsUsernameExistAsync(string username, string userId = null)
        {
            //var filter = Builders<UserMaster>.Filter.Eq(x => x.Username, username.ToLower());

            var filter = Builders<UserMaster>.Filter.And(
                        Builders<UserMaster>.Filter.Eq(x => x.Username, username.ToLower()),
                        Builders<UserMaster>.Filter.Eq(x => x.IsDeleted, false));

            var options = new FindOptions
            {
                Collation = new Collation("en", strength: CollationStrength.Secondary) // Case-insensitive issue
            };

            if (!string.IsNullOrEmpty(userId))
            {
                filter = Builders<UserMaster>.Filter.And(
                    filter,
                    Builders<UserMaster>.Filter.Ne(x => x.Id, userId),
                    Builders<UserMaster>.Filter.Ne(x => x.IsDeleted, true)
                    );
            }
            var data = await dbEntity.Find(filter, options).AnyAsync();
            return data;
        }
        public async Task<bool> IsEmailnameExistAsync(string email, string userId = null)
        {
            //var filter = Builders<UserMaster>.Filter.Eq(x => x.Email, email);


            var filter = Builders<UserMaster>.Filter.And(
                        Builders<UserMaster>.Filter.Eq(x => x.Email, email),
                        Builders<UserMaster>.Filter.Eq(x => x.IsDeleted, false));


            var options = new FindOptions
            {
                Collation = new Collation("en", strength: CollationStrength.Secondary) // Case-insensitive issue
            };

            if (!string.IsNullOrEmpty(userId))
            {
                filter = Builders<UserMaster>.Filter.And(
                    filter,
                    Builders<UserMaster>.Filter.Ne(x => x.Id, userId));
            }
            var data = await dbEntity.Find(filter, options).AnyAsync();
            return data;
        }

        public async Task<UserMaster> GetUserByEmailAsync(string email)
        {
            var filter = Builders<UserMaster>.Filter.Eq(x => x.Email, email);
            var data = await dbEntity.Find(filter).FirstOrDefaultAsync();
            return data;
        }

        public async Task UpdatePasswordAsync(string userId, string newPasswordHash)
        {
            var filter = Builders<UserMaster>.Filter.Eq(x => x.Id, userId);
            var update = Builders<UserMaster>.Update
                .Set(x => x.Password, newPasswordHash)
                .Set(x => x.UpdatedBy, userId)
                .Set(x => x.UpdatedOn, DateTime.UtcNow);

            await dbEntity.UpdateOneAsync(filter, update);
        }

        public async Task<UserMaster> GetUserByUserIdAsync(string userId)
        {
            var filter = Builders<UserMaster>.Filter.Eq(x => x.Id, userId);
            var data = await dbEntity.Find(filter).FirstOrDefaultAsync();
            return data;
        }

        public async Task<bool> IsRoleExistAsync(string roleId)
        {
            var filter = Builders<UserMaster>.Filter.And(
                         Builders<UserMaster>.Filter.AnyEq(x => x.RoleIds, roleId),
                         Builders<UserMaster>.Filter.Eq(x => x.IsDeleted, false));

            var data = await dbEntity.Find(filter).FirstOrDefaultAsync();
            return data != null; // Return true if a matching document is found
        }

        public Task<Dictionary<string, long>> GetUserCountForDashboard(DateTime? startDate, DateTime? endDate)
        {
            long totalUser = dbEntity.Find(Builders<UserMaster>.Filter.Where(x => (startDate != null ? x.CreatedOn >= startDate : true) &&
                        (endDate != null ? x.CreatedOn <= endDate : true))).CountDocuments();

            long activeUser = dbEntity.Find(Builders<UserMaster>.Filter.Where(x => x.IsDeleted == false &&
                            (startDate != null ? x.CreatedOn >= startDate : true) &&
                            (endDate != null ? x.CreatedOn <= endDate : true))).CountDocuments();

            return Task.FromResult(new Dictionary<string, long>
            {
                { "TotalUser", totalUser},
                { "ActiveUser", activeUser}
            });

        }

        public async Task<IEnumerable<UserMaster>> GetAllUserAsync()
        {
            var filter = Builders<UserMaster>.Filter.And(
                     Builders<UserMaster>.Filter.Ne(x => x.Username, "sysadmin"),
                     Builders<UserMaster>.Filter.Ne(x => x.Username, "superadmin"),
                     Builders<UserMaster>.Filter.Eq(x => x.IsDeleted, false));

            var data = await dbEntity.Find(filter).SortByDescending(x => x.CreatedOn).ToListAsync();
            return data;
        }
    }
}
