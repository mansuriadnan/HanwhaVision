import apiUrls from "../constants/apiUrls";
import {
  apiPostService,
  apiPostServiceForWidgets,
} from "../utils/apiPostService";
import {
  apiGetService,
} from "../utils/apiGetService";
import {
  IdasboardDesignData,
  IDashboardNamePayload,
  IFeatureTypeData,
  IWidgetPayload,
  IWidgetReqForChartPayload,
  IWidgetPayloadForDevice,
  IHeatmapPayload,
} from "../interfaces/IChart";
import { Floor, IFloorPlan } from "../interfaces/IFloorAndZone";
import { apiDeleteService } from "../utils/apiDeleteService";

export const SaveDashboardDesign = (DesignData: IdasboardDesignData) =>
  apiPostService<IdasboardDesignData>({
    //url: apiUrls.SaveDashboardDesign,
    url: apiUrls.SaveDashboardName,
    data: DesignData,
  });

export const GetDashboardDesign = () =>
  apiGetService({
    url: apiUrls.GetDashboardDesign,
  });

export const SaveDashboardName = (payload: IDashboardNamePayload) =>
  apiPostService({
    url: apiUrls.SaveDashboardName,
    data: payload,
  });

export const DeleteDashboardService = (id: string) =>
  apiDeleteService({
    url: apiUrls.GetDashboardDesign,
    id: id,
  });

// export const fetchFetureTypeDataService = (payload : IFeaturTypePayload) =>
//   apiPostService<IFeatureTypeData> ({
//     url: apiUrls.CameraCountByFeatures,
//     data: payload,
//   });

export const fetchFeatureTypeDataService = (payload: IWidgetPayload) =>
  apiPostServiceForWidgets({
    url: apiUrls.CameraCountByFeatures,
    data: payload,
  });

export const fetchCameraOnlineOfflineDataService = (payload: IWidgetPayload) =>
  apiPostServiceForWidgets({
    url: apiUrls.TotalCameraCount,
    data: payload,
  });

export const fetchCapacityUtilizationpPeopleDataService = (
  payload: IWidgetPayload
) =>
  apiPostServiceForWidgets({
    url: apiUrls.PeopleCapacityUtilization,
    data: payload,
  });

export const fetchZoneWiseCapacityUtilizationpPeopleDataService = (
  payload: IWidgetPayload
) =>
  apiPostServiceForWidgets({
    url: apiUrls.PeopleCameraCapacityUtilizationAnalysisByZones,
    data: payload,
  });

export const fetchModalTypesDataService = (payload: IWidgetPayload) =>
  apiPostServiceForWidgets({
    url: apiUrls.CameraCountByModel,
    data: payload,
  });

export const fetchZoneWiseCUPDataSevice = (payload: IWidgetPayload) =>
  apiPostServiceForWidgets({
    url: apiUrls.PeopleCameraCapacityUtilizationByZones,
    data: payload,
  });

export const GetAllFloorsListService = () =>
  apiGetService<IFloorPlan[]>({
    url: apiUrls.GetFloorListByPermission,
  });

export const GetAllZonesByFloorIdService = (ids: string[]) =>
  apiPostServiceForWidgets({
    url: apiUrls.GetZonesListByFloorIdsPermission,
    data: ids,
  });

export const fetchVehicleByTypeCountDataService = (payload: IWidgetPayload) =>
  apiPostServiceForWidgets({
    url: apiUrls.VehicleByTypeCount,
    data: payload,
  });
export const fetchNewVsTotalVisitorDataService = (payload: IWidgetPayload) =>
  apiPostServiceForWidgets({
    url: apiUrls.NewVsTotalVisitorCount,
    data: payload,
  });
export const fetchAveragePeopleCountDataService = (payload: IWidgetPayload) =>
  apiPostServiceForWidgets({
    url: apiUrls.AveragePeopleCount,
    data: payload,
  });

// Vehicle Queue Analysis
export const fetchVehicleQueueAnalysisDataService = (payload: IWidgetPayload) =>
  apiPostServiceForWidgets({
    url: apiUrls.VehicleQueueAnalysis,
    data: payload,
  });

