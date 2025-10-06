using HanwhaClient.Infrastructure.Connection;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.DbEntities;
using MongoDB.Driver;

namespace HanwhaClient.Infrastructure.Repository
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
                .Find(otp => otp.Email == email && !otp.IsUtilized)
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
    }
}
