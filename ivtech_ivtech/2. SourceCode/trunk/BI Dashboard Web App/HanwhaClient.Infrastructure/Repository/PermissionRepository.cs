using HanwhaClient.Infrastructure.Connection;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.DbEntities;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Infrastructure.Repository
{
    public class PermissionRepository : RepositoryBase<Permission>, IPermissionRepository
    {
        public PermissionRepository(MongoDbConnectionService mongoDbConnectionService) : base(mongoDbConnectionService, AppDBConstants.Permission)
        {
        }

        //public async Task<Role> GetUserByUsernameAsync(string username)
        //{
        //    var filter = Builders<Role>.Filter.Eq(x => x.RoleName, username);
        //    var data = await dbEntity.Find(filter).FirstOrDefaultAsync();
        //    return data;
        //}
    }
}