export const fetchAveragePeopleCountChartDataService = (
  payload: IWidgetPayload
) =>
  apiPostServiceForWidgets({
    url: apiUrls.AveragePeopleCountChart,
    data: payload,
  });

// Gender wise people count
export const fetchGenderWisePeopleCountDataService = (
  payload: IWidgetPayload
) =>
  apiPostServiceForWidgets({
    url: apiUrls.GenderWisePeopleCounting,
    data: payload,
  });

// Gender wise people count with time
export const fetchGenderWisePeopleCountDataWithTimeService = (
  payload: IWidgetPayload
) =>
  apiPostServiceForWidgets({
    url: apiUrls.GenderWisePeopleCountAnalysis,
    data: payload,
  });

export const peopleInOutDataService = (payload: IWidgetReqForChartPayload) =>
  apiPostServiceForWidgets({
    url: apiUrls.PeopleInOutChart,
    data: payload,
  });

export const PeopleAvgInOutDataService = (payload: IWidgetPayload) =>
  apiPostServiceForWidgets({
    url: apiUrls.AveragePeopleCountChart,
    data: payload,
  });

export const peopleVehicleInOutDataService = (payload: IWidgetPayload) =>
  apiPostServiceForWidgets({
    url: apiUrls.PeopleInOutTotal,
    data: payload,
  });

// Pedestrian Analysis
export const fetchPedestrianAnalysisDataService = (payload: IWidgetPayload) =>
  apiPostServiceForWidgets({
    url: apiUrls.PedestrianAnalysis,
    data: payload,
  });

// Slip And Fall Analysis
export const fetchSlipAndFallAnalysisDataService = (payload: IWidgetPayload) =>
  apiPostServiceForWidgets({
    url: apiUrls.SlipFallAnalysis,
    data: payload,
  });

export const fetchNewVsTotalVisitorsChartDataService = (
  payload: IWidgetPayload
) =>
  apiPostServiceForWidgets({
    url: apiUrls.NewVsTotalVisitorsChart,
    data: payload,
  });

export const fetchVehicleByTypeLineChartDataService = (
  payload: IWidgetPayload
) =>
  apiPostServiceForWidgets({
    url: apiUrls.VehicleByTypeLineChartData,
    data: payload,
  });

//Capacity Utilization for Vehicle
export const fetchCapacityUtilizationVehicleDataService = (
  payload: IWidgetPayload
) =>
  apiPostServiceForWidgets({
    url: apiUrls.VehicleCapacityUtilization,
    data: payload,
  });

export const fetchZoneWiseCapacityUtilizationVehicleDataService = (
  payload: IWidgetPayload
) =>
  apiPostServiceForWidgets({
    url: apiUrls.VehicleCameraCapacityUtilizationAnalysisByZones,
    data: payload,
  });

// Vehicle in wrong direction
export const fetchVehicleInWrongDirectionDataService = (
  payload: IWidgetPayload
) =>
  apiPostServiceForWidgets({
    url: apiUrls.WrongWayAnalysis,
    data: payload,
  });

// Vehicle U turn
export const fetchVehicleUTurnDataService = (payload: IWidgetPayload) =>
  apiPostServiceForWidgets({
    url: apiUrls.VehicleUTurnAnalysis,
    data: payload,
  });

//ZoneWiseCapacityUtilizationpVehicle
export const fetchZoneWiseCapacityUtilizationpVehicleDataService = (
  payload: IWidgetPayload
) =>
  apiPostServiceForWidgets({
    url: apiUrls.VehicleCameraCapacityUtilizationAnalysisByZones,
    data: payload,
  });

export const fetchZoneWiseCUVDataSevice = (payload: IWidgetPayload) =>
  apiPostServiceForWidgets({
    url: apiUrls.VehicleCameraCapacityUtilizationByZones,
    data: payload,
  });

