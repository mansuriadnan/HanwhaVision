using Microsoft.Extensions.Configuration;
using MongoDB.Driver;

namespace HanwhaAdminApi.Infrastructure.Connection
{
    public class MongoDbConnectionService
    {
        private readonly IConfiguration _configuration;
        private readonly IMongoDatabase _database;

        public MongoDbConnectionService(IConfiguration configuration)
        {
            this._configuration = configuration;

            var connectionString = _configuration.GetConnectionString("DBConnection");
            var mongoUrl = MongoUrl.Create(connectionString);
            var mongoClient = new MongoClient(mongoUrl);
            _database = mongoClient.GetDatabase(mongoUrl.DatabaseName);
        }

        public IMongoDatabase? Database => _database;
    }
}
