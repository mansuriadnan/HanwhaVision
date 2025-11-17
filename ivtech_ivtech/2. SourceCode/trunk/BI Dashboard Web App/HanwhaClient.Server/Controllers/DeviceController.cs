using HanwhaClient.Application.Interfaces;
using HanwhaClient.Helper;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.DeviceApiResponse;
using HanwhaClient.Model.Dto;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;


namespace HanwhaClient.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DeviceController : ControllerBase
    {
        private readonly IDeviceMasterService _deviceMasterService;
        private readonly ICurrentUserService _currentUserService;
        private readonly IDeviceApiService _deviceApiService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public DeviceController(IDeviceMasterService cameraMasterService, ICurrentUserService currentUserService, IDeviceApiService deviceApiService, IHttpContextAccessor httpContextAccessor)
        {
            this._deviceMasterService = cameraMasterService;
            this._currentUserService = currentUserService;
            this._deviceApiService = deviceApiService;
            this._httpContextAccessor = httpContextAccessor;
        }

        [HttpPost]
        [Route("")]
        [CustomAuthorize([ScreenNames.AddOrUpdateDevices])]
        public async Task<ActionResult<StandardAPIResponse<bool>>> AddUpdateDevice(DeviceRequestDto deviceRequestDto)
        {
            var userId = _currentUserService.UserId;
            var result = await _deviceMasterService.AddUpdateDevices(deviceRequestDto, userId);
            if (result.isSuccess)
            {
                return StandardAPIResponse<bool>.SuccessResponse(result.isSuccess, string.IsNullOrEmpty(deviceRequestDto.Id) ? AppMessageConstants.RecordAdded : AppMessageConstants.RecordUpdated, StatusCodes.Status200OK);
            }
            return StandardAPIResponse<bool>.ErrorResponse(result.isSuccess, result.ErrorMessage, StatusCodes.Status400BadRequest);
        }

        [HttpPost]
        [Route("GetAllDevices")]
        [CustomAuthorize([ScreenNames.ViewListofDevices])]
        public async Task<ActionResult<StandardAPIResponse<DeviceResponse>>> AllDevicesAsync(DeviceRequest deviceRequest)
        {
            var data = await _deviceMasterService.GetAllDevicesByFilterAsync(deviceRequest);
            if (data.DeviceDetails.Count() > 0)
            {
                return StandardAPIResponse<DeviceResponse>.SuccessResponse(data, "", StatusCodes.Status200OK);
            }
            return StandardAPIResponse<DeviceResponse>.SuccessResponse(null, AppMessageConstants.RecordNotFound, StatusCodes.Status404NotFound);
        }

        [HttpPost]
        [Route("DeleteDevices")]
        [CustomAuthorize([ScreenNames.DeleteDevices])]
        public async Task<ActionResult<StandardAPIResponse<long>>> DeleteDevicesAsync(IEnumerable<string> id)
        {
            var userId = _currentUserService.UserId;
            var data = await _deviceMasterService.DeleteDevicesAsync(id, userId);
            return StandardAPIResponse<long>.SuccessResponse(data, AppMessageConstants.RecordDeleted);
        }

        [HttpGet]
        [Route("GetDevicesWithoutZones")]
        [CustomAuthorize([ScreenNames.DeviceMaster, ScreenNames.ConfigureFloorPlanZoneMapCamera])]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<DevicesWithoutZonesResponseDto>>>> GetDevicesWithoutZones()
        {
            var data = await _deviceMasterService.GetDevicesWithoutZones();
            if (data.Count() > 0)
            {
                return StandardAPIResponse<IEnumerable<DevicesWithoutZonesResponseDto>>.SuccessResponse(data, "", StatusCodes.Status200OK);
            }
            return StandardAPIResponse<IEnumerable<DevicesWithoutZonesResponseDto>>.SuccessResponse(null, AppMessageConstants.RecordNotFound, StatusCodes.Status404NotFound);
        }

        [HttpGet]
        [Route("DeviceApiCall")]
        public async Task<ActionResult<StandardAPIResponse<dynamic>>> DeviceApiCall(string Url, string userName, string password)
        {
            var data = await _deviceApiService.CallDeviceApi<ObjectCountingLiveResponse>(Url, userName, password);
            return StandardAPIResponse<dynamic>.SuccessResponse("", "", StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("GetAllChannels")]
        [CustomAuthorize([ScreenNames.AddOrUpdateDevices])]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<AllChannelsResDto>>>> GetAllChannels(AllChannelsReqDto dto)
        {
            var data = await _deviceMasterService.GetAllChannels(dto);
            if (data.Count() > 0)
            {
                return StandardAPIResponse<IEnumerable<AllChannelsResDto>>.SuccessResponse(data, "", StatusCodes.Status200OK);
            }
            return StandardAPIResponse<IEnumerable<AllChannelsResDto>>.SuccessResponse(null, AppMessageConstants.RecordNotFound, StatusCodes.Status404NotFound);
        }
        [HttpPost]
        [Route("GetDeviceEventsLogs")]
        [CustomAuthorize([ScreenNames.ViewListofEvents])]
        public async Task<ActionResult<StandardAPIResponse<DeviceEventsLogsRes>>> GetDeviceEventsLogs([FromBody] DeviceEventsLogsRequest request)
        {
            var user = _httpContextAccessor.HttpContext?.User;
            IEnumerable<string>? userRoles = user?.Claims.Where(x => x.Type == "role").Select(y => y.Value);
            var data = await _deviceMasterService.GetDeviceEventsLogsAsync1(request, userRoles);
            if (data.EventsLogsDetails.Count() > 0)
            {
                return StandardAPIResponse<DeviceEventsLogsRes>.SuccessResponse(data, "", StatusCodes.Status200OK);
            }
            return StandardAPIResponse<DeviceEventsLogsRes>.SuccessResponse(null, AppMessageConstants.RecordNotFound, StatusCodes.Status404NotFound);

        }

        [HttpPost]
        [Route("UpdateDeviceEventsStatus")]
        [CustomAuthorize([ScreenNames.AcknowledgeEvent, ScreenNames.AcknowledgeNotification])]
        public async Task<ActionResult<StandardAPIResponse<bool>>> UpdateDeviceEventsStatus(DeviceChangeStatusRequest deviceChangeStatusRequest)
        {
            var userId = _currentUserService.UserId;
            var data = await _deviceMasterService.UpdateDeviceEventsStatusAsync(deviceChangeStatusRequest, userId);
            if (data)
            {
                return StandardAPIResponse<bool>.SuccessResponse(data, AppMessageConstants.RecordUpdated, StatusCodes.Status200OK);
            }
            return StandardAPIResponse<bool>.SuccessResponse(data, AppMessageConstants.RecordNotFound, StatusCodes.Status404NotFound);
        }

        [HttpGet]
        [Route("MapCameraListByFeatures")]
        [CustomAuthorize([ScreenNames.FloorPlan], ScreenNames.MapFloorPlan)]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<MapCameraListByFeatures>>>> MapCameraListByFeatures([FromQuery] string feature, string? floorId)
        {
            var userId = _currentUserService.UserId;
            var data = await _deviceMasterService.MapCameraListByFeaturesAsync(feature, floorId);
            if (data.Count() > 0)
            {
                return StandardAPIResponse<IEnumerable<MapCameraListByFeatures>>.SuccessResponse(data, "", StatusCodes.Status200OK);
            }
            return StandardAPIResponse<IEnumerable<MapCameraListByFeatures>>.SuccessResponse(null, AppMessageConstants.RecordNotFound, StatusCodes.Status404NotFound);
        }

        [HttpGet]
        [Route("CameraListHeatmap")]
        [CustomAuthorize([ScreenNames.FloorPlan], ScreenNames.MapFloorPlan)]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<MapCameraListByFeatures>>>> CameraListByHeatmap([FromQuery] string heatmapType)
        {
            var userId = _currentUserService.UserId;
            var data = await _deviceMasterService.GetCameraListByHeatmapTypeAsync(heatmapType);
            if (data.Count() > 0)
            {
                return StandardAPIResponse<IEnumerable<MapCameraListByFeatures>>.SuccessResponse(data, "", StatusCodes.Status200OK);
            }
            return StandardAPIResponse<IEnumerable<MapCameraListByFeatures>>.SuccessResponse(null, AppMessageConstants.RecordNotFound, StatusCodes.Status404NotFound);
        }


        [HttpPost]
        [Route("GetDevicesByFloorAndZones")]
        [CustomAuthorize([ScreenNames.MapPlan], ScreenNames.MapFloorPlan)]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<MapCameraListByFeatures>>>> GetDevicesByFloorAndZones(DeviceByFloorsAndZonesRequest deviceByFloorsAndZonesRequest)
        {
            var userId = _currentUserService.UserId;
            var data = await _deviceMasterService.GetDevicesByFloorAndZonesAsync(deviceByFloorsAndZonesRequest.FloorIds, deviceByFloorsAndZonesRequest.ZoneIds);
            if (data.Count() > 0)
            {
                return StandardAPIResponse<IEnumerable<MapCameraListByFeatures>>.SuccessResponse(data, "", StatusCodes.Status200OK);
            }
            return StandardAPIResponse<IEnumerable<MapCameraListByFeatures>>.SuccessResponse(null, AppMessageConstants.RecordNotFound, StatusCodes.Status404NotFound);
        }

        //[HttpGet]
        //[Route("StreamCamera/{id}")]
        //[AllowAnonymous]
        //public async Task StreamCamera(string id)
        //{
        //    try
        //    {
        //        //var cancellationToken = HttpContext.RequestAborted;

        //        //HttpContext.Features.Get<IHttpResponseBodyFeature>()?.DisableBuffering();

        //        //var cameraUrl = $"http://10.37.58.{id}/stw-cgi/video.cgi?msubmenu=stream&action=view&Profile=1&CodecType=MJPEG";
        //        //var cameraUsername = "admin";
        //        //var cameraPassword = "TeamIndia@2025";

        //        //var handler = new HttpClientHandler
        //        //{
        //        //    PreAuthenticate = true,
        //        //    UseDefaultCredentials = false,
        //        //    Credentials = new System.Net.NetworkCredential(cameraUsername, cameraPassword)
        //        //};

        //        //using var client = new HttpClient(handler);
        //        //client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("multipart/x-mixed-replace"));

        //        //var response = await client.GetAsync(cameraUrl, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
        //        //Console.WriteLine($"Camera content type: {response.Content.Headers.ContentType}");

        //        //if (!response.IsSuccessStatusCode)
        //        //{
        //        //    Response.StatusCode = (int)response.StatusCode;
        //        //    await Response.Body.WriteAsync(Encoding.UTF8.GetBytes("Failed to connect to camera stream"));
        //        //    return;
        //        //}

        //        //// Pass camera's exact content type (including boundary)
        //        //Response.ContentType = response.Content.Headers.ContentType?.ToString() ?? "multipart/x-mixed-replace; boundary=frame";

        //        //// Optional: prevent caching
        //        //Response.Headers["Cache-Control"] = "no-store";
        //        //Response.Headers["Pragma"] = "no-cache";
        //        //Response.Headers["Expires"] = "0";
        //        //Response.Headers["Connection"] = "keep-alive";
        //        //Response.Headers["X-Accel-Buffering"] = "no";
        //        //await Response.Body.FlushAsync(); // Flush headers early

        //        //await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        //        //var buffer = new byte[8192];
        //        //int bytesRead;

        //        //while (!cancellationToken.IsCancellationRequested &&
        //        //       (bytesRead = await stream.ReadAsync(buffer.AsMemory(0, buffer.Length), cancellationToken)) > 0)
        //        //{
        //        //    await Response.Body.WriteAsync(buffer.AsMemory(0, bytesRead), cancellationToken);
        //        //    await Response.Body.FlushAsync(cancellationToken); // Important to force chunk to browser
        //        //}
        //        var cancellationToken = HttpContext.RequestAborted;
        //        HttpContext.Response.Headers.Append("X-Accel-Buffering", "no");
        //        HttpContext.Features.Get<IHttpResponseBodyFeature>()?.DisableBuffering();

        //        var cameraUrl = $"http://10.37.58.{id}/stw-cgi/video.cgi?msubmenu=stream&action=view&Profile=1&CodecType=MJPEG";
        //        var cameraUsername = "admin";
        //        var cameraPassword = "TeamIndia@2025";

        //        var digestClient = new DigestHandler(cameraUsername, cameraPassword);
        //        var response = await digestClient.SendAsync(cameraUrl, cancellationToken);
        //        Console.WriteLine($"Camera content type: {response.Content.Headers.ContentType}");

        //        if (!response.IsSuccessStatusCode)
        //        {
        //            Response.StatusCode = (int)response.StatusCode;
        //            await Response.Body.WriteAsync(Encoding.UTF8.GetBytes("Failed to connect to camera stream"));
        //            return;
        //        }

        //        // Use exact content type (important for boundary parsing)
        //        Response.ContentType = response.Content.Headers.ContentType?.ToString() ?? "multipart/x-mixed-replace";

        //        // Set no-cache and flush early
        //        Response.Headers["Cache-Control"] = "no-store";
        //        Response.Headers["Pragma"] = "no-cache";
        //        Response.Headers["Expires"] = "0";
        //        Response.Headers["Connection"] = "keep-alive";
        //        await Response.Body.FlushAsync();

        //        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        //        var buffer = new byte[8192];
        //        int bytesRead;

        //        while (!cancellationToken.IsCancellationRequested &&
        //               (bytesRead = await stream.ReadAsync(buffer.AsMemory(0, buffer.Length), cancellationToken)) > 0)
        //        {
        //            await Response.Body.WriteAsync(buffer.AsMemory(0, bytesRead), cancellationToken);
        //            await Response.Body.FlushAsync(cancellationToken);
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        Console.WriteLine($"Streaming error: {ex.Message}");
        //        Response.StatusCode = 500;
        //    }

        //}
    }
}
