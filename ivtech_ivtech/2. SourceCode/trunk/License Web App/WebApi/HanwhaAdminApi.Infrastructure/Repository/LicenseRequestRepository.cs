using HanwhaAdminApi.Infrastructure.Connection;
using HanwhaAdminApi.Infrastructure.Interfaces;
using HanwhaAdminApi.Model.Common;
using HanwhaAdminApi.Model.DbEntities;
using MongoDB.Driver;

namespace HanwhaAdminApi.Infrastructure.Repository
{
    public class LicenseRequestRepository : RepositoryBase<LicenseRequest>, ILicenseRequestRepository
    {
        public LicenseRequestRepository(MongoDbConnectionService mongoDbConnectionService) : base(mongoDbConnectionService, AppDBConstants.LicenseRequest)
        {

        }

        public async Task<List<LicenseRequest>> GetTopLicense()
        {
            var filter = Builders<LicenseRequest>.Filter.Where(x => x.ExpiryDate >= DateTime.Now);
            var data = await dbEntity.Find(filter).SortByDescending(x => x.NoOfChannel).Limit(10).ToListAsync();
            return data;
        }

        public Task<Dictionary<string, long>> GetLicenseCountForDashboard(DateTime? startDate, DateTime? endDate)
        {
            long totalLicense = dbEntity.Find(Builders<LicenseRequest>.Filter.Where(x => (startDate != null ? x.CreatedOn >= startDate : true) &&
                                (endDate != null ? x.CreatedOn <= endDate : true))).CountDocuments();

            long activeLicense = dbEntity.Find(Builders<LicenseRequest>.Filter.Where(x => x.ExpiryDate >= DateTime.Now &&
                                (startDate != null ? x.CreatedOn >= startDate : true) &&
                                (endDate != null ? x.CreatedOn <= endDate : true))).CountDocuments();

            long expiredLicense = dbEntity.Find(Builders<LicenseRequest>.Filter.Where(x => x.ExpiryDate < DateTime.Now &&
                                (startDate != null ? x.CreatedOn >= startDate : true) &&
                                (endDate != null ? x.CreatedOn <= endDate : true))).CountDocuments();

            long futureLicense = dbEntity.Find(Builders<LicenseRequest>.Filter.Where(x => x.StartDate > DateTime.Now &&
                                (startDate != null ? x.CreatedOn >= startDate : true) &&
                                (endDate != null ? x.CreatedOn <= endDate : true))).CountDocuments();

            return Task.FromResult(new Dictionary<string, long>
            {
                { "TotalLicense", totalLicense},
                { "ActiveLicense", activeLicense},
                { "ExpiredLicense", expiredLicense},
                { "FutureLicense", futureLicense}
            });
        }

        public async Task<List<LicenseRequest>> GetTopDueLicense()
        {
            var filter = Builders<LicenseRequest>.Filter.Where(x => x.ExpiryDate < DateTime.Now);
            var data = await dbEntity.Find(filter).SortByDescending(x => x.ExpiryDate).Limit(10).ToListAsync();
            return data;
        }

        public async Task<List<LicenseRequest>> GetLicenseByCustomerId(string clientId)
        {
            var filter = Builders<LicenseRequest>.Filter.Where(x => x.CustomerId == clientId && (x.IsDeleted != null || x.IsDeleted != true));
            var data = await dbEntity.Find(filter).SortByDescending(x => x.CreatedOn).ToListAsync();
            return data;
        }

        public async Task<long> DeleteLicenseByCustomerId(string clientId,string userId)
        {
            var filter = Builders<LicenseRequest>.Filter.Eq(x => x.CustomerId, clientId);
            var update = Builders<LicenseRequest>.Update
                .Set(c => c.IsDeleted, true)
                .Set(c => c.UpdatedOn, DateTime.Now)
                .Set(c => c.DeletedOn, DateTime.Now)
                .Set(c => c.UpdatedBy, userId);

            var updatedData = await dbEntity.UpdateManyAsync(filter, update);
            return updatedData.ModifiedCount;

        }
    }
}
