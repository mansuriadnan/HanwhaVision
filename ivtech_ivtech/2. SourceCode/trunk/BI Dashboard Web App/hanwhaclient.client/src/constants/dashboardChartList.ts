import { LABELS } from "../utils/constants";

export const dashboardCharts = [
  {
    id: 1,
    chartName: "Camera Online/Offline", // -- need to call camera count
    type: "Camera",
    permission: LABELS.CameraOnlineOffline
  },
  {
    id: 2,
    chartName: "Model Types",
    type: "Camera",
    permission: LABELS.ModelTypes
  },
  {
    id: 3,
    chartName: "Feature Types",
    type: "Camera",
    permission: LABELS.FeatureTypes
  },
  {
    id: 4,
    chartName: "Capacity Utilization for People",
    type: "Site",
    permission: LABELS.CapacityUtilizationForPeople
  },
  {
    id: 5,
    chartName: "Capacity Utilization for Vehicle",
    type: "Site",
    permission: LABELS.CapacityUtilizationForVehicle
  },
  {
    id: 6,
    chartName: "Zone Wise Capacity Utilization for Vehicle",
    type: "Site",
    permission: LABELS.ZoneWiseCapacityUtilizationForVehicle
  },

  {
    id: 7,
    chartName: "Zone Wise Capacity Utilization for People",
    type: "Site",
    permission: LABELS.ZoneWiseCapacityUtilizationForPeople
  },

  {
    id: 8,
    chartName: "Slip & Fall Detection", //-- need to call SlipAndFallChart
    type: "People",
    permission: LABELS.SlipAndFallDetection
  },

  {
    id: 9,
    chartName: "People",
    type: "People",
    permission: LABELS.PeopleInOut
  },
  {
    id: 10,
    chartName: "Average People Counting",
    type: "People",
    permission: LABELS.AveragePeopleCounting
  },
  {
    id: 11,
    chartName: "Gender",
    type: "People",
    permission: LABELS.PeopleCountByGender
  },

  {
    id: 12,
    chartName: "Cumulative People Count",
    type: "People",
    permission: LABELS.CumulativePeopleCount
  },

  {
    id: 13,
    chartName: "New vs Total Visitors",
    type: "People",
    permission: LABELS.NewVsTotalVisiotr
  },

  {
    id: 14,
    chartName: "Safety Measures",
    type: "People",
    permission: LABELS.SafetyMeasure
  },

  {
    id: 15,
    chartName: "Zone wise People Counting",
    type: "People",
    permission: LABELS.ZoneWisePeopleCounting
  },

  {
    id: 16,
    chartName: "Vehicle by Type",
    type: "Vehicle",
    permission: LABELS.VehicleCountByType
  },

  {
    id: 17,
    chartName: "Vehicle in Wrong Direction",
    type: "Traffic",
    permission: LABELS.VehicleInWrongDirection
  },

  {
    id: 18,
    chartName: "Vehicle U Turn detection",
    type: "Traffic",
    permission: LABELS.VehicleUTurnDetection
  },

  {
    id: 19,
    chartName: "Pedestrian Detection",
    type: "Traffic",
    permission: LABELS.PedestrianDetection
  },

  {
    id: 20,
    chartName: "Vehicle",
    type: "Vehicle",
    permission: LABELS.VehicleCountByType
  },

  {
    id: 21,
    chartName: "Average Vehicle Counting",
    type: "Vehicle",
    permission: LABELS.AverageVehicleCounting
  },

  {
    id: 22,
    chartName: "Vehicle Queue Analysis",
    type: "Traffic",
    permission: LABELS.VehicleQueueAnalysis
  },

  {
    id: 23,
    chartName: "Stopped Vehicle Count Time",
    type: "Traffic",
    permission: LABELS.StoppedVehicleCountTime
  },

  {
    id: 24,
    chartName: "Vehicle Turning Movement counts",
    type: "Traffic",
    permission: LABELS.VehicleTurningMovementCounts
  },


  {
    id: 25,
    chartName: "Shopping Cart Counting",
    type: "Retail",
    permission: LABELS.ShoppingCartCounting
  },


  {
    id: 26,
    chartName: "Queue events for shopping cart",
    type: "Retail",
    permission: LABELS.QueueEventForShopingCart
  },

  {
    id: 27,
    chartName: "Queue events for people",
    type: "Retail",
    permission: LABELS.QueueEventForPeple
  },


  {
    id: 28,
    chartName: "Speed Violation by Vehicle",
    type: "Traffic",
    permission: LABELS.SpeedViolationByVehicle
  },

  {
    id: 29,
    chartName: "Blocked exit detection",
    type: "Retail",
    permission: LABELS.BlockedExitDetection
  },

  {
    id: 30,
    chartName: "Traffic Jam by Day",
    type: "Traffic",
    permission: LABELS.TrafficJamByDay
  },

  {
    id: 31,
    chartName: "Counting for forklift",
    type: "Factory",
    permission: LABELS.CountingForForklift
  },

  {
    id: 32,
    chartName: "Queue events for forklift",
    type: "Factory",
    permission: LABELS.QueueEventsForForklift
  },

  {
    id: 33,
    chartName: "Factory Blocked exit detection",
    type: "Factory",
    permission: LABELS.BlockedExitDetectionFactory
  },

  {
    id: 34,
    chartName: "Detect Forklifts",
    type: "Factory",
    permission: LABELS.DetectForklift
  },

  {
    id: 35,
    chartName: "Shopping Cart Heatmap",
    type: "Retail",
    permission: LABELS.ShopingCartHeatmap
  },

  {
    id: 36,
    chartName: "Vehicle Detection Heatmap",
    type: "Vehicle",
    permission: LABELS.VehicleDetectionHeatmap
  },

  {
    id: 37,
    chartName: "Forklift Heatmap",
    type: "Factory",
    permission: LABELS.ForkliftHeatmap
  },
  {
    id: 38,
    chartName: "Map Plan",
    type: "Map Plan",
    permission: LABELS.MapPlan
  },
  {
    id: 39,
    chartName: "Floor Plan",
    type: "Floor Plan",
    permission: LABELS.FloorPlan
  },
  {
    id: 40,
    chartName: "Forklift Speed Detection",
    type: "Factory",
    permission: LABELS.ForkliftSpeedDetection
  },
  {
    id: 41,
    chartName: "People Counting Heatmap",
    type: "People",
    permission: LABELS.PeopleCountingHeatmap
  },
];

