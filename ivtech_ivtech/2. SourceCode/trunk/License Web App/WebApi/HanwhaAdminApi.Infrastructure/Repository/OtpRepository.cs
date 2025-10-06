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
    public class OtpRepository : RepositoryBase<Otp>, IOtpRepository
    {

        public OtpRepository(MongoDbConnectionService mongoDbConnectionService) : base(mongoDbConnectionService, AppDBConstants.Otp)
        {
        }

        public async Task<Otp> CreateOtpAsync(Otp Otp)
        {
            await dbEntity.InsertOneAsync(Otp);
            return Otp;
        }

        

        public async Task<Otp> GetOtpByEmailAsync(string email)
        {
            return await dbEntity
                .Find(otp => otp.Email == email && !otp.IsUtilized && !otp.IsDeleted)
                .SortByDescending(x => x.CreatedOn)
                .FirstOrDefaultAsync();
        }

        public async Task UpdateOtpUsedStatusAsync(string id)
        {
            var filter = Builders<Otp>.Filter.Eq(x => x.Id, id);
            if (filter != null)
            {
                var update = Builders<Otp>.Update.Set(x => x.IsUtilized, true);
                await dbEntity.UpdateOneAsync(filter, update);
            }
        }

        public async Task DeleteOtp(string id)
        {
            var filter = Builders<Otp>.Filter.Eq(x => x.Id, id);
            if (filter != null)
            {
                var update = Builders<Otp>.Update.Set(x => x.IsDeleted, true);
                await dbEntity.UpdateOneAsync(filter, update);
            }
        }
    }
}
