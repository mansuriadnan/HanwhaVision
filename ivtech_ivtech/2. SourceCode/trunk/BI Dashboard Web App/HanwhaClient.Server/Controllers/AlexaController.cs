using DocumentFormat.OpenXml.InkML;
using HanwhaClient.Application.Interfaces;
using HanwhaClient.Core.SignalR;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.Dto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using MongoDB.Driver;

namespace HanwhaClient.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AlexaController : Controller
    {

        private readonly IDashboardPreferenceRepository _dashboardPreferenceRepository;
        private readonly IHubContext<NotificationHub> _hubContext;

        public AlexaController(IDashboardPreferenceRepository DashboardPreferenceRepository,
            IHubContext<NotificationHub> hubContext) {
            _dashboardPreferenceRepository = DashboardPreferenceRepository;
            _hubContext = hubContext;
        }

        [HttpPost("send")]
        public async Task<IActionResult> SendNotification([FromBody] AlexaRequest alexaRequest)
        {
            string? dashboardId = null;
            string? widgetId = null;

            // Find dashboard 
            if (!string.IsNullOrEmpty(alexaRequest.Dashboard))
            {
                var dashboard = await _dashboardPreferenceRepository.GetDashboardForAlexaByName(alexaRequest.Dashboard);
                if (!string.IsNullOrEmpty(dashboard))
                {
                    dashboardId = dashboard;
                }
            }

            // Find widget 
            if (!string.IsNullOrEmpty(alexaRequest.widget))
            {
                widgetId = alexaRequest.widget;
                
            }

            if (dashboardId == null && widgetId == null)
            {
                return Ok(new
                {
                    success = false,
                    message = "Widget and dashboard not found."
                });
            }

            // Create response 
            var responseData = new Dictionary<string, string>();

            if (dashboardId != null)
                responseData["dashboardId"] = dashboardId;

            if (widgetId != null)
                responseData["widgetId"] = widgetId;

            // Send to all SignalR 
             _hubContext.Clients.All.SendAsync("AlexaData", System.Text.Json.JsonSerializer.Serialize(responseData));

            if (dashboardId != null && widgetId != null)
            {
                return Ok(new
                {
                    success = true,
                    message = "Dashboard & widget set successfully."
                });
            }

            else if (dashboardId != null)
            {
                return Ok(new
                {
                    success = true,
                    message = "Dashboard set successfully."
                });
            }
            else if (widgetId != null)
            {
                return Ok(new
                {
                    success = true,
                    message = "Widget set successfully"
                });
            }
            else
            {
                return Ok(new
                {
                    success = false,
                    message = "Data is not been set"
                });
            }
        }

        [HttpPost("CloseWidget")]
        public async Task<IActionResult> CloseWidget([FromBody] AlexaCloseRequest alexaRequest)
        {
            string? widgetId = null;

            // Find widget 
            if (!string.IsNullOrEmpty(alexaRequest.CloseWidget))
            {
                widgetId = alexaRequest.CloseWidget;

            }

            if (widgetId == null)
            {
                return Ok(new
                {
                    success = false,
                    message = "Widget not found."
                });
            }

            // Create response 
            var responseData = new Dictionary<string, string>();

            if (widgetId != null)
                responseData["closewidgetId"] = widgetId;

            // Send to all SignalR 
            _hubContext.Clients.All.SendAsync("AlexaData", System.Text.Json.JsonSerializer.Serialize(responseData));

            
            if (widgetId != null)
            {
                return Ok(new
                {
                    success = true,
                    message = "Widget set successfully"
                });
            }
            else
            {
                return Ok(new
                {
                    success = false,
                    message = "Data is not been set"
                });
            }
        }
    }
}