export const dashboardChartsType = [
  {
    id: 1,
    type: "All",
    // permission: LABELS.CameraOnlineOffline
  },
  {
    id: 2,
    type: "Camera",
    permission: LABELS.Camera
  },
  {
    id: 3,
    type: "Site",
    permission: LABELS.Site
  },
  {
    id: 4,
    type: "People",
    permission: LABELS.People
  },
  {
    id: 5,
    type: "Retail",
    permission: LABELS.Retail
  },
  {
    id: 6,
    type: "Vehicle",
    permission: LABELS.Vehicle
  },
  {
    id: 7,
    type: "Traffic",
    permission: LABELS.Traffic
  },
  {
    id: 8,
    type: "Factory",
    permission: LABELS.Factory
  },
  {
    id: 9,
    type: "Map Plan",
    permission: LABELS.MapFloorPlan
  },
  {
    id: 10,
    type: "Floor Plan",
    permission: LABELS.MapFloorPlan
  },
];

export const dashboardChartOptions = [
  { id: "1", title: "Camera Online/Offline" },
  { id: "2", title: "Model Types" },
  { id: "3", title: "Feature Types" },
  { id: "4", title: "Capacity Utilization for People" },
  { id: "5", title: "Capacity Utilization for Vehicle" },
  { id: "6", title: "Zone Wise Capacity Utilization for Vehicle" },
  { id: "7", title: "Zone Wise Capacity Utilization for People" },
  { id: "8", title: "Slip & Fall Detection" },
  { id: "9", title: "People" },
  { id: "10", title: "Average People Counting" },
  { id: "11", title: "Gender" },
  { id: "12", title: "Cumulative People Count" },
  { id: "13", title: "New vs Total Visitors" },
  { id: "14", title: "Safety Measures" },
  { id: "15", title: "Zone wise People Counting" },
  { id: "16", title: "Vehicle by Type" },
  { id: "17", title: "Vehicle in Wrong Direction" },
  { id: "18", title: "Vehicle U Turn detection" },
  { id: "19", title: "Pedestrian Detection" },
  { id: "20", title: "Vehicle" },
  { id: "21", title: "Average Vehicle Counting" },
  { id: "22", title: "Vehicle Queue Analysis" },
  { id: "23", title: "Stopped Vehicle Count Time" },
  { id: "24", title: "Vehicle Turning Movement counts" },
  { id: "25", title: "Shopping Cart Counting" },
  { id: "26", title: "Queue events for shopping cart" },
  { id: "27", title: "Queue events for people" },
  { id: "28", title: "Speed Violation by Vehicle" },
  { id: "29", title: "Blocked exit detection" },
  { id: "30", title: "Traffic Jam by Day" },
  { id: "31", title: "Counting for forklift" },
  { id: "32", title: "Queue events for forklift" },
  { id: "33", title: "Factory Blocked exit detection" },
  { id: "34", title: "Detect Forklifts" },
  { id: "40", title: "Forklift Speed Detection" }
];
