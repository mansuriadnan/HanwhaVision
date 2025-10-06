using HanwhaAdminApi.Application.Services.Migrations.Migratation;
using HanwhaAdminApi.Core.Interfaces;
using HanwhaAdminApi.Infrastructure.Interfaces;
using HanwhaAdminApi.Model.Common;
using HanwhaAdminApi.Model.DbEntities;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HanwhaAdminApi.Application.Services.Migrations.Migration
{
    [Migration(2025011602, "Add Country,State and City")]
    public class CountryStateCityScript : IMigration
    {
        private readonly ILogger<CountryStateCityScript> _logger;

        public CountryStateCityScript(
            ILogger<CountryStateCityScript> logger)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task RunAsync(IMongoDatabase database)
        {
            try
            {
                var userCollection = database.GetCollection<UserMaster>(AppDBConstants.UserMaster);
                var systemAdminFilter = Builders<UserMaster>.Filter.Eq(u => u.Username, "sysadmin");
                var existingSystemAdmin = await userCollection.Find(systemAdminFilter).FirstOrDefaultAsync();
                // Step 5: Insert Country, State, City data
                await InsertCountryStateCityDataAsync(database, existingSystemAdmin != null ? existingSystemAdmin.Id : null);

                _logger.LogInformation("Initial database setup completed successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during initial database setup");
                throw;
            }
        }

        private async Task InsertCountryStateCityDataAsync(IMongoDatabase database, string systemAdminUserId)
        {
            try
            {
                await CountryStateCityDataScript.InsertCountryStateCity(database, systemAdminUserId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error inserting country, state, and city data");
            }
        }
    }
}