using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using MongoDB.Driver.Core.Configuration;

namespace HanwhaClient.Infrastructure.Connection
{
    public class MongoDbConnectionService
    {
        private readonly IConfiguration _configuration;
        private readonly IMongoDatabase _database;
        private readonly ILogger<MongoDbConnectionService>? _logger;
        public IMongoDatabase? Database => _database;

        public MongoDbConnectionService(IConfiguration configuration, ILogger<MongoDbConnectionService>? logger = null)
        {
            this._configuration = configuration;
            this._logger = logger;

            try
            {
                // Fixed: Use proper IConfiguration methods instead of GetValue
                var host = _configuration["ConnectionStrings:Host"] ?? "127.0.0.1";
                var port = _configuration["ConnectionStrings:Port"] ?? "27017";
                var databaseName = _configuration["ConnectionStrings:DatabaseName"] ?? "visioninsightBIDashboard";
                var authentication = _configuration["ConnectionStrings:Authentication"] ?? "false";
                MongoUrl mongoUrl;
                if (authentication == "true")
                {
                    mongoUrl = MongoCredentials.BuildMongoUrl(host, port, databaseName);
                }
                else
                {
                    mongoUrl = MongoUrl.Create($"mongodb://{host}:{port}/{databaseName}");
                }

                _logger?.LogInformation("Connecting to MongoDB at {Host}:{Port} with database {DatabaseName}", host, port, databaseName);

                // Build secure connection string using credentials from C# class

                //return $"mongodb://{username}:{password}@{host}:{port}/{databaseName}";
                var mongoClient = new MongoClient(mongoUrl);
                _database = mongoClient.GetDatabase(mongoUrl.DatabaseName);

                // Test the connection
                _database.RunCommand<MongoDB.Bson.BsonDocument>(new MongoDB.Bson.BsonDocument("ping", 1));
                _logger?.LogInformation("Successfully connected to MongoDB database: {DatabaseName}", mongoUrl.DatabaseName);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to connect to MongoDB");
                throw new InvalidOperationException("Failed to establish MongoDB connection", ex);
            }
        }

        // Method to get connection info (without exposing password)
        public object GetConnectionInfo()
        {
            var host = _configuration["ConnectionStrings:Host"] ?? "127.0.0.1";
            var port = _configuration["ConnectionStrings:Port"] ?? "27017";
            var databaseName = _configuration["ConnectionStrings:DatabaseName"] ?? "visioninsightBIDashboard";

            return new
            {
                Host = host,
                Port = port,
                DatabaseName = databaseName,
                Username = MongoCredentials.GetUsername(),
                AuthenticationEnabled = true
                // Password is never exposed
            };
        }
    }
}
