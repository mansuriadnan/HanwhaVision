using HanwhaClient.Application.Interfaces;
using HanwhaClient.Core.SignalR;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.Dto;
using Microsoft.AspNetCore.SignalR;
using MongoDB.Driver;
using Newtonsoft.Json;

namespace HanwhaClient.Application.Services
{
    public class UserNotificationService : IUserNotificationService
    {
        private readonly IUserNotificationRepository _userNotificationRepository;
        private readonly IHubContext<NotificationHub> _hubContext;
        public UserNotificationService(IUserNotificationRepository userNotificationRepository,
            IHubContext<NotificationHub> hubContext) { 
            _userNotificationRepository = userNotificationRepository;
            _hubContext = hubContext;
        }
        public async Task<bool> AddUserNotification(string title, string content, string? ActionName, string? ActionParameter)
        {
            var data = new UserNotification
            {
                Title = title,
                Content = content,
                ActionName = ActionName,
                ActionParameter = ActionParameter,
                CreatedOn = DateTime.UtcNow,
                UpdatedOn = DateTime.UtcNow
            };
            await _userNotificationRepository.InsertAsync(data);
            var jsonMessage = JsonConvert.SerializeObject(data);
            await _hubContext.Clients.All.SendAsync("userNotification", jsonMessage);
            return true;
        }

        public async Task<bool> MarkReadUserNotification(MarkReadNotificationRequest markReadNotificationRequest)
        {
            if (string.IsNullOrEmpty(markReadNotificationRequest.NotificationId))
            {
                return await _userNotificationRepository.MarkAllReadUserNotification(markReadNotificationRequest);
            }
            else
            {
                var update = Builders<UserNotification>.Update
                    .Set(n => n.IsRead, true)
                    .Set(n => n.UpdatedBy, markReadNotificationRequest.UserId)
                    .Set(n => n.UpdatedOn, DateTime.UtcNow);
                return await _userNotificationRepository.UpdateFieldsAsync(markReadNotificationRequest.NotificationId, update);
            }
        }
    }
}
