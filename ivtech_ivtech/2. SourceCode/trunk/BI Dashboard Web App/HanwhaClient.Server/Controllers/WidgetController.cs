using HanwhaClient.Application.Interfaces;
using HanwhaClient.Core.Interfaces;
using HanwhaClient.Helper;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Infrastructure.Repository;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.Dto;
using HanwhaClient.Model.PeopleWidget;
using Microsoft.AspNetCore.Mvc;
using System.Text;

namespace HanwhaClient.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WidgetController : ControllerBase
    {
        private readonly ICurrentUserService _currentUserService;
        private readonly IWidgetService _widgetService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IDeviceEventsRepository _deviceEventsRepository;
        private readonly IQueueManagementRepository _queueManagementRepository;
        private readonly IShoppingCartCountRepository _shoppingCartCountRepository;
        private readonly IPdfGenerator _pdfGenerator;
        private readonly IForkliftCountRepository _forkliftCountRepository;

        public WidgetController(ICurrentUserService currentUserService,
            IWidgetService widgetService,
            IHttpContextAccessor httpContextAccessor,
            IDeviceEventsRepository deviceEventsRepository,
            IQueueManagementRepository queueManagementRepository,
            IPdfGenerator pdfGenerator,
            IShoppingCartCountRepository shoppingCartCountRepository,
            IForkliftCountRepository forkliftCountRepository)
        {
            _currentUserService = currentUserService;
            _widgetService = widgetService;
            _httpContextAccessor = httpContextAccessor;
            _deviceEventsRepository = deviceEventsRepository;
            _queueManagementRepository = queueManagementRepository;
            _pdfGenerator = pdfGenerator;
            _shoppingCartCountRepository = shoppingCartCountRepository;
            _forkliftCountRepository = forkliftCountRepository;
        }

        [HttpPost]
        [Route("TotalCameraCount")]
        [CustomAuthorize([ScreenNames.CameraOnlineOffline], ScreenNames.Camera)]
        public async Task<ActionResult<StandardAPIResponse<CameraCountResponse>>> GetTotalCameraCount(WidgetRequest widgetRequest)
        {
            var result = await _widgetService.GetTotalCameraCountAsync(widgetRequest.FloorIds, widgetRequest.ZoneIds);
            return StandardAPIResponse<CameraCountResponse>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("CameraCountByModel")]
        [CustomAuthorize([ScreenNames.ModalTypes], ScreenNames.Camera)]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<CameraSeriesCountResponse>>>> CameraCountByModel(WidgetRequest widgetRequest)
        {
            var result = await _widgetService.CameraCountByModelAsync(widgetRequest.FloorIds, widgetRequest.ZoneIds);
            return StandardAPIResponse<IEnumerable<CameraSeriesCountResponse>>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("CameraCountByFeatures")]
        [CustomAuthorize([ScreenNames.FeatureTypes], ScreenNames.Camera)]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<CameraFeaturesCountResponse>>>> CameraCountByFeatures(WidgetRequest widgetRequest)
        {
            var result = await _widgetService.CameraCountByFeaturesAsync(widgetRequest.FloorIds, widgetRequest.ZoneIds);
            return StandardAPIResponse<IEnumerable<CameraFeaturesCountResponse>>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("PeopleCameraCapacityUtilizationByZones")]
        [CustomAuthorize([ScreenNames.ZoneWiseCapacityUtilizationForPeople], ScreenNames.Site)]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<CameraCapacityUtilizationByZones>>>> PeopleCameraCapacityUtilizationByZones(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);
            var result = await _widgetService.PeopleCameraCapacityUtilizationByZoneAsync(widgetRequest);
            return StandardAPIResponse<IEnumerable<CameraCapacityUtilizationByZones>>.SuccessResponse(result.Item1, "", StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("PeopleCameraCapacityUtilizationAnalysisByZones")]
        [CustomAuthorize([ScreenNames.ZoneWiseCapacityUtilizationForPeople], ScreenNames.Site)]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<CameraCapacityUtilizationAnalysisByZones>>>> PeopleCameraCapacityUtilizationAnalysisByZones(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);
            var userId = _currentUserService.UserId;
            var result = await _widgetService.PeopleCameraCapacityUtilizationAnalysisByZones(widgetRequest);
            return StandardAPIResponse<IEnumerable<CameraCapacityUtilizationAnalysisByZones>>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("PeopleCapacityUtilization")]
        [CustomAuthorize([ScreenNames.CapacityUtilizationForPeople], ScreenNames.Site)]
        public async Task<ActionResult<StandardAPIResponse<CapacityUtilization>>> PeopleCapacityUtilization(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);

            var result = await _widgetService.PeopleCapacityUtilizationAsync(widgetRequest);
            return StandardAPIResponse<CapacityUtilization>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("VehicleCameraCapacityUtilizationByZones")]
        [CustomAuthorize([ScreenNames.ZoneWiseCapacityUtilizationForVehicle], ScreenNames.Site)]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<CameraCapacityUtilizationByZones>>>> VehicleCameraCapacityUtilizationByZones(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);
            var result = await _widgetService.VehicleCameraCapacityUtilizationByZoneAsync(widgetRequest);
            return StandardAPIResponse<IEnumerable<CameraCapacityUtilizationByZones>>.SuccessResponse(result.Item1, "", StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("VehicleCapacityUtilization")]
        [CustomAuthorize([ScreenNames.CapacityUtilizationForVehicle], ScreenNames.Site)]
        public async Task<ActionResult<StandardAPIResponse<CapacityUtilization>>> VehicleCapacityUtilization(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);
            var result = await _widgetService.VehicleCapacityUtilizationAsync(widgetRequest);
            return StandardAPIResponse<CapacityUtilization>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("VehicleCameraCapacityUtilizationAnalysisByZones")]
        [CustomAuthorize([ScreenNames.ZoneWiseCapacityUtilizationForVehicle], ScreenNames.Site)]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<CameraCapacityUtilizationAnalysisByZones>>>> VehicleCameraCapacityUtilizationAnalysisByZones(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);
            var result = await _widgetService.VehicleCameraCapacityUtilizationAnalysisByZones(widgetRequest);
            return StandardAPIResponse<IEnumerable<CameraCapacityUtilizationAnalysisByZones>>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("AveragePeopleCount")]
        [CustomAuthorize([ScreenNames.AveragePeopleCounting], ScreenNames.People)]
        public async Task<ActionResult<StandardAPIResponse<InOutPeopleCountAverageWidgetDto>>> AveragePeopleCount(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);

            var result = await _widgetService.AveragePeopleCountAsync(widgetRequest);
            return StandardAPIResponse<InOutPeopleCountAverageWidgetDto>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("AverageVehicleCount")]
        [CustomAuthorize([ScreenNames.AverageVehicleCounting], ScreenNames.Vehicle)]
        public async Task<ActionResult<StandardAPIResponse<InOutVehicleCountAverageWidgetDto>>> AverageVehicleCount(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);

            var result = await _widgetService.AverageVehicleCountAsync(widgetRequest);
            return StandardAPIResponse<InOutVehicleCountAverageWidgetDto>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("VehicleByTypeCount")]
        [CustomAuthorize([ScreenNames.VehicleCountByType], ScreenNames.Vehicle)]
        public async Task<ActionResult<StandardAPIResponse<VehicleByTypeCountWidgetDto>>> VehicleByTypeCount(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);
            var result = await _widgetService.VehicleByTypeCountAsync(widgetRequest);
            return StandardAPIResponse<VehicleByTypeCountWidgetDto>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("PeopleInOutTotal")]
        [CustomAuthorize([ScreenNames.PeopleInOut], ScreenNames.People)]
        public async Task<ActionResult<StandardAPIResponse<PeopleVehicleInOutTotal>>> PeopleInOutTotal(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);
            var result = await _widgetService.PeopleIOnOutTotalAsync(widgetRequest);
            return StandardAPIResponse<PeopleVehicleInOutTotal>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("VehicleInOutTotal")]
        [CustomAuthorize([ScreenNames.VehicleInOut], ScreenNames.Vehicle)]
        public async Task<ActionResult<StandardAPIResponse<PeopleVehicleInOutTotal>>> VehicleInOutTotal(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);

            var result = await _widgetService.VehicleIOnOutTotalAsync(widgetRequest);
            return StandardAPIResponse<PeopleVehicleInOutTotal>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("PeopleInOutChart")]
        [CustomAuthorize([ScreenNames.PeopleInOut], ScreenNames.People)]
        public async Task<ActionResult<StandardAPIResponse<PeopleVehicleInOutChartResponse>>> PeopleInOutChart(WidgetRequestForChart widgetRequest)
        {
            SetUserRole(widgetRequest);
            if (widgetRequest != null)
            {
                widgetRequest.FromSummary = "people";
            }
            var result = await _widgetService.PeopleIOnOutChartAsync(widgetRequest);
            return StandardAPIResponse<PeopleVehicleInOutChartResponse>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("NewVsTotalVisitorCount")]
        [CustomAuthorize([ScreenNames.NewVsTotalVisiotr], ScreenNames.People)]
        public async Task<ActionResult<StandardAPIResponse<NewVsTotalVisitorCountWidget>>> NewVsTotalVisitorCount(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);
            var result = await _widgetService.NewVsTotalVisitorCountAsync(widgetRequest);
            return StandardAPIResponse<NewVsTotalVisitorCountWidget>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("PeopleCountByZones")]
        [CustomAuthorize([ScreenNames.ZoneWisePeopleCounting], ScreenNames.People)]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<PeopleCountByZones>>>> PeopleCountByZones(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);
            var result = await _widgetService.PeopleCountByZones(widgetRequest);
            return StandardAPIResponse<IEnumerable<PeopleCountByZones>>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("VehicleQueueAnalysis")]
        [CustomAuthorize([ScreenNames.VehicleQueueAnalysis], ScreenNames.Traffic)]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<EventQueueAnalysis>>>> VehicleQueueAnalysisData(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);
            var result = await _widgetService.VehicleQueueAnalysisDataAsync(widgetRequest);
            return StandardAPIResponse<IEnumerable<EventQueueAnalysis>>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("VehicleInOutChart")]
        [CustomAuthorize([ScreenNames.VehicleInOut], ScreenNames.Vehicle)]
        public async Task<ActionResult<StandardAPIResponse<PeopleVehicleInOutChartResponse>>> VehicleInOutChart(WidgetRequestForChart widgetRequest)
        {
            SetUserRole(widgetRequest);
            if (widgetRequest != null)
            {
                widgetRequest.FromSummary = "vehicle";
            }
            var result = await _widgetService.VehicleIOnOutChartAsync(widgetRequest);
            return StandardAPIResponse<PeopleVehicleInOutChartResponse>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("ForkliftQueueAnalysis")]
        [CustomAuthorize([ScreenNames.QueueEventsForForklift], ScreenNames.Factory)]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<EventQueueAnalysis>>>> ForkliftQueueAnalysisData(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);
            var result = await _widgetService.ForkliftQueueAnalysisDataAsync(widgetRequest);
            return StandardAPIResponse<IEnumerable<EventQueueAnalysis>>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("ShoppingCartQueueAnalysis")]
        [CustomAuthorize([ScreenNames.QueueEventForShopingCart], ScreenNames.Retail)]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<EventQueueAnalysis>>>> ShoppingCartQueueAnalysisData(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);
            var result = await _widgetService.ShoppingCartQueueAnalysisDataAsync(widgetRequest);
            return StandardAPIResponse<IEnumerable<EventQueueAnalysis>>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("PeopleQueueAnalysis")]
        [CustomAuthorize([ScreenNames.QueueEventForPeple], ScreenNames.Retail)]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<EventQueueAnalysis>>>> PeopleQueueAnalysisData(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);
            var result = await _widgetService.PeopleQueueAnalysisDataAsync(widgetRequest);
            return StandardAPIResponse<IEnumerable<EventQueueAnalysis>>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("PedestrianAnalysis")]
        [CustomAuthorize([ScreenNames.PedestrianDetection], ScreenNames.Traffic)]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<EventQueueAnalysis>>>> PedestrianQueueAnalysisData(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);
            var result = await _widgetService.PedestrianQueueAnalysisDataAsync(widgetRequest);
            return StandardAPIResponse<IEnumerable<EventQueueAnalysis>>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("ProxomityDetectionAnalysis")]
        [CustomAuthorize([ScreenNames.DetectForklift], ScreenNames.Factory)]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<EventQueueAnalysis>>>> ProxomityDetectionAnalysisData(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);
            var result = await _widgetService.ProxomityDetectionAnalysisDataAsync(widgetRequest);
            return StandardAPIResponse<IEnumerable<EventQueueAnalysis>>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }


        [HttpPost]
        [Route("StoppedVehicleByTypeAnalysis")]
        [CustomAuthorize([ScreenNames.StoppedVehicleCountTime], ScreenNames.Traffic)]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<StoppedVehicleByTypeData>>>> StoppedVehicleByTypeAnalysisData(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);
            var result = await _widgetService.StoppedVehicleByTypeAnalysisDataAsync(widgetRequest);
            return StandardAPIResponse<IEnumerable<StoppedVehicleByTypeData>>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("VehicleSpeedViolationAnalysis")]
        [CustomAuthorize([ScreenNames.SpeedViolationByVehicle], ScreenNames.Traffic)]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<EventQueueAnalysis>>>> VehicleSpeedViolationAnalysisData(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);
            var result = await _widgetService.VehicleSpeedViolationAnalysisDataAsync(widgetRequest);
            return StandardAPIResponse<IEnumerable<EventQueueAnalysis>>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("TrafficJamAnalysis")]
        [CustomAuthorize([ScreenNames.TrafficJamByDay], ScreenNames.Traffic)]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<EventQueueAnalysis>>>> TrafficJamAnalysisData(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);
            var result = await _widgetService.TrafficJamAnalysisDataAsync(widgetRequest);
            return StandardAPIResponse<IEnumerable<EventQueueAnalysis>>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("SlipFallAnalysis")]
        [CustomAuthorize([ScreenNames.SlipAndFallDetection], ScreenNames.People)]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<EventQueueAnalysis>>>> SlipFallQueueAnalysisData(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);
            var result = await _widgetService.SlipFallQueueAnalysisDataAsync(widgetRequest);
            return StandardAPIResponse<IEnumerable<EventQueueAnalysis>>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("WrongWayAnalysis")]
        [CustomAuthorize([ScreenNames.VehicleInWrongDirection], ScreenNames.Traffic)]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<EventQueueAnalysis>>>> WrongWayQueueAnalysisData(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);
            var result = await _widgetService.WrongWayQueueAnalysisDataAsync(widgetRequest);
            return StandardAPIResponse<IEnumerable<EventQueueAnalysis>>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("BlockedExitAnalysis")]
        [CustomAuthorize([ScreenNames.BlockedExitDetection, ScreenNames.BlockedExitDetectionFactory], ScreenNames.Retail)]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<EventQueueAnalysis>>>> BlockedExitAnalysisData(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);
            var result = await _widgetService.BlockedExitAnalysisDataAsync(widgetRequest);
            return StandardAPIResponse<IEnumerable<EventQueueAnalysis>>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("VehicleUTurnAnalysis")]
        [CustomAuthorize([ScreenNames.VehicleUTurnDetection], ScreenNames.Traffic)]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<EventQueueAnalysis>>>> VehicleUTurnAnalysisData(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);
            var result = await _widgetService.VehicleUTurnAnalysisDataAsync(widgetRequest);
            return StandardAPIResponse<IEnumerable<EventQueueAnalysis>>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("ShoppingCartCountAnalysis")]
        [CustomAuthorize([ScreenNames.ShoppingCartCounting], ScreenNames.Retail)]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<EventQueueAnalysis>>>> ShoppingCartCountAnalysisData(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);
            var result = await _widgetService.ShoppingCartCountAnalysisData(widgetRequest);
            return StandardAPIResponse<IEnumerable<EventQueueAnalysis>>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("ForkliftCountAnalysis")]
        [CustomAuthorize([ScreenNames.CountingForForklift], ScreenNames.Factory)]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<EventQueueAnalysis>>>> ForkliftCountAnalysisData(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);
            var result = await _widgetService.ForkliftCountAnalysisDataAsync(widgetRequest);
            return StandardAPIResponse<IEnumerable<EventQueueAnalysis>>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("ForkliftSpeedDetectionAnalysis")]
        [CustomAuthorize([ScreenNames.ForkliftSpeedDetection], ScreenNames.Factory)]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<EventQueueAnalysis>>>> ForkliftSpeedDetectionAnalysisData(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);
            var result = await _widgetService.ForkliftSpeedDetectionAnalysisDataAsync(widgetRequest);
            return StandardAPIResponse<IEnumerable<EventQueueAnalysis>>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("GenderWisePeopleCountAnalysis")]
        [CustomAuthorize([ScreenNames.PeopleCountByGender], ScreenNames.People)]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<GenderWisePeopleAnalysisCount>>>> GenderWisePeopleCountAnalysisData(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);
            var result = await _widgetService.GenderWisePeopleCountAnalysisData(widgetRequest);
            return StandardAPIResponse<IEnumerable<GenderWisePeopleAnalysisCount>>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("VehicleTurningMovementAnalysis")]
        [CustomAuthorize([ScreenNames.VehicleTurningMovementCounts], ScreenNames.Traffic)]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<VehicleTurningMovementResponse>>>> VehicleTurningMovementAnalysisData(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);
            var result = await _widgetService.VehicleTurningMovementAnalysisData(widgetRequest);
            return StandardAPIResponse<IEnumerable<VehicleTurningMovementResponse>>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }

        //[HttpPost]
        //[Route("AveragePeopleCountChart")]
        //[CustomAuthorize([ScreenNames.AveragePeopleCounting], ScreenNames.People)]
        //public async Task<ActionResult<StandardAPIResponse<List<PeopleVehicleInOutAvgChart>>>> AveragePeopleCountChart(WidgetRequest widgetRequest)
        //{
        //    SetUserRole(widgetRequest);
        //    if (widgetRequest != null)
        //    {
        //        widgetRequest.FromSummary = "people";
        //        widgetRequest.IntervalMinute = 10;
        //    }

        //    var result = await _widgetService.AveragePeopleCountChartAsync(widgetRequest);
        //    return StandardAPIResponse<List<PeopleVehicleInOutAvgChart>>.SuccessResponse(result, "", StatusCodes.Status200OK);
        //}

        [HttpPost]
        [Route("AveragePeopleCountChart")]
        [CustomAuthorize([ScreenNames.AveragePeopleCounting], ScreenNames.People)]
        public async Task<ActionResult<StandardAPIResponse<List<PeopleVehicleInOutAvgChart>>>> AveragePeopleCountChart(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);
            var result = await _widgetService.PeopleInOutCountAnalysisAsync(widgetRequest);
            return StandardAPIResponse<List<PeopleVehicleInOutAvgChart>>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }


        [HttpPost]
        [Route("NewVsTotalVisitorChart")]
        [CustomAuthorize([ScreenNames.NewVsTotalVisiotr], ScreenNames.People)]
        public async Task<ActionResult<StandardAPIResponse<List<ChartAvgInOut>>>> NewVsTotalVisitorChart(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);
            var result = await _widgetService.NewVsTotalVisitorChartAsync(widgetRequest);
            return StandardAPIResponse<List<ChartAvgInOut>>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("VehicleByTypeLineChartData")]
        [CustomAuthorize([ScreenNames.VehicleCountByType], ScreenNames.Vehicle)]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<VehicleByTypeChartResponse>>>> VehicleByTypeLineChartData(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);
            var result = await _widgetService.VehicleByTypeLineChartData(widgetRequest);
            return StandardAPIResponse<IEnumerable<VehicleByTypeChartResponse>>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("GetAllDeviceData")]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<DeviceData>>>> GetAllDeviceByZone(WidgetRequestDevice widgetRequestDevice)
        {
            var user = _httpContextAccessor.HttpContext?.User;
            widgetRequestDevice.userRoles = user?.Claims.Where(x => x.Type == "role").Select(y => y.Value);
            var result = await _widgetService.GetDeviceByZone(widgetRequestDevice);

            return StandardAPIResponse<IEnumerable<DeviceData>>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }


        [HttpPost]
        [Route("AverageVehicleCountChart")]
        [CustomAuthorize([ScreenNames.AverageVehicleCounting], ScreenNames.Vehicle)]
        public async Task<ActionResult<StandardAPIResponse<List<PeopleVehicleInOutAvgChart>>>> AverageVehicleCountChart(WidgetRequestForChart widgetRequest)
        {
            SetUserRole(widgetRequest);
            if (widgetRequest != null)
            {
                widgetRequest.FromSummary = "vehicle";
            }
            //if (widgetRequest != null && widgetRequest.IntervalMinutes > 0)
            //{
            //    widgetRequest.AddMinutes = widgetRequest.IntervalMinutes;
            //}
            var result = await _widgetService.AverageVehicleCountChartAsync(widgetRequest);
            return StandardAPIResponse<List<PeopleVehicleInOutAvgChart>>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }


        [HttpPost]
        [Route("SpeedDetectionByVehicle")]
        [CustomAuthorize([ScreenNames.SpeedViolationByVehicle], ScreenNames.Traffic)]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<EventQueueAnalysis>>>> SpeedDetectionByVehicleData(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);
            var result = await _widgetService.SpeedDetectionByVehicleDataAsync(widgetRequest);
            return StandardAPIResponse<IEnumerable<EventQueueAnalysis>>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("HeatMapWidgetData")]
        [CustomAuthorize([ScreenNames.PeopleCountingHeatmap, ScreenNames.VehicleDetectionHeatmap, ScreenNames.ShopingCartHeatmap, ScreenNames.ForkliftHeatmap], ScreenNames.Vehicle)] //Which widget belogs to this method?
        public async Task<ActionResult<StandardAPIResponse<HeatmapWidgetResponse>>> HeatMapWidgetData(WidgetHeatmapRequest widgetRequest)
        {
            var result = await _widgetService.HeatMapWidgetDataAsync(widgetRequest);
            return StandardAPIResponse<HeatmapWidgetResponse>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }

        #region Camera Csv 

        [HttpPost]
        [Route("TotalCameraCount/csv")]
        [CustomAuthorize([ScreenNames.CameraOnlineOffline], ScreenNames.Camera)]
        public async Task<IActionResult> GetTotalCameraCountCsv(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);

            var csvBuilder = await _widgetService.TotalCameraCountCsv(widgetRequest);

            var bytes = Encoding.UTF8.GetBytes(csvBuilder.ToString());
            return File(bytes, "text/csv", $"{widgetRequest.WidgetName}.csv");

        }

        [HttpPost]
        [Route("CameraCountByModel/csv")]
        [CustomAuthorize([ScreenNames.ModalTypes], ScreenNames.Camera)]
        public async Task<IActionResult> CameraCountByModelCsv(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);

            var csvBuilder = await _widgetService.CameraCountByModelCsv(widgetRequest);

            var bytes = Encoding.UTF8.GetBytes(csvBuilder.ToString());
            return File(bytes, "text/csv", $"{widgetRequest.WidgetName}.csv");
        }

        [HttpPost]
        [Route("CameraCountByFeatures/csv")]
        [CustomAuthorize([ScreenNames.FeatureTypes], ScreenNames.Camera)]
        public async Task<IActionResult> CameraCountByFeaturesCsv(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);
            var csvBuilder = await _widgetService.CameraCountByFeaturesCsv(widgetRequest);
            var bytes = Encoding.UTF8.GetBytes(csvBuilder.ToString());
            return File(bytes, "text/csv", $"{widgetRequest.WidgetName}.csv");
        }

        #endregion

        #region Site Csv

        [HttpPost]
        [Route("PeopleCameraCapacityUtilizationAnalysisByZones/csv")]
        [CustomAuthorize([ScreenNames.ZoneWiseCapacityUtilizationForPeople], ScreenNames.Site)]
        public async Task<IActionResult> PeopleCameraCapacityUtilizationByZonesCsv(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);
            var csvBuilder = await _widgetService.PeopleCameraCapacityUtilizationByZonesCsv(widgetRequest);
            var bytes = Encoding.UTF8.GetBytes(csvBuilder.ToString());
            return File(bytes, "text/csv", $"{widgetRequest.WidgetName}.csv");
        }

        [HttpPost]
        [Route("PeopleCapacityUtilization/csv")]
        [CustomAuthorize([ScreenNames.CapacityUtilizationForPeople], ScreenNames.Site)]
        public async Task<IActionResult> PeopleCapacityUtilizationCsv(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);

            widgetRequest.IntervalMinute = 10;

            var csvBuilder = await _widgetService.PeopleCapacityUtilizationCsv(widgetRequest);
            var bytes = Encoding.UTF8.GetBytes(csvBuilder.ToString());
            return File(bytes, "text/csv", $"{widgetRequest.WidgetName}.csv");
        }

        [HttpPost]
        [Route("VehicleCapacityUtilization/csv")]
        [CustomAuthorize([ScreenNames.CapacityUtilizationForVehicle], ScreenNames.Site)]
        public async Task<IActionResult> VehicleCapacityUtilizationCsv(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);

            widgetRequest.IntervalMinute = 10;
            var csvBuilder = await _widgetService.VehicleCapacityUtilizationCsv(widgetRequest);
            var bytes = Encoding.UTF8.GetBytes(csvBuilder.ToString());
            return File(bytes, "text/csv", $"{widgetRequest.WidgetName}.csv");
        }

        [HttpPost]
        [Route("VehicleCameraCapacityUtilizationAnalysisByZones/csv")]
        [CustomAuthorize([ScreenNames.ZoneWiseCapacityUtilizationForVehicle], ScreenNames.Site)]
        public async Task<IActionResult> VehicleCameraCapacityUtilizationByZonesCsv(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);
            var csvBuilder = await _widgetService.VehicleCameraCapacityUtilizationByZonesCsv(widgetRequest);
            var bytes = Encoding.UTF8.GetBytes(csvBuilder.ToString());
            return File(bytes, "text/csv", $"{widgetRequest.WidgetName}.csv");
        }

        #endregion

        #region People Csv

        [HttpPost]
        [Route("PeopleInOutCountChart/csv")]
        [CustomAuthorize([ScreenNames.AveragePeopleCounting], ScreenNames.Vehicle)]
        public async Task<IActionResult> DownloadPeopleInOutCountCsv(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);
            if (widgetRequest != null)
            {
                widgetRequest.FromSummary = "people";
            }

            var csvBuilder = await _widgetService.PeopleInOutCountCSVDownload(widgetRequest);
            var bytes = Encoding.UTF8.GetBytes(csvBuilder.ToString());
            return File(bytes, "text/csv", $"{widgetRequest.WidgetName}.csv");
        }

        [HttpPost]
        [Route("AveragePeopleCountChart/csv")]
        [CustomAuthorize([ScreenNames.AverageVehicleCounting], ScreenNames.Vehicle)]
        public async Task<IActionResult> DownloadAveragePeopleCountCsv(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);
            if (widgetRequest != null)
            {
                widgetRequest.FromSummary = "people";
                widgetRequest.AverageIntervalMinute = widgetRequest.IntervalMinute;
                widgetRequest.IntervalMinute = 10;
            }

            var csvBuilder = await _widgetService.AveragePeopleCountCSVDownload(widgetRequest);
            var bytes = Encoding.UTF8.GetBytes(csvBuilder.ToString());
            return File(bytes, "text/csv", $"{widgetRequest.WidgetName}.csv");
        }


        [HttpPost]
        [Route("CumulativePeopleCountChart/csv")]
        [CustomAuthorize([ScreenNames.CumulativePeopleCount], ScreenNames.Vehicle)]
        public async Task<IActionResult> CumulativePeopleCountCsv(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);
            if (widgetRequest != null)
            {
                widgetRequest.FromSummary = "people";
                widgetRequest.AverageIntervalMinute = widgetRequest.IntervalMinute;
                widgetRequest.IntervalMinute = 10;
            }

            var csvBuilder = await _widgetService.CumulativePeopleCountCSVDownload(widgetRequest);
            var bytes = Encoding.UTF8.GetBytes(csvBuilder.ToString());
            return File(bytes, "text/csv", $"{widgetRequest.WidgetName}.csv");
        }

        [HttpPost]
        [Route("PeopleCountByZones/csv")]
        [CustomAuthorize([ScreenNames.ZoneWisePeopleCounting], ScreenNames.People)]
        public async Task<IActionResult> PeopleCountByZonesCsv(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);
            var csvBuilder = await _widgetService.PeopleCountByZonesCsv(widgetRequest);
            var bytes = Encoding.UTF8.GetBytes(csvBuilder.ToString());
            return File(bytes, "text/csv", $"{widgetRequest.WidgetName}.csv");
        }

        [HttpPost]
        [Route("NewVsTotalVisitorChart/csv")]
        [CustomAuthorize([ScreenNames.NewVsTotalVisiotr], ScreenNames.People)]
        public async Task<ActionResult<StandardAPIResponse<List<ChartAvgInOut>>>> NewVsTotalVisitorCsv(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);
            var csvBuilder = await _widgetService.NewVsTotalVisitorCsv(widgetRequest);
            var bytes = Encoding.UTF8.GetBytes(csvBuilder.ToString());
            return File(bytes, "text/csv", $"{widgetRequest.WidgetName}.csv");
        }

        [HttpPost]
        [Route("SlipFallAnalysis/csv")]
        [CustomAuthorize([ScreenNames.SlipAndFallDetection], ScreenNames.People)]
        public async Task<IActionResult> SlipFallQueueCsvData(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);

            var csvBuilder = await _widgetService.SlipFallQueueCsvDataAsync(widgetRequest);
            var bytes = Encoding.UTF8.GetBytes(csvBuilder.ToString());
            return File(bytes, "text/csv", $"{widgetRequest.WidgetName}.csv");
        }

        [HttpPost]
        [Route("GenderWisePeopleCountAnalysis/csv")]
        [CustomAuthorize([ScreenNames.PeopleCountByGender], ScreenNames.People)]
        public async Task<IActionResult> GenderWisePeopleCountAnalysisDataCsv(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);

            var csvBuilder = await _widgetService.GenderWisePeopleCountAnalysisDataCsv(widgetRequest);
            var bytes = Encoding.UTF8.GetBytes(csvBuilder.ToString());
            return File(bytes, "text/csv", $"{widgetRequest.WidgetName}.csv");
        }

        #endregion

        #region Vehicle Csv

        [HttpPost]
        [Route("VehicleInOutCountChart/csv")]
        [CustomAuthorize([ScreenNames.AverageVehicleCounting], ScreenNames.Vehicle)]
        public async Task<IActionResult> DownloadVehicleInOutCountCsv(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);
            if (widgetRequest != null)
            {
                widgetRequest.FromSummary = "vehicle";
            }
            var csvBuilder = await _widgetService.VehicleInOutCountCSVDownload(widgetRequest);
            var bytes = Encoding.UTF8.GetBytes(csvBuilder.ToString());
            return File(bytes, "text/csv", $"{widgetRequest.WidgetName}.csv");
        }

        [HttpPost]
        [Route("AverageVehicleCountChart/csv")]
        [CustomAuthorize([ScreenNames.AverageVehicleCounting], ScreenNames.Vehicle)]
        public async Task<IActionResult> DownloadAvgVehicleCountCsv(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);
            if (widgetRequest != null)
            {
                widgetRequest.FromSummary = "vehicle";
                widgetRequest.AverageIntervalMinute = widgetRequest.IntervalMinute;
                widgetRequest.IntervalMinute = 10;
            }
            var csvBuilder = await _widgetService.AvgVehicleCountCSVDownload(widgetRequest);
            var bytes = Encoding.UTF8.GetBytes(csvBuilder.ToString());
            return File(bytes, "text/csv", $"{widgetRequest.WidgetName}.csv");
        }

        [HttpPost]
        [Route("VehicleByTypeLineChartData/csv")]
        [CustomAuthorize([ScreenNames.VehicleCountByType], ScreenNames.Vehicle)]
        public async Task<IActionResult> VehicleByTypeLineChartCsv(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);
            var csvBuilder = await _widgetService.VehicleByTypeLineChartCsv(widgetRequest);
            var bytes = Encoding.UTF8.GetBytes(csvBuilder.ToString());
            return File(bytes, "text/csv", $"{widgetRequest.WidgetName}.csv");
        }

        [HttpPost]
        [Route("WrongWayAnalysis/csv")]
        [CustomAuthorize([ScreenNames.VehicleInWrongDirection], ScreenNames.Traffic)]
        public async Task<IActionResult> WrongWayQueueAnalysisCsvData(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);

            var csvBuilder = await _widgetService.WrongWayQueueAnalysisCsvData(widgetRequest);
            var bytes = Encoding.UTF8.GetBytes(csvBuilder.ToString());
            return File(bytes, "text/csv", $"{widgetRequest.WidgetName}.csv");
        }

        [HttpPost]
        [Route("VehicleUTurnAnalysis/csv")]
        [CustomAuthorize([ScreenNames.VehicleUTurnDetection], ScreenNames.Traffic)]
        public async Task<IActionResult> VehicleUTurnCsvData(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);

            var csvBuilder = await _widgetService.VehicleUTurnAnalysisCsvData(widgetRequest);
            var bytes = Encoding.UTF8.GetBytes(csvBuilder.ToString());
            return File(bytes, "text/csv", $"{widgetRequest.WidgetName}.csv");
        }

        [HttpPost]
        [Route("PedestrianAnalysis/csv")]
        [CustomAuthorize([ScreenNames.PedestrianDetection], ScreenNames.Traffic)]
        public async Task<IActionResult> PedestrianQueueAnalysisCsvData(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);

            var csvBuilder = await _widgetService.PedestrianQueueAnalysisCsvData(widgetRequest);
            var bytes = Encoding.UTF8.GetBytes(csvBuilder.ToString());
            return File(bytes, "text/csv", $"{widgetRequest.WidgetName}.csv");
        }

        [HttpPost]
        [Route("VehicleQueueAnalysis/csv")]
        [CustomAuthorize([ScreenNames.VehicleQueueAnalysis], ScreenNames.Traffic)]
        public async Task<IActionResult> VehicleQueueAnalysisCsvData(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);

            var csvBuilder = await _widgetService.VehicleQueueAnalysisCsvData(widgetRequest);
            var bytes = Encoding.UTF8.GetBytes(csvBuilder.ToString());
            return File(bytes, "text/csv", $"{widgetRequest.WidgetName}.csv");
        }

        [HttpPost]
        [Route("StoppedVehicleByTypeAnalysis/csv")]
        [CustomAuthorize([ScreenNames.StoppedVehicleCountTime], ScreenNames.Traffic)]
        public async Task<IActionResult> StoppedVehicleByTypeAnalysisCsvData(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);

            var csvBuilder = await _widgetService.StoppedVehicleByTypeAnalysisCsvData(widgetRequest);
            var bytes = Encoding.UTF8.GetBytes(csvBuilder.ToString());
            return File(bytes, "text/csv", $"{widgetRequest.WidgetName}.csv");
        }

        [HttpPost]
        [Route("VehicleTurningMovementAnalysis/csv")]
        [CustomAuthorize([ScreenNames.VehicleTurningMovementCounts], ScreenNames.Traffic)]
        public async Task<IActionResult> VehicleTurningMovementAnalysisCsvData(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);

            var csvBuilder = await _widgetService.VehicleTurningMovementAnalysisCsvData(widgetRequest);
            var bytes = Encoding.UTF8.GetBytes(csvBuilder.ToString());
            return File(bytes, "text/csv", $"{widgetRequest.WidgetName}.csv");
        }

        [HttpPost]
        [Route("VehicleSpeedViolationAnalysis/csv")]
        [CustomAuthorize([ScreenNames.SpeedViolationByVehicle], ScreenNames.Traffic)]
        public async Task<IActionResult> VehicleSpeedViolationAnalysisCsvData(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);

            var csvBuilder = await _widgetService.VehicleSpeedViolationAnalysisCsvData(widgetRequest);
            var bytes = Encoding.UTF8.GetBytes(csvBuilder.ToString());
            return File(bytes, "text/csv", $"{widgetRequest.WidgetName}.csv");

        }

        [HttpPost]
        [Route("TrafficJamAnalysis/csv")]
        [CustomAuthorize([ScreenNames.TrafficJamByDay], ScreenNames.Traffic)]
        public async Task<IActionResult> TrafficJamAnalysisCsvData(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);

            var csvBuilder = await _widgetService.TrafficJamAnalysisCsvData(widgetRequest);
            var bytes = Encoding.UTF8.GetBytes(csvBuilder.ToString());
            return File(bytes, "text/csv", $"{widgetRequest.WidgetName}.csv");

        }

        #endregion

        #region Retail Csv

        [HttpPost]
        [Route("ShoppingCartQueueAnalysis/csv")]
        [CustomAuthorize([ScreenNames.QueueEventForShopingCart], ScreenNames.Retail)]
        public async Task<IActionResult> ShoppingCartQueueAnalysisCsvData(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);
            var csvBuilder = await _widgetService.ShoppingCartQueueAnalysisCsvData(widgetRequest);
            var bytes = Encoding.UTF8.GetBytes(csvBuilder.ToString());
            return File(bytes, "text/csv", $"{widgetRequest.WidgetName}.csv");
        }

        [HttpPost]
        [Route("ShoppingCartCountAnalysis/csv")]
        [CustomAuthorize([ScreenNames.ShoppingCartCounting], ScreenNames.Retail)]
        public async Task<IActionResult> ShoppingCartCountAnalysisCsvData(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);
            var csvBuilder = await _widgetService.ShoppingCartCountAnalysisCsvData(widgetRequest);
            var bytes = Encoding.UTF8.GetBytes(csvBuilder.ToString());
            return File(bytes, "text/csv", $"{widgetRequest.WidgetName}.csv");
        }

        //Queue Event For People
        [HttpPost]
        [Route("PeopleQueueAnalysis/csv")]
        [CustomAuthorize([ScreenNames.QueueEventForPeple], ScreenNames.Retail)]
        public async Task<IActionResult> PeopleQueueAnalysisCsvData(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);
            var csvBuilder = await _widgetService.PeopleQueueAnalysisCsvData(widgetRequest);
            var bytes = Encoding.UTF8.GetBytes(csvBuilder.ToString());
            return File(bytes, "text/csv", $"{widgetRequest.WidgetName}.csv");
        }
        //Blocked Exit Detection
        [HttpPost]
        [Route("BlockedExitAnalysis/csv")]
        [CustomAuthorize([ScreenNames.BlockedExitDetection], ScreenNames.Retail)]
        public async Task<IActionResult> BlockedExitAnalysisCsvData(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);
            var csvBuilder = await _widgetService.BlockedExitAnalysisCsvData(widgetRequest);
            var bytes = Encoding.UTF8.GetBytes(csvBuilder.ToString());
            return File(bytes, "text/csv", $"{widgetRequest.WidgetName}.csv");
        }
        #endregion

        #region Factory Csv

        [HttpPost]
        [Route("ForkliftCountAnalysis/csv")]
        [CustomAuthorize([ScreenNames.CountingForForklift], ScreenNames.Factory)]
        public async Task<IActionResult> ForkliftCountAnalysisCsvData(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);

            var csvBuilder = await _widgetService.ForkliftCountAnalysisCsvData(widgetRequest);
            var bytes = Encoding.UTF8.GetBytes(csvBuilder.ToString());
            return File(bytes, "text/csv", $"{widgetRequest.WidgetName}.csv");
        }

        [HttpPost]
        [Route("ForkliftQueueAnalysis/csv")]
        [CustomAuthorize([ScreenNames.QueueEventsForForklift], ScreenNames.Factory)]
        public async Task<IActionResult> ForkliftQueueAnalysisCsvData(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);

            var csvBuilder = await _widgetService.ForkliftQueueAnalysisCsvData(widgetRequest);
            var bytes = Encoding.UTF8.GetBytes(csvBuilder.ToString());
            return File(bytes, "text/csv", $"{widgetRequest.WidgetName}.csv");
        }


        [HttpPost]
        [Route("ProxomityDetectionAnalysis/csv")]
        [CustomAuthorize([ScreenNames.QueueEventsForForklift], ScreenNames.Factory)]
        public async Task<IActionResult> ProxomityDetectionAnalysisCsvData(WidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);

            var csvBuilder = await _widgetService.ProxomityDetectionAnalysisCsvData(widgetRequest);
            var bytes = Encoding.UTF8.GetBytes(csvBuilder.ToString());
            return File(bytes, "text/csv", $"{widgetRequest.WidgetName}.csv");
        }

        #endregion


        #region Map Floor Plan

        [HttpPost]
        [Route("PeopleCountingmap")]
        [CustomAuthorize([ScreenNames.FloorPlan, ScreenNames.MapPlan], ScreenNames.MapFloorPlan)]
        public async Task<ActionResult<StandardAPIResponse<PeopleVehicleInOutTotal>>> PeopleCountForMap(MapWidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);
            var result = await _widgetService.PeopleCountForMapAsync(widgetRequest);
            return StandardAPIResponse<PeopleVehicleInOutTotal>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("SlipandFallDetectionForMap")]
        [CustomAuthorize([ScreenNames.FloorPlan, ScreenNames.MapPlan], ScreenNames.MapFloorPlan)]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<EventQueueAnalysis>>>> SlipandFallDetectionForMap(MapWidgetRequest widgetRequest)
        {
            IEnumerable<EventQueueAnalysis> result = await _deviceEventsRepository.SlipFallQueueAnalysisDataAsync(widgetRequest.DeviceId, widgetRequest.StartDate, widgetRequest.EndDate, (int)widgetRequest.Channel, 10);
            return StandardAPIResponse<IEnumerable<EventQueueAnalysis>>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("PedestrianDetectionForMap")]
        [CustomAuthorize([ScreenNames.FloorPlan, ScreenNames.MapPlan], ScreenNames.MapFloorPlan)]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<EventQueueAnalysis>>>> PedestrianDetectionForMap(MapWidgetRequest widgetRequest)
        {
            IEnumerable<EventQueueAnalysis> result = await _deviceEventsRepository.PedestrianQueueAnalysisDataAsync(widgetRequest.DeviceId, widgetRequest.StartDate, widgetRequest.EndDate, (int)widgetRequest.Channel, 10);
            return StandardAPIResponse<IEnumerable<EventQueueAnalysis>>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("VehicleQueueManagementForMap")]
        [CustomAuthorize([ScreenNames.FloorPlan, ScreenNames.MapPlan], ScreenNames.MapFloorPlan)]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<EventQueueAnalysis>>>> VehicleQueueManagementForMap(MapWidgetRequest widgetRequest)
        {
            IEnumerable<EventQueueAnalysis> result = await _queueManagementRepository.VehicleQueueAnalysisDataAsync(widgetRequest.DeviceId, widgetRequest.StartDate, widgetRequest.EndDate, (int)widgetRequest.Channel, 10);
            return StandardAPIResponse<IEnumerable<EventQueueAnalysis>>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("VehicleSpeedDetectionForMap")]
        [CustomAuthorize([ScreenNames.FloorPlan, ScreenNames.MapPlan], ScreenNames.MapFloorPlan)]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<EventQueueAnalysis>>>> VehicleSpeedDetectionForMap(MapWidgetRequest widgetRequest)
        {
            IEnumerable<EventQueueAnalysis> result = await _deviceEventsRepository.VehicleSpeedViolationAnalysisDataAsync(widgetRequest.DeviceId, widgetRequest.StartDate, widgetRequest.EndDate, (int)widgetRequest.Channel, 10);
            return StandardAPIResponse<IEnumerable<EventQueueAnalysis>>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("TrafficJamDetectionForMap")]
        [CustomAuthorize([ScreenNames.FloorPlan, ScreenNames.MapPlan], ScreenNames.MapFloorPlan)]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<EventQueueAnalysis>>>> TrafficJamDetectionForMap(MapWidgetRequest widgetRequest)
        {
            IEnumerable<EventQueueAnalysis> result = await _deviceEventsRepository.TrafficJamAnalysisDataAsync(widgetRequest.DeviceId, widgetRequest.StartDate, widgetRequest.EndDate, (int)widgetRequest.Channel, 10);
            return StandardAPIResponse<IEnumerable<EventQueueAnalysis>>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("VehicleCountForMap")]
        [CustomAuthorize([ScreenNames.FloorPlan, ScreenNames.MapPlan], ScreenNames.MapFloorPlan)]
        public async Task<ActionResult<StandardAPIResponse<PeopleVehicleInOutTotal>>> VehicleCountForMap(MapWidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);
            var result = await _widgetService.VehicleCountForMapAsync(widgetRequest);
            return StandardAPIResponse<PeopleVehicleInOutTotal>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("ShoppingCountForMap")]
        [CustomAuthorize([ScreenNames.FloorPlan, ScreenNames.MapPlan], ScreenNames.MapFloorPlan)]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<EventQueueAnalysis>>>> ShoppingCountForMap(MapWidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);
            var result = await _shoppingCartCountRepository.ShoppingCartCountAnalysisData(widgetRequest.DeviceId, widgetRequest.StartDate, widgetRequest.EndDate, (int)widgetRequest.Channel, 10);
            return StandardAPIResponse<IEnumerable<EventQueueAnalysis>>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("ForkliftCountForMap")]
        [CustomAuthorize([ScreenNames.FloorPlan, ScreenNames.MapPlan], ScreenNames.MapFloorPlan)]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<EventQueueAnalysis>>>> ForkliftCountForMap(MapWidgetRequest widgetRequest)
        {
            SetUserRole(widgetRequest);
            var result = await _forkliftCountRepository.ForkliftCountAnalysisDataAsync(widgetRequest.DeviceId, widgetRequest.StartDate, widgetRequest.EndDate, (int)widgetRequest.Channel, 10);
            return StandardAPIResponse<IEnumerable<EventQueueAnalysis>>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }

        #endregion

        [HttpPost]
        [Route("DownloadMultipleWidgetsCsv")]
        [CustomAuthorize([ScreenNames.CanDownloadCSVReports], ScreenNames.AdvanceExportReportMaster)]
        public async Task<IActionResult> DownloadMultipleWidgetsCsv([FromBody] WidgetRequest widgetRequest)
        {
            string fileName = "Dashboard_Widgets_" + DateTime.Now.ToString("dd_MM_yyyy") + ".csv";
            if (widgetRequest == null)
            {
                var blankBytes = Encoding.UTF8.GetBytes("");
                return File(blankBytes, "text/csv", "Blank_" + fileName);
            }
            SetUserRole(widgetRequest);
            var combinedCsv = await _widgetService.DownloadMultipleWidgetsCsvAsync(widgetRequest);

            var bytes = Encoding.UTF8.GetBytes(combinedCsv.ToString());
            return File(bytes, "text/csv", fileName);
        }

        private async Task<StringBuilder?> GetCsvForWidgetAsync(string widgetName, WidgetRequest request)
        {
            return widgetName switch
            {
                "PeopleCountByZones" => await _widgetService.PeopleCountByZonesCsv(request),
                "PeopleCapacityUtilization" => await _widgetService.PeopleCapacityUtilizationCsv(request),
                "PeopleCameraCapacityUtilizationAnalysisByZones" => await _widgetService.PeopleCameraCapacityUtilizationByZonesCsv(request),
                "SlipFallAnalysis" => await _widgetService.SlipFallQueueCsvDataAsync(request),
                "GenderWisePeopleCountAnalysis" => await _widgetService.GenderWisePeopleCountAnalysisDataCsv(request),
                "VehicleCapacityUtilization" => await _widgetService.VehicleCapacityUtilizationCsv(request),
                "VehicleCameraCapacityUtilizationAnalysisByZones" => await _widgetService.VehicleCameraCapacityUtilizationByZonesCsv(request),
                "VehicleByTypeLineChartData" => await _widgetService.VehicleByTypeLineChartCsv(request),
                "WrongWayAnalysis" => await _widgetService.WrongWayQueueAnalysisCsvData(request),
                "VehicleUTurnAnalysis" => await _widgetService.VehicleUTurnAnalysisCsvData(request),
                "PedestrianAnalysis" => await _widgetService.PedestrianQueueAnalysisCsvData(request),
                "VehicleQueueAnalysis" => await _widgetService.VehicleQueueAnalysisCsvData(request),
                "StoppedVehicleByTypeAnalysis" => await _widgetService.StoppedVehicleByTypeAnalysisCsvData(request),
                "VehicleTurningMovementAnalysis" => await _widgetService.VehicleTurningMovementAnalysisCsvData(request),
                "VehicleSpeedViolationAnalysis" => await _widgetService.VehicleSpeedViolationAnalysisCsvData(request),
                "TrafficJamAnalysis" => await _widgetService.TrafficJamAnalysisCsvData(request),
                "TotalCameraCount" => await _widgetService.TotalCameraCountCsv(request),
                "CameraCountByModel" => await _widgetService.CameraCountByModelCsv(request),
                "CameraCountByFeatures" => await _widgetService.CameraCountByFeaturesCsv(request),
                "ShoppingCartQueueAnalysis" => await _widgetService.ShoppingCartQueueAnalysisCsvData(request),
                "ShoppingCartCountAnalysis" => await _widgetService.ShoppingCartCountAnalysisCsvData(request),
                "PeopleQueueAnalysis" => await _widgetService.PeopleQueueAnalysisCsvData(request),
                "BlockedExitAnalysis" => await _widgetService.BlockedExitAnalysisCsvData(request),
                "ForkliftCountAnalysis" => await _widgetService.ForkliftCountAnalysisCsvData(request),
                "ForkliftQueueAnalysis" => await _widgetService.ForkliftQueueAnalysisCsvData(request),
                "ProxomityDetectionAnalysis" => await _widgetService.ProxomityDetectionAnalysisCsvData(request),

                // Default case: return null if widget is unknown
                _ => null
            };
        }


        [HttpPost]
        [Route("GeneratePDF")]
        [CustomAuthorize([ScreenNames.CanDownloadPDFReports], ScreenNames.AdvanceExportReportMaster)]
        //public async Task<ActionResult> GeneratePDF(GeneratePdfDataRequest generatePdfDataRequest)
        //{
        //    var htmlPath = Path.Combine(Directory.GetCurrentDirectory(), "Assets/Template/PdfTemplate.html");
        //    var htmlContent = System.IO.File.ReadAllText(htmlPath);
        //    htmlContent += "<h3>Date Time Range : " + generatePdfDataRequest.StartDate + " - " + generatePdfDataRequest.EndDate + "</h3>";
        //    foreach (var svgData in generatePdfDataRequest.SVGData)
        //    {
        //        htmlContent += "<h1>" + svgData.WidgetName + "</h1>";
        //        htmlContent += svgData.SVGData;
        //    }
        //    var pdf = await _pdfGenerator.GeneratePdfFromHtml(htmlContent);
        //    return File(pdf, "application/pdf", "SampleReport.pdf");
        //}


        private void SetUserRole(WidgetRequest widgetRequest)
        {
            var user = _httpContextAccessor.HttpContext?.User;
            widgetRequest.userRoles = user?.Claims.Where(x => x.Type == "role").Select(y => y.Value);
            widgetRequest.UserId = _currentUserService.UserId;
        }
    }
}
