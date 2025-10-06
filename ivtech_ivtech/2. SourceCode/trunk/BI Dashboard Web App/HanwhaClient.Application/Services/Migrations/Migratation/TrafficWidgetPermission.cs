using HanwhaClient.Core.Interfaces;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.DbEntities;
using MongoDB.Bson;
using MongoDB.Driver;

namespace HanwhaClient.Application.Services.Migrations.Migratation
{
    [Migration(2025011602, "Inserting Traffic Widget Permission data into the widget and screen mapping tables during application execution.")]
    public class TrafficWidgetPermission : IMigration
    {
        private readonly IRoleRepository _roleRepository;
        private readonly IUsersRepository _usersRepository;

        public TrafficWidgetPermission(IRoleRepository roleRepository, IUsersRepository usersRepository)
        {
            _roleRepository = roleRepository;
            _usersRepository = usersRepository;
        }

        public async Task RunAsync(IMongoDatabase database)
        {
            var screenCollection = database.GetCollection<ScreenMaster>(AppDBConstants.ScreenMaster);
            var mappingCollection = database.GetCollection<RoleScreenMapping>(AppDBConstants.RoleScreenMapping);
            var widgetMasterCollection = database.GetCollection<WidgetMaster>(AppDBConstants.WidgetMaster);

            var resultRoles = await _roleRepository.GetRoleIdByRoleName("Super Admin");
            var resultUsers = await _usersRepository.GetUserByUsernameAsync("superadmin");

            #region Add Widget

            // Get all widget masters (categories with their widgets) from the setup
            var allWidgetMastersFromSetup = WidgetMasterList.GetAllTrafficWidgets(resultUsers.Id);

            if (allWidgetMastersFromSetup == null || !allWidgetMastersFromSetup.Any())
            {
                // Optional: Log that no widgets were found in setup
                System.Console.WriteLine("No widgets found in setup. Nothing to process.");
                return;
            }

            foreach (var currentWidgetMasterFromSetup in allWidgetMastersFromSetup)
            {
                if (currentWidgetMasterFromSetup == null || string.IsNullOrEmpty(currentWidgetMasterFromSetup.CategoryName))
                {
                    // Optional: Log or handle invalid WidgetMaster from setup
                    System.Console.WriteLine("Skipping an invalid WidgetMaster (null or no CategoryName) from setup.");
                    continue;
                }

                // Get the vehicle CategoryName
                var existingVehicleMaster = await widgetMasterCollection
                                                .Find(wm => wm.CategoryName == "Vehicle")
                                                .FirstOrDefaultAsync();

                if (existingVehicleMaster != null)
                {
                    // Example: match specific widget names
                    var targetWidgetNames = new[] { ScreenNames.VehicleInWrongDirection, ScreenNames.VehicleUTurnDetection, ScreenNames.PedestrianDetection, ScreenNames.VehicleQueueAnalysis, ScreenNames.StoppedVehicleCountTime, ScreenNames.VehicleTurningMovementCounts, ScreenNames.SpeedViolationByVehicle, ScreenNames.TrafficJamByDay };

                    // Collect all WidgetIds where WidgetName matches
                    var matchingWidgetIds = existingVehicleMaster.Widgets
                                                .Where(w => targetWidgetNames.Contains(w.WidgetName))
                                                .Select(w => w.WidgetId)
                                                .ToList();




                    // Find all RoleScreenMapping docs where WidgetIds contain any of these
                    var filter = Builders<RoleScreenMapping>.Filter
                        .ElemMatch(rsm => rsm.WidgetAccessPermissions,
                            wap => wap.WidgetIds.Any(id => matchingWidgetIds.Contains(id)));

                    var roleScreenMappings = await mappingCollection.Find(filter).ToListAsync();

                    if (roleScreenMappings.Any())
                    {
                        foreach (var mapping in roleScreenMappings)
                        {
                            foreach (var permission in mapping.WidgetAccessPermissions)
                            {
                                // Remove matching ids
                                permission.WidgetIds = permission.WidgetIds
                                    .Where(id => !matchingWidgetIds.Contains(id))
                                    .ToList();
                            }

                            // Update back into DB
                            var updateFilter = Builders<RoleScreenMapping>.Filter.Eq(x => x.Id, mapping.Id);
                            await mappingCollection.ReplaceOneAsync(updateFilter, mapping);
                        }
                    }

                    // Step 4: Remove widgets from WidgetMaster itself
                    var updateWidgetMaster = Builders<WidgetMaster>.Update
                        .PullFilter(wm => wm.Widgets, w => targetWidgetNames.Contains(w.WidgetName));

                    await widgetMasterCollection.UpdateOneAsync(
                        Builders<WidgetMaster>.Filter.Eq(wm => wm.Id, existingVehicleMaster.Id),
                        updateWidgetMaster
                    );
                }


                // Try to find an existing WidgetMaster in the database by its CategoryName
                var existingWidgetMaster = await widgetMasterCollection
                                                .Find(wm => wm.CategoryName == currentWidgetMasterFromSetup.CategoryName)
                                                .FirstOrDefaultAsync();

                if (existingWidgetMaster != null)
                {
                    // Category exists, check for new widgets to add
                    if (currentWidgetMasterFromSetup.Widgets != null && currentWidgetMasterFromSetup.Widgets.Any())
                    {
                        // Ensure existingWidgetMaster.Widgets is not null
                        if (existingWidgetMaster.Widgets == null)
                        {
                            existingWidgetMaster.Widgets = new List<WidgetItem>();
                        }

                        // Filter out widgets from the setup that already exist in the database for this category (by WidgetName)
                        var newWidgetsToAdd = currentWidgetMasterFromSetup.Widgets.Where(newWidget =>
                                            !existingWidgetMaster.Widgets
                                                .Any(existingWidget => existingWidget.WidgetName == newWidget.WidgetName))
                                            .ToList();

                        if (newWidgetsToAdd.Any())
                        {
                            // Add the new widgets to the existing category's widget list
                            existingWidgetMaster.Widgets = existingWidgetMaster.Widgets.Concat(newWidgetsToAdd).ToList();

                            // Replace the existing document in the database with the updated one
                            // This requires WidgetMaster to have an Id property mapped to MongoDB's _id
                            await widgetMasterCollection.ReplaceOneAsync(
                                wm => wm.Id == existingWidgetMaster.Id, // Match by the document's unique Id
                                existingWidgetMaster);
                        }
                    }
                }
                else
                {
                    // Category does not exist, insert the new WidgetMaster from setup
                    // Ensure the Id is not set or is null if MongoDB is to generate it,
                    // or ensure it's a new valid ObjectId string if you generate it client-side.
                    // For this example, we assume MongoDB will generate the _id if currentWidgetMasterFromSetup.Id is null.
                    await widgetMasterCollection.InsertOneAsync(currentWidgetMasterFromSetup);
                }
            }
            // Step 7: Create Widget Permission 
            await InsertRoleScreenMappingFromWidgetsAsync(widgetMasterCollection, mappingCollection, resultRoles);

            #endregion


        }


