using HanwhaClient.Model.DbEntities;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Model.Common
{
    public static class WidgetMasterList
    {

        // The method now returns a list of WidgetMaster objects
        public static List<WidgetMaster> GetAllWidgets()
        {
            // The list of categories from your image
            var categories = new List<string>
                            {
                                ScreenNames.Camera,
                                ScreenNames.Site,
                                ScreenNames.People,
                                ScreenNames.Retail,
                                ScreenNames.Vehicle,
                                ScreenNames.Factory,
                                ScreenNames.MapFloorPlan,
                                ScreenNames.AdvanceExportReportMaster,
                            };

            var allWidgetMasters = new List<WidgetMaster>();

            foreach (var categoryName in categories)
            {
                var widgetsForThisCategory = new List<WidgetItem>();

                // --- Populate widgets based on the category ---

                switch (categoryName)
                {
                    case "Camera":
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.CameraOnlineOffline });
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.ModalTypes });
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.FeatureTypes });
                        break;

                    case "Site":
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.CapacityUtilizationForPeople });
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.ZoneWiseCapacityUtilizationForPeople });
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.CapacityUtilizationForVehicle });
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.ZoneWiseCapacityUtilizationForVehicle });
                        break;

                    case "People":
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.PeopleInOut });
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.AveragePeopleCounting });
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.PeopleCountByGender });
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.CumulativePeopleCount });
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.NewVsTotalVisiotr });
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.SafetyMeasure });
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.ZoneWisePeopleCounting });
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.SlipAndFallDetection });
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.PeopleCountingHeatmap });
                        break;

                    case "Retail":
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.ShoppingCartCounting });
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.QueueEventForShopingCart });
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.QueueEventForPeple });
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.ShopingCartHeatmap });
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.BlockedExitDetection });
                        break;

                    case "Vehicle":
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.VehicleCountByType });
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.VehicleInWrongDirection });
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.VehicleUTurnDetection });
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.PedestrianDetection });
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.VehicleInOut });
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.AverageVehicleCounting });
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.VehicleQueueAnalysis });
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.StoppedVehicleCountTime });
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.VehicleTurningMovementCounts });
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.VehicleDetectionHeatmap });
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.SpeedViolationByVehicle });
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.TrafficJamByDay });
                        break;

                    case "Factory":
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.CountingForForklift });
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.QueueEventsForForklift });
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.BlockedExitDetectionFactory });
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.DetectForklift });
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.ForkliftHeatmap });
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.ForkliftSpeedDetection });
                        break;

                    case "Map Floor Plan":
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.MapPlan });
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.FloorPlan });
                        break;

                    case "Advance Export Report":
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.CanDownloadPDFReports });
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.CanDownloadCSVReports });
                        break;

                    default:
                        // Fallback for any other unhandled category, though all from your list are covered
                        widgetsForThisCategory.Add(new WidgetItem
                        {
                            WidgetId = ObjectId.GenerateNewId().ToString(),
                            WidgetName = $"Generic {categoryName} Widget"
                        });
                        break;
                }

                // If a category must have at least one widget, and the switch doesn't add one,
                if (widgetsForThisCategory.Count == 0)
                {
                    widgetsForThisCategory.Add(new WidgetItem
                    {
                        WidgetId = ObjectId.GenerateNewId().ToString(),
                        WidgetName = $"Placeholder for {categoryName}"
                    });
                }


                var widgetMaster = new WidgetMaster
                {
                    CategoryName = categoryName,
                    Widgets = widgetsForThisCategory
                };
                allWidgetMasters.Add(widgetMaster);
            }

            return allWidgetMasters;
        }


        public static List<WidgetMaster> GetAllTrafficWidgets(string userId)
        {
            // The list of categories from your image
            var categories = new List<string>
                            {
                                ScreenNames.Traffic,
                            };

            var allWidgetMasters = new List<WidgetMaster>();

            foreach (var categoryName in categories)
            {
                var widgetsForThisCategory = new List<WidgetItem>();

                // --- Populate widgets based on the category ---

                switch (categoryName)
                {
                    case "Traffic":
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.VehicleInWrongDirection });
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.VehicleUTurnDetection });
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.PedestrianDetection });
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.VehicleQueueAnalysis });
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.StoppedVehicleCountTime });
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.VehicleTurningMovementCounts });
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.SpeedViolationByVehicle });
                        widgetsForThisCategory.Add(new WidgetItem { WidgetId = ObjectId.GenerateNewId().ToString(), WidgetName = ScreenNames.TrafficJamByDay });
                        break;

                    default:
                        // Fallback for any other unhandled category, though all from your list are covered
                        widgetsForThisCategory.Add(new WidgetItem
                        {
                            WidgetId = ObjectId.GenerateNewId().ToString(),
                            WidgetName = $"Generic {categoryName} Widget"
                        });
                        break;
                }

                // If a category must have at least one widget, and the switch doesn't add one,
                if (widgetsForThisCategory.Count == 0)
                {
                    widgetsForThisCategory.Add(new WidgetItem
                    {
                        WidgetId = ObjectId.GenerateNewId().ToString(),
                        WidgetName = $"Placeholder for {categoryName}"
                    });
                }


                var widgetMaster = new WidgetMaster
                {
                    CategoryName = categoryName,
                    Widgets = widgetsForThisCategory
                };
                allWidgetMasters.Add(widgetMaster);
            }

            return allWidgetMasters;
        }

    }
}