export const fetchAverageVehicleCountDataService = (payload: IWidgetPayload) =>
  apiPostServiceForWidgets({
    url: apiUrls.AverageVehicleCount,
    data: payload,
  });
export const fetchAverageVehicleChartDataService = (payload: IWidgetPayload) =>
  apiPostServiceForWidgets({
    url: apiUrls.AverageVehicleCountChart,
    data: payload,
  });

// Vehicle U turn
export const fetchVehicleTurningMovementDataService = (
  payload: IWidgetPayload
) =>
  apiPostServiceForWidgets({
    url: apiUrls.VehicleTurningMovementAnalysis,
    data: payload,
  });

// Queue events for shopping cart
export const fetchShoppingCartQueueDataService = (payload: IWidgetPayload) =>
  apiPostServiceForWidgets({
    url: apiUrls.ShoppingCartQueueAnalysis,
    data: payload,
  });

// Queue events for forklift
export const fetchForkliftQueueDataService = (payload: IWidgetPayload) =>
  apiPostServiceForWidgets({
    url: apiUrls.ForkliftQueueAnalysis,
    data: payload,
  });

//Zone Wise People Counting
export const fetchZoneWisePeopleCountingDataService = (
  payload: IWidgetPayload
) =>
  apiPostServiceForWidgets({
    url: apiUrls.PeopleCountByZones,
    data: payload,
  });

//Speed Violation by Vehicle Widget
export const fetchSpeedViolationbyVehicleWidgetDataService = (
  payload: IWidgetPayload
) =>
  apiPostServiceForWidgets({
    url: apiUrls.VehicleSpeedViolationAnalysis,
    data: payload,
  });
export const fetchBlockedExitDetectionChartDataService = (
  payload: IWidgetPayload
) =>
  apiPostServiceForWidgets({
    url: apiUrls.BlockedExitDetecion,
    data: payload,
  });
export const fetchAllDeviceByZone = (payload: IWidgetPayloadForDevice) =>
  apiPostServiceForWidgets({
    url: apiUrls.GetAllDeviceData,
    data: payload,
  });

export const vehicleInOutDataService = (payload: IWidgetPayload) =>
  apiPostServiceForWidgets({
    url: apiUrls.VehicleInOutChart,
    data: payload,
  });

export const vehicleInOutDataCountService = (payload: IWidgetPayload) =>
  apiPostServiceForWidgets({
    url: apiUrls.VehicleInOutTotal,
    data: payload,
  });

export const VehicleAvgInOutDataService = (payload: IWidgetPayload) =>
  apiPostServiceForWidgets({
    url: apiUrls.AverageVehicleCountChart,
    data: payload,
  });

// Traffic Jam By Day Widget
export const fetchfetchTrafficJambyDayDataService = (payload: IWidgetPayload) =>
  apiPostServiceForWidgets({
    url: apiUrls.TrafficJamAnalysis,
    data: payload,
  });
export const fetchStoppedVehicleCountByTypeDataService = (
  payload: IWidgetPayload
) =>
  apiPostServiceForWidgets({
    url: apiUrls.StoppedVehicleCountbyType,
    data: payload,
  });

// Traffic Jam By Day Widget
export const fetchTrafficJambyDayDataService = (payload: IWidgetPayload) =>
  apiPostServiceForWidgets({
    url: apiUrls.TrafficJamAnalysis,
    data: payload,
  });
//Counting for Forklift Widget
export const fetchForkliftDataService = (payload: IWidgetPayload) =>
  apiPostServiceForWidgets({
    url: apiUrls.ForkliftCountAnalysis,
    data: payload,
  });
export const fetchPeopleQueueEventsDataService = (payload: IWidgetPayload) =>
  apiPostServiceForWidgets({
    url: apiUrls.PeopleQueueAnalysis,
    data: payload,
  });

export const getCameraListByFeaturesService = (suburl: string) =>
  apiGetService({
    url: apiUrls.MapCameraListByFeatures + suburl,
  });
export const fetchProximityForkliftsDataService = (payload: IWidgetPayload) =>
  apiPostServiceForWidgets({
    url: apiUrls.ProxomityDetectionAnalysis,
    data: payload,
  });
