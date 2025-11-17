using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Model.Common
{
    public static class WidgetCsvDisplayName
    {
        public static readonly Dictionary<string, string> widgetMapping = new()
        {
            { "TotalCameraCount", "Camera Online/Offline" },
            { "CameraCountByModel", "Modal Types" },
            { "CameraCountByFeatures", "Feature Types" },
            { "PeopleCapacityUtilization", "Capacity Utilization for People" },
            { "VehicleCapacityUtilization", "Capacity Utilization for Vehicle" },
            { "VehicleCameraCapacityUtilizationAnalysisByZones", "Zone Wise Capacity Utilization for Vehicle" },
            { "PeopleCameraCapacityUtilizationAnalysisByZones", "Zone Wise Capacity Utilization for People" },
            { "SlipFallAnalysis", "Slip & Fall Detection" },
            { "PeopleCountChart", "People" },
            { "AveragePeopleCountChart", "Average People Counting" },
            { "GenderWisePeopleCountAnalysis", "Gender" },
            { "CumulativePeopleCountChart", "Cumulative People Count" },
            { "NewVsTotalVisitorChart", "New vs Total Visitors" },
            { "SafetyMeasuresStoppedVehicleByTypeAnalysis", "Safety Measures" },
            { "PeopleCountByZones", "Zone wise People Counting" },
            { "VehicleByType", "Vehicle by Type" },
            { "WrongWayAnalysis", "Vehicle in Wrong Direction" },
            { "VehicleUTurnAnalysis", "Vehicle U Turn detection" },
            { "PedestrianAnalysis", "Pedestrian Detection" },
            { "VehicleCountChart", "Vehicle" },
            { "AverageVehicleCountChart", "Average Vehicle Counting" },
            { "VehicleQueueAnalysis", "Vehicle Queue Analysis" },
            { "StoppedVehicleByTypeAnalysis", "Stopped Vehicle Count Time" },
            { "VehicleTurningMovementAnalysis", "Vehicle Turning Movement counts" },
            { "ShoppingCartQueueAnalysis", "Shopping Cart Counting" },
            { "ShoppingCartCountAnalysis", "Queue events for shopping cart" },
            { "PeopleQueueAnalysis", "Queue events for people" },
            { "VehicleSpeedViolationAnalysis", "Speed Violation by Vehicle" },
            { "BlockedExitAnalysis", "Blocked exit detection" },
            { "TrafficJamAnalysis", "Traffic Jam by Day" },
            { "ForkliftCountAnalysis", "Counting for forklift" },
            { "ForkliftQueueAnalysis", "Queue events for forklift" },
            { "FactoryBlockedExitAnalysis", "Factory Blocked exit detection" },
            { "ProxomityDetectionAnalysis", "Detect Forklifts" },
            { "ForkliftSpeedDetection", "Forklift Speed Detection" }
        };
        
    }
}
