using DocumentFormat.OpenXml.InkML;
using DocumentFormat.OpenXml.Spreadsheet;
using HanwhaClient.Application.Interfaces;
using HanwhaClient.Core.SignalR;
using Microsoft.AspNetCore.SignalR;

namespace HanwhaClient.Application.Services
{
    public class NotificationService : INotificationService
    {
        private readonly IHubContext<NotificationHub> _hubContext;
        private static readonly Dictionary<string, List<string>> _connectionGroups = new();

        public NotificationService(IHubContext<NotificationHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task AddUserToGroupAsync(string connectionId, string deviceId, string widgetName)
        {
            if (!string.IsNullOrEmpty(connectionId) && !string.IsNullOrEmpty(deviceId) && !string.IsNullOrEmpty(widgetName))
            {
                if (!_connectionGroups.ContainsKey(connectionId + widgetName))
                    _connectionGroups[connectionId + widgetName] = new List<string>();

                _connectionGroups[connectionId + widgetName].Add(deviceId + widgetName);
                await _hubContext.Groups.AddToGroupAsync(connectionId, deviceId + widgetName);
            }
        }

        public async Task RemoveUserFromGroupAsync(string connectionId, string widgetName)
        {
            if (string.IsNullOrEmpty(connectionId) || string.IsNullOrEmpty(widgetName))
                return;

            var key = connectionId + widgetName;

            if (_connectionGroups.TryGetValue(key, out var groups) && groups != null && groups.Count > 0)
            {
                foreach (var group in groups)
                {
                    if (!string.IsNullOrWhiteSpace(group))
                    {
                        await _hubContext.Groups.RemoveFromGroupAsync(connectionId, group);
                    }
                }

                _connectionGroups.Remove(key);
            }
        }

        public async Task SendNotificationToGroupAsync(string groupName, string message)
        {
            await _hubContext.Clients.Group(groupName).SendAsync("ReceiveMessage", message);
        }

        public async Task SendNotificationToUserAsync(string userId, string message)
        {
            await _hubContext.Clients.User(userId).SendAsync("ReceiveMessage", message);
        }

        public async Task RemoveAllGroupsAsync(string connectionId)
        {
            if(_connectionGroups != null && _connectionGroups.Count() > 0)
            {
                var keysToRemove = _connectionGroups.Keys.Where(key => key != null && key.StartsWith(connectionId)).ToList();

                foreach (var key in keysToRemove)
                {
                    if (_connectionGroups.TryGetValue(key, out var groups) && groups != null && groups.Count > 0)
                    {
                        foreach (var group in groups)
                        {
                            if (!string.IsNullOrWhiteSpace(group))
                            {
                                await _hubContext.Groups.RemoveFromGroupAsync(connectionId, group);
                            }
                        }
                        _connectionGroups.Remove(key);
                    }
                }
            }
        }
    }
}
