using HanwhaAdminApi.Infrastructure.Connection;
using HanwhaAdminApi.Infrastructure.Interfaces;
using HanwhaAdminApi.Model.Common;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Reflection;

namespace HanwhaAdminApi.Application.Services.Migrations
{
    public class MigrationRunner
    {
        private readonly IMongoDatabase _database;
        private readonly IServiceProvider _serviceProvider;

        public MigrationRunner(MongoDbConnectionService mongoDbConnectionService, IServiceProvider serviceProvider)
        {
            _database = mongoDbConnectionService.Database ?? throw new ArgumentNullException(nameof(mongoDbConnectionService));
            _serviceProvider = serviceProvider;
        }

        public async Task RunMigrationsAsync(long? targetVersion = null)
        {
            Console.WriteLine("Starting migration process...");

            var migrationHistoryCollection = _database.GetCollection<BsonDocument>(AppDBConstants.MigrationHistory);

            // Get already applied migrations
            var appliedMigrations = await migrationHistoryCollection
                .Find(new BsonDocument())
                .SortBy(m => m["Version"])
                .ToListAsync();

            var appliedVersions = appliedMigrations.Select(m => m["Version"].AsInt64).ToHashSet();

            // Find all migrations
            var migrationTypes = Assembly.GetExecutingAssembly()
                .GetTypes()
                .Where(t => t.GetCustomAttribute<MigrationAttribute>() != null)
                .OrderBy(t => t.GetCustomAttribute<MigrationAttribute>().Version);

            //foreach (var migrationType in migrationTypes)
            //{
            //    var migrationAttribute = migrationType.GetCustomAttribute<MigrationAttribute>();

            //    // Skip migrations already applied
            //    if (appliedVersions.Contains(Convert.ToInt64(targetVersion)))
            //    {
            //        Console.WriteLine($"Migration {migrationAttribute.Version} ({migrationAttribute.Description}) same version applied. break.");
            //        break;
            //    }

            //    if (appliedVersions.Contains(migrationAttribute.Version))
            //    {
            //        Console.WriteLine($"Migration {migrationAttribute.Version} ({migrationAttribute.Description}) already applied. Skipping.");
            //        continue;
            //    }

            //    // Skip migrations beyond the target version
            //    if (targetVersion.HasValue && migrationAttribute.Version > targetVersion.Value)
            //    {
            //        Console.WriteLine($"Skipping migration {migrationAttribute.Version} ({migrationAttribute.Description}) as it exceeds the target version.");
            //        continue;
            //    }

            //    // Run the migration
            //    Console.WriteLine($"Applying migration {migrationAttribute.Version} ({migrationAttribute.Description})...");
            //    var migrationInstance = Activator.CreateInstance(migrationType) as IMigration;
            //    await migrationInstance?.RunAsync(_database);

            //    // Record the migration
            //    var migrationRecord = new BsonDocument
            //        {
            //            { "Version", migrationAttribute.Version },
            //            { "Description", migrationAttribute.Description },
            //            { "AppliedOn", DateTime.UtcNow }
            //        };
            //    await migrationHistoryCollection.InsertOneAsync(migrationRecord);
            //    Console.WriteLine($"Migration {migrationAttribute.Version} applied successfully.");
            //}

            foreach (var migrationType in migrationTypes)
            {
                IMigration? migrationInstance;
                var migrationAttribute = migrationType.GetCustomAttribute<MigrationAttribute>();

                // Check if the migration has a constructor with parameters
                var constructor = migrationType.GetConstructors()
                    .FirstOrDefault(c => c.GetParameters().Length > 0);

                if (constructor != null)
                {
                    // Resolve dependencies dynamically for constructors with parameters
                    var parameters = constructor.GetParameters()
                        .Select(p => _serviceProvider.GetService(p.ParameterType))
                        .ToArray();

                    migrationInstance = Activator.CreateInstance(migrationType, parameters) as IMigration;
                }
                else
                {
                    // Use parameterless constructor
                    migrationInstance = Activator.CreateInstance(migrationType) as IMigration;
                }

                if (appliedVersions.Contains(Convert.ToInt64(targetVersion)))
                {
                    Console.WriteLine($"Migration {migrationAttribute.Version} ({migrationAttribute.Description}) same version applied. break.");
                    break;
                }

                if (appliedVersions.Contains(migrationAttribute.Version))
                {
                    Console.WriteLine($"Migration {migrationAttribute.Version} ({migrationAttribute.Description}) already applied. Skipping.");
                    continue;
                }

                if (targetVersion.HasValue && migrationAttribute.Version > targetVersion.Value)
                {
                    Console.WriteLine($"Skipping migration {migrationAttribute.Version} ({migrationAttribute.Description}) as it exceeds the target version.");
                    continue;
                }

                if (migrationInstance != null)
                {
                    Console.WriteLine($"Running migration: {migrationType.Name}");
                    await migrationInstance.RunAsync(_database);
                }
                else
                {
                    Console.WriteLine($"Could not create an instance of migration: {migrationType.Name}");
                }

                var migrationRecord = new BsonDocument
                        {
                            { "Version", migrationAttribute.Version },
                            { "Description", migrationAttribute.Description },
                            { "AppliedOn", DateTime.UtcNow }
                        };
                await migrationHistoryCollection.InsertOneAsync(migrationRecord);
                Console.WriteLine($"Migration {migrationAttribute.Version} applied successfully.");
            }

            Console.WriteLine("Migration process completed.");
        }
    }
}