        private async Task InsertRoleScreenMappingFromWidgetsAsync(
      IMongoCollection<WidgetMaster> widgetMasterCollection,
      IMongoCollection<RoleScreenMapping> roleScreenMappingCollection,
      string roleId)
        {
            // Step 1: Get all WidgetMaster records
            var widgetMasters = await widgetMasterCollection.Find(_ => true).ToListAsync();

            // Step 2: Transform WidgetMaster -> WidgetAccessPermission
            var widgetAccessPermissions = widgetMasters
                .Where(w => w.Widgets != null && w.Widgets.Any())
                .Select(w => new WidgetAccessPermission
                {
                    WidgetCategoryId = w.Id,
                    WidgetIds = w.Widgets.Select(widget => widget.WidgetId)
                })
                .ToList();

            // Step 3: Update the existing RoleScreenMapping for the given roleId
            var update = Builders<RoleScreenMapping>.Update
                .Set(x => x.WidgetAccessPermissions, widgetAccessPermissions);

            var filter = Builders<RoleScreenMapping>.Filter
                .Eq(x => x.RoleId, roleId);

            var result = await roleScreenMappingCollection.UpdateOneAsync(filter, update);

            // Optional: handle case where document doesn't exist
            if (result.MatchedCount == 0)
            {
                // Optionally create a new one (if you want upsert)
                var roleScreenMapping = new RoleScreenMapping
                {
                    RoleId = roleId,
                    WidgetAccessPermissions = widgetAccessPermissions
                };
                await roleScreenMappingCollection.InsertOneAsync(roleScreenMapping);
            }
        }


    }
}
