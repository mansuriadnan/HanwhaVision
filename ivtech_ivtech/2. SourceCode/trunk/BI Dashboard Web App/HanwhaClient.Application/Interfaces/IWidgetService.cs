using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.Dto;
using HanwhaClient.Model.PeopleWidget;
using System.ComponentModel;
using System.Text;

namespace HanwhaClient.Application.Interfaces
{
    public interface IWidgetService
    {
        Task<CameraCountResponse> GetTotalCameraCountAsync(IEnumerable<string> floorId, IEnumerable<string>? zoneId);
        Task<IEnumerable<CameraSeriesCountResponse>> CameraCountByModelAsync(IEnumerable<string> floorId, IEnumerable<string>? zoneId);
        Task<IEnumerable<CameraFeaturesCountResponse>> CameraCountByFeaturesAsync(IEnumerable<string> floorId, IEnumerable<string>? zoneId);
        Task<(IEnumerable<CameraCapacityUtilizationByZones>, UtilizationMostLeastDay)> PeopleCameraCapacityUtilizationByZoneAsync(WidgetRequest widgetRequest);
        Task<CapacityUtilization> PeopleCapacityUtilizationAsync(WidgetRequest widgetRequest);
        
        Task<(IEnumerable<CameraCapacityUtilizationByZones>, UtilizationMostLeastDay)> VehicleCameraCapacityUtilizationByZoneAsync(WidgetRequest widgetRequest);
        Task<CapacityUtilization> VehicleCapacityUtilizationAsync(WidgetRequest widgetRequest);
        Task<InOutPeopleCountAverageWidgetDto> AveragePeopleCountAsync(WidgetRequest widgetRequest);
        Task<List<PeopleVehicleInOutAvgChart>> AveragePeopleCountChartAsync(WidgetRequest widgetRequest);
        Task<List<PeopleVehicleInOutAvgChart>> PeopleInOutCountAnalysisAsync(WidgetRequest widgetRequest);
        Task<InOutVehicleCountAverageWidgetDto> AverageVehicleCountAsync(WidgetRequest widgetRequest);
        Task<VehicleByTypeCountWidgetDto> VehicleByTypeCountAsync(WidgetRequest widgetRequest);
        Task<PeopleVehicleInOutTotal> PeopleIOnOutTotalAsync(WidgetRequest widgetRequest);
        Task<PeopleVehicleInOutTotal> VehicleIOnOutTotalAsync(WidgetRequest widgetRequest);
        Task<PeopleVehicleInOutChartResponse> PeopleIOnOutChartAsync(WidgetRequestForChart widgetRequest);
        Task<IEnumerable<PeopleCountByZones>> PeopleCountByZones(WidgetRequest widgetRequest);
        
        Task<IEnumerable<EventQueueAnalysis>> VehicleQueueAnalysisDataAsync(WidgetRequest widgetRequest);
        Task<IEnumerable<EventQueueAnalysis>> ForkliftQueueAnalysisDataAsync(WidgetRequest widgetRequest);
        Task<IEnumerable<EventQueueAnalysis>> ShoppingCartQueueAnalysisDataAsync(WidgetRequest widgetRequest);
        Task<IEnumerable<EventQueueAnalysis>> PeopleQueueAnalysisDataAsync(WidgetRequest widgetRequest);
        Task<IEnumerable<EventQueueAnalysis>> PedestrianQueueAnalysisDataAsync(WidgetRequest widgetRequest);
        Task<IEnumerable<EventQueueAnalysis>> ProxomityDetectionAnalysisDataAsync(WidgetRequest widgetRequest);
        Task<IEnumerable<StoppedVehicleByTypeData>> StoppedVehicleByTypeAnalysisDataAsync(WidgetRequest widgetRequest);
        Task<IEnumerable<EventQueueAnalysis>> VehicleSpeedViolationAnalysisDataAsync(WidgetRequest widgetRequest);
        Task<IEnumerable<EventQueueAnalysis>> TrafficJamAnalysisDataAsync(WidgetRequest widgetRequest);
        Task<IEnumerable<EventQueueAnalysis>> SlipFallQueueAnalysisDataAsync(WidgetRequest widgetRequest);
        
