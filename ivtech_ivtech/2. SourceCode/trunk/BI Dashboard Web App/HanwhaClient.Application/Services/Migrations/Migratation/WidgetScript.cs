using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Infrastructure.Repository;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.DbEntities;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Application.Services.Migrations.Migratation
{
    public class WidgetScript
    {
        public async Task RunAsync(IMongoDatabase database)
        {
            var widgetMasterCollection = database.GetCollection<WidgetMaster>(AppDBConstants.WidgetMaster);

            // Get all widget masters (categories with their widgets) from the setup
            var allWidgetMastersFromSetup = WidgetMasterList.GetAllWidgets();

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
                            System.Console.WriteLine($"Updated category '{existingWidgetMaster.CategoryName}' with {newWidgetsToAdd.Count} new widgets.");
                        }
                        else
                        {
                            System.Console.WriteLine($"Category '{existingWidgetMaster.CategoryName}' already up-to-date. No new widgets to add.");
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
        }
    }

}
