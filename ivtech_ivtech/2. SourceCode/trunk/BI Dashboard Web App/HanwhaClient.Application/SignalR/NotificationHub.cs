using HanwhaClient.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.SignalR;

namespace HanwhaClient.Core.SignalR
{
    [Authorize]
    public class NotificationHub : Hub
    {
        private readonly ICurrentUserService _currentUserService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly INotificationService _notificationService;
        public NotificationHub(ICurrentUserService currentUserService, IHttpContextAccessor httpContextAccessor, INotificationService notificationService)
        {
            this._currentUserService = currentUserService;
            _httpContextAccessor = httpContextAccessor;
            _notificationService = notificationService;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst("nameid")?.Value;

            if (!string.IsNullOrEmpty(userId))
            {
                Console.WriteLine($"User {userId} connected with ConnectionId: {Context.ConnectionId}");
                await Clients.Caller.SendAsync("ReceiveMessage", $"Welcome, User {userId}!");
            }
            else
            {
                Console.WriteLine("User ID not found in claims.");
            }

            await base.OnConnectedAsync();
        }

        public async Task JoinGroup(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        }

        public async Task LeaveGroup(string groupName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        }

        public override async Task<Task> OnDisconnectedAsync(Exception exception)
        {
            await _notificationService.RemoveAllGroupsAsync(Context.ConnectionId);
            return base.OnDisconnectedAsync(exception);
        }
    }
}