        Task<IEnumerable<EventQueueAnalysis>> WrongWayQueueAnalysisDataAsync(WidgetRequest widgetRequest);
        Task<IEnumerable<EventQueueAnalysis>> BlockedExitAnalysisDataAsync(WidgetRequest widgetRequest);
        Task<IEnumerable<EventQueueAnalysis>> VehicleUTurnAnalysisDataAsync(WidgetRequest widgetRequest);
        Task<IEnumerable<EventQueueAnalysis>> ShoppingCartCountAnalysisData(WidgetRequest widgetRequest);
        Task<IEnumerable<EventQueueAnalysis>> ForkliftCountAnalysisDataAsync(WidgetRequest widgetRequest);
        Task<IEnumerable<EventQueueAnalysis>> ForkliftSpeedDetectionAnalysisDataAsync(WidgetRequest widgetRequest);
        Task<IEnumerable<GenderWisePeopleAnalysisCount>> GenderWisePeopleCountAnalysisData(WidgetRequest widgetRequest);
        Task<IEnumerable<VehicleTurningMovementResponse>> VehicleTurningMovementAnalysisData(WidgetRequest widgetRequest);
        Task<NewVsTotalVisitorCountWidget> NewVsTotalVisitorCountAsync(WidgetRequest widgetRequest);
        Task<PeopleVehicleInOutChartResponse> VehicleIOnOutChartAsync(WidgetRequestForChart widgetRequest);
        Task<IEnumerable<CameraCapacityUtilizationAnalysisByZones>> PeopleCameraCapacityUtilizationAnalysisByZones(WidgetRequest widgetRequest);
        Task<IEnumerable<CameraCapacityUtilizationAnalysisByZones>> VehicleCameraCapacityUtilizationAnalysisByZones(WidgetRequest widgetRequest);
        Task<List<ChartAvgInOut>> NewVsTotalVisitorChartAsync(WidgetRequest widgetRequest);
        Task<IEnumerable<VehicleByTypeChartResponse>> VehicleByTypeLineChartData(WidgetRequest widgetRequest);
        Task<IEnumerable<DeviceData>> GetDeviceByZone(WidgetRequestDevice widgetRequestDevice);
        Task<List<PeopleVehicleInOutAvgChart>> AverageVehicleCountChartAsync(WidgetRequestForChart widgetRequest);
        Task<IEnumerable<EventQueueAnalysis>> SpeedDetectionByVehicleDataAsync(WidgetRequest widgetRequest);
        Task<StringBuilder> AveragePeopleCountCSVDownload(WidgetRequest widgetRequest);
        Task<StringBuilder> CumulativePeopleCountCSVDownload(WidgetRequest widgetRequest);
        Task<StringBuilder> PeopleInOutCountCSVDownload(WidgetRequest widgetRequest);
        Task<StringBuilder> AvgVehicleCountCSVDownload(WidgetRequest widgetRequest);
        Task<StringBuilder> VehicleInOutCountCSVDownload(WidgetRequest widgetRequest);
        Task<HeatmapWidgetResponse> HeatMapWidgetDataAsync(WidgetHeatmapRequest widgetRequest);
        Task<PeopleVehicleInOutTotal> PeopleCountForMapAsync(MapWidgetRequest widgetRequest);
        Task<PeopleVehicleInOutTotal> VehicleCountForMapAsync(MapWidgetRequest widgetRequest);
        Task<StringBuilder> SlipFallQueueCsvDataAsync(WidgetRequest widgetRequest);
        Task<StringBuilder> PeopleCountByZonesCsv(WidgetRequest widgetRequest);
        Task<StringBuilder> TotalCameraCountCsv(WidgetRequest widgetRequest);
        Task<StringBuilder> CameraCountByModelCsv(WidgetRequest widgetRequest);
        Task<StringBuilder> CameraCountByFeaturesCsv(WidgetRequest widgetRequest);
        Task<StringBuilder> PeopleCapacityUtilizationCsv(WidgetRequest widgetRequest);
        Task<StringBuilder> VehicleCapacityUtilizationCsv(WidgetRequest widgetRequest);
        Task<StringBuilder> GenderWisePeopleCountAnalysisDataCsv(WidgetRequest widgetRequest);
        Task<StringBuilder> PeopleCameraCapacityUtilizationByZonesCsv(WidgetRequest widgetRequest);
        Task<StringBuilder> VehicleCameraCapacityUtilizationByZonesCsv(WidgetRequest widgetRequest);
        Task<StringBuilder> VehicleByTypeLineChartCsv(WidgetRequest widgetRequest);
        Task<StringBuilder> NewVsTotalVisitorCsv(WidgetRequest widgetRequest);
        Task<StringBuilder> WrongWayQueueAnalysisCsvData(WidgetRequest widgetRequest);
        Task<StringBuilder> VehicleUTurnAnalysisCsvData(WidgetRequest widgetRequest);
        Task<StringBuilder> PedestrianQueueAnalysisCsvData(WidgetRequest widgetRequest);
        Task<StringBuilder> VehicleQueueAnalysisCsvData(WidgetRequest widgetRequest);
        Task<StringBuilder> StoppedVehicleByTypeAnalysisCsvData(WidgetRequest widgetRequest);
        Task<StringBuilder> VehicleTurningMovementAnalysisCsvData(WidgetRequest widgetRequest);
        Task<StringBuilder> ShoppingCartQueueAnalysisCsvData(WidgetRequest widgetRequest);
        Task<StringBuilder> ShoppingCartCountAnalysisCsvData(WidgetRequest widgetRequest);
        Task<StringBuilder> PeopleQueueAnalysisCsvData(WidgetRequest widgetRequest);
        Task<StringBuilder> BlockedExitAnalysisCsvData(WidgetRequest widgetRequest);
        Task<StringBuilder> VehicleSpeedViolationAnalysisCsvData(WidgetRequest widgetRequest);
        Task<StringBuilder> TrafficJamAnalysisCsvData(WidgetRequest widgetRequest);
        Task<StringBuilder> ForkliftCountAnalysisCsvData(WidgetRequest widgetRequest);
        Task<StringBuilder> ForkliftQueueAnalysisCsvData(WidgetRequest widgetRequest);
        Task<StringBuilder> ProxomityDetectionAnalysisCsvData(WidgetRequest widgetRequest);
        Task<PeopleVehicleInOutTotal> PeopleIOnOutTotalForReportAsync(DateTime startdate, DateTime enddate);
        Task<PeopleVehicleInOutTotal> VehicleInOutTotalForReportAsync(DateTime startdate, DateTime enddate);
        Task<StringBuilder> DownloadMultipleWidgetsCsvAsync(WidgetRequest widgetRequest);
    }
}
