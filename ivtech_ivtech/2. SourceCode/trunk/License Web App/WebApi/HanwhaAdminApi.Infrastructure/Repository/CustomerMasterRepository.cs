using HanwhaAdminApi.Infrastructure.Connection;
using HanwhaAdminApi.Infrastructure.Interfaces;
using HanwhaAdminApi.Model.Common;
using HanwhaAdminApi.Model.DbEntities;
using MongoDB.Driver;

namespace HanwhaAdminApi.Infrastructure.Repository
{
    public class CustomerMasterRepository : RepositoryBase<CustomerMaster>, ICustomerMasterRepository
    {
        public CustomerMasterRepository(MongoDbConnectionService mongoDbConnectionService) : base(mongoDbConnectionService, AppDBConstants.CustomerMaster)
        {
        }

        public async Task<Dictionary<string, long>> GetCustomerCountForDashboard(DateTime? startDate, DateTime? endDate)
        {
            long totalCustomer = dbEntity.Find(Builders<CustomerMaster>.Filter.Where(x => (startDate != null ? x.CreatedOn >= startDate : true) &&
                            (endDate != null ? x.CreatedOn <= endDate : true))).CountDocuments();

            long activeCustomer = dbEntity.Find(Builders<CustomerMaster>.Filter.Where(x => x.IsDeleted == false &&
                            (startDate != null ? x.CreatedOn >= startDate : true) &&
                            (endDate != null ? x.CreatedOn <= endDate : true))).CountDocuments();

            return new Dictionary<string, long>
            {
                { "TotalCustomers", totalCustomer },
                { "ActiveCustomers", activeCustomer }
            };

        }

        public async Task<string> GetLatestCustomerIdAsync()
        {
            var latestCustomer = await dbEntity
                .Find(Builders<CustomerMaster>.Filter.Empty)
                .Sort(Builders<CustomerMaster>.Sort.Descending(c => c.CustomerNo)) //need to be discussed
                .Limit(1)
                .FirstOrDefaultAsync();
            int newCustomerNo = (latestCustomer != null && int.TryParse(latestCustomer.CustomerNo, out int latestNo)) ? latestNo + 1 : 1;
            return newCustomerNo.ToString("D5");
        }

        public async Task<bool> IsEmailnameExistAsync(string emailId, string customerRequestId = "")
        {
            //var filter = Builders<CustomerMaster>.Filter.Eq(x => x.EmailAddress, emailId.ToLower());

            //var options = new FindOptions
            //{
            //    Collation = new Collation("en", strength: CollationStrength.Secondary) // Case-insensitive issue
            //};
            //var data = await dbEntity.Find(filter, options).AnyAsync();
            //return data;


            var filter = Builders<CustomerMaster>.Filter.And(
                      Builders<CustomerMaster>.Filter.Eq(x => x.EmailAddress, emailId),
                      Builders<CustomerMaster>.Filter.Eq(x => x.IsDeleted, false));

            var options = new FindOptions
            {
                Collation = new Collation("en", strength: CollationStrength.Secondary) // Case-insensitive issue
            };

            if (!string.IsNullOrEmpty(customerRequestId))
            {
                filter = Builders<CustomerMaster>.Filter.And(
                    filter,
                    Builders<CustomerMaster>.Filter.Ne(x => x.Id, customerRequestId),
                    Builders<CustomerMaster>.Filter.Ne(x => x.IsDeleted, true)
                    );
            }
            var data = await dbEntity.Find(filter, options).AnyAsync();
            return data;

        }

        public async Task<bool> IsCustomerNameExistAsync(string customerName, string customerRequestId = "")
        {
            //var filter = Builders<CustomerMaster>.Filter.Eq(x => x.CustomerName, username.ToLower());

            var filter = Builders<CustomerMaster>.Filter.And(
                      Builders<CustomerMaster>.Filter.Eq(x => x.CustomerName, customerName),
                      Builders<CustomerMaster>.Filter.Eq(x => x.IsDeleted, false));

            var options = new FindOptions
            {
                Collation = new Collation("en", strength: CollationStrength.Secondary) // Case-insensitive issue
            };

            if (!string.IsNullOrEmpty(customerRequestId))
            {
                filter = Builders<CustomerMaster>.Filter.And(
                    filter,
                    Builders<CustomerMaster>.Filter.Ne(x => x.Id, customerRequestId),
                    Builders<CustomerMaster>.Filter.Ne(x => x.IsDeleted, true)
                    );
            }
            var data = await dbEntity.Find(filter, options).AnyAsync();
            return data;
        }

        public async Task<bool> IsDistributorExistAsync(string distributorId)
        {
            var filter = Builders<CustomerMaster>.Filter.And(
                Builders<CustomerMaster>.Filter.Eq(x => x.DistributorId, distributorId),
                Builders<CustomerMaster>.Filter.Eq(x => x.IsDeleted, false));

            var options = new FindOptions
            {
                Collation = new Collation("en", strength: CollationStrength.Secondary) // Case-insensitive issue
            };
            var data = await dbEntity.Find(filter, options).AnyAsync();
            return data;
        }
    }
}
