using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Infrastructure.Connection
{
    public static class MongoCredentials
    {
        // Store your credentials securely (Base64 encoded)
        // Replace these with your actual encoded credentials
        private static readonly string EncodedUsername = Convert.ToBase64String(Encoding.UTF8.GetBytes("dbuser"));
        private static readonly string EncodedPassword = Convert.ToBase64String(Encoding.UTF8.GetBytes("DbPassword123!"));

        public static string GetUsername()
        {
            return Encoding.UTF8.GetString(Convert.FromBase64String(EncodedUsername));
        }

        public static string GetPassword()
        {
            return Encoding.UTF8.GetString(Convert.FromBase64String(EncodedPassword));
        }

        // Method to build secure connection string
        public static string BuildConnectionString(string host, string port, string databaseName)
        {
            var username = GetUsername();
            var password = GetPassword();
            return $"mongodb://{username}:{password}@{host}:{port}/{databaseName}";
        }

        // Alternative method to build connection string with MongoUrl
        public static MongoUrl BuildMongoUrl(string host, string port, string databaseName)
        {
            var connectionString = BuildConnectionString(host, port, databaseName);
            return MongoUrl.Create(connectionString);
        }
    }
}