export const fetchSafetyMeasuresDataService = (payload: IWidgetPayload) =>
  apiPostServiceForWidgets({
    url: apiUrls.StoppedVehicleCountbyType,
    data: payload,
  });
export const fetchAllDevicesForHeatMapService = (suburl: string) =>
  apiGetService({
    url: apiUrls.HeatMapAllDevice + suburl,
  });

export const fetchAllDevicesForWidgetWiseHeatMapService = (suburl: string) =>
  apiGetService({
    url: apiUrls.WidgetWiseHeatMapAllDevice + suburl,
  });

export const fetchDevicesByFloorZoneDataService = (payload: IWidgetPayload) =>
  apiPostServiceForWidgets({
    url: apiUrls.DeviceByFloorZone,
    data: payload,
  });
export const fetchHeatmapDatabyDeviceService = (payload: IHeatmapPayload) =>
  apiPostServiceForWidgets({
    url: apiUrls.HeatmapDataByDevice,
    data: payload,
  });

//Forklift Speed Detection Widget
export const fetchForkliftSpeedDetectionDataService = (
  payload: IWidgetPayload
) =>
  apiPostServiceForWidgets({
    url: apiUrls.ForkliftSpeedDetectionAnalysis,
    data: payload,
  });

//Shopping Cart Counting Widget
export const fetchShoppingCartCountingDataService = (payload: IWidgetPayload) =>
  apiPostServiceForWidgets({
    url: apiUrls.ShoppingCartCountAnalysis,
    data: payload,
  });

// People count for map
export const fetchPeopleCountForMapDataService = (payload: IWidgetPayload) =>
  apiPostServiceForWidgets({
    url: apiUrls.PeopleCountForMap,
    data: payload,
  });

// Slip and Fall detection for map
export const fetchSlipandFallDetectionForMapDataService = (
  payload: IWidgetPayload
) =>
  apiPostServiceForWidgets({
    url: apiUrls.SlipandFallDetectionForMap,
    data: payload,
  });

// Vehicle count for map
export const fetchVehicleCountForMapDataService = (payload: IWidgetPayload) =>
  apiPostServiceForWidgets({
    url: apiUrls.VehicleCountForMap,
    data: payload,
  });

// Pedestrian Detection for map
export const fetchPedestrianDetectionForMapDataService = (
  payload: IWidgetPayload
) =>
  apiPostServiceForWidgets({
    url: apiUrls.PedestrianDetectionForMap,
    data: payload,
  });

// Vehicle Queue Management for map
export const fetchVehicleQueueManagementForMapDataService = (
  payload: IWidgetPayload
) =>
  apiPostServiceForWidgets({
    url: apiUrls.VehicleQueueManagementForMap,
    data: payload,
  });

// Vehicle Speed Detection for map
export const fetchVehicleSpeedDetectionForMapDataService = (
  payload: IWidgetPayload
) =>
  apiPostServiceForWidgets({
    url: apiUrls.VehicleSpeedDetectionForMap,
    data: payload,
  });

// Traffic Jam Detection for map
export const fetchTrafficJamDetectionForMapDataService = (
  payload: IWidgetPayload
) =>
  apiPostServiceForWidgets({
    url: apiUrls.TrafficJamDetectionForMap,
    data: payload,
  });

// Shopping CountForMap for map
export const fetchShoppingCountForMapDataService = (payload: IWidgetPayload) =>
  apiPostServiceForWidgets({
    url: apiUrls.ShoppingCountForMap,
    data: payload,
  });

// Shopping CountForMap for map
export const fetchForkliftCountForMapDataService = (payload: IWidgetPayload) =>
  apiPostServiceForWidgets({
    url: apiUrls.ForkliftCountForMap,
    data: payload,
  });
export const fetchAllFloorZonesForReportSchedulerService = () =>
  apiPostServiceForWidgets<Floor[]>({
    url: apiUrls.FloorZones,
    data: []
  });