using HanwhaAdminApi.Infrastructure.Connection;
using HanwhaAdminApi.Infrastructure.Interfaces;
using HanwhaAdminApi.Model.Common;
using HanwhaAdminApi.Model.DbEntities;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaAdminApi.Infrastructure.Repository
{
    public class DistributorRepository : RepositoryBase<DistributorMaster> ,IDistributorRepository
    {
        public DistributorRepository(MongoDbConnectionService mongoDbConnectionService) : base(mongoDbConnectionService, AppDBConstants.DistributorMaster)
        {
        }

        public async Task<bool> IsDistributorNameExistAsync(string distributorname, string distributorId = null)
        {
            //var filter = Builders<DistributorMaster>.Filter.Eq(x => x.DistributorName, distributorname.ToLower());

            var filter = Builders<DistributorMaster>.Filter.And(
                  Builders<DistributorMaster>.Filter.Eq(x => x.DistributorName, distributorname.ToLower()),
                  Builders<DistributorMaster>.Filter.Eq(x => x.IsDeleted, false));

            var options = new FindOptions
            {
                Collation = new Collation("en", strength: CollationStrength.Secondary) // Case-insensitive issue
            };

            if (!string.IsNullOrEmpty(distributorId))
            {
                filter = Builders<DistributorMaster>.Filter.And(
                    filter,
                    Builders<DistributorMaster>.Filter.Ne(x => x.Id, distributorId),
                    Builders<DistributorMaster>.Filter.Ne(x => x.IsDeleted, true)
                    );
            }
            var data = await dbEntity.Find(filter, options).AnyAsync();
            return data;
        }
        public async Task<bool> IsEmailAddressExistAsync(string distributoremail, string distributorId = null)
        {
            //var filter = Builders<DistributorMaster>.Filter.Eq(x => x.Email, distributoremail);

            var filter = Builders<DistributorMaster>.Filter.And(
                  Builders<DistributorMaster>.Filter.Eq(x => x.Email, distributoremail),
                  Builders<DistributorMaster>.Filter.Eq(x => x.IsDeleted, false));

            var options = new FindOptions
            {
                Collation = new Collation("en", strength: CollationStrength.Secondary) // Case-insensitive issue
            };

            if (!string.IsNullOrEmpty(distributorId))
            {
                filter = Builders<DistributorMaster>.Filter.And(
                    filter,
                    Builders<DistributorMaster>.Filter.Ne(x => x.Id, distributorId));
            }
            var data = await dbEntity.Find(filter, options).AnyAsync();
            return data;
        }



    }

}
