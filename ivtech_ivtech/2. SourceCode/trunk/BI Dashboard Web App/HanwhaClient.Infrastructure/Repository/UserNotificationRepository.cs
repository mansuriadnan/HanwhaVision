using HanwhaClient.Infrastructure.Connection;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.Dto;
using MongoDB.Driver;

namespace HanwhaClient.Infrastructure.Repository
{
    public class UserNotificationRepository : RepositoryBase<UserNotification> , IUserNotificationRepository
    {
        public UserNotificationRepository(MongoDbConnectionService mongoDbConnectionService) : base(mongoDbConnectionService, AppDBConstants.UserNotification)
        {
        }

        public async Task<IEnumerable<UserNotificationResponse>> GetUserNotificationAsync(int pageNo, int pageSize)
        {
            var filter = Builders<UserNotification>.Filter.Empty;
            var data = await dbEntity.Find(filter).SortByDescending(x => x.CreatedOn).Skip((pageNo - 1) * pageSize).Limit(pageSize).ToListAsync();
            return data.Select(x => new UserNotificationResponse
            {
                NotificationId = x.Id,
                ActionName = x.ActionName,
                ActionParameter = x.ActionParameter,
                IsRead = x.IsRead,
                Content = x.Content,
                Title = x.Title,
                CreatedOn = (DateTime)x.CreatedOn,
            }).ToList();
        }

        public async Task<long> GetUserNotificationCountAsync()
        {
            var filter = Builders<UserNotification>.Filter.Eq(x => x.IsRead, false);
            return await dbEntity.CountDocumentsAsync(filter);
        }

        public async Task<bool> MarkAllReadUserNotification(MarkReadNotificationRequest markReadNotificationRequest)
        {
            var filter = Builders<UserNotification>.Filter.Empty;
            var update = Builders<UserNotification>.Update
                .Set(n => n.IsRead, true)
                .Set(n => n.UpdatedBy, markReadNotificationRequest.UserId)
                .Set(n => n.UpdatedOn, DateTime.UtcNow);
            var result = await dbEntity.UpdateManyAsync(filter, update);
            return result.IsAcknowledged;
        }

        public async Task<bool> UpdateNotificationDeviceEventsStatusAsync(string id, string userId)
        {
            var filter = Builders<UserNotification>.Filter.Eq(x => x.ActionParameter, id);
            var update = Builders<UserNotification>.Update
                .Set(n => n.ActionName, "Acknowledged")
                .Set(n => n.UpdatedBy, userId)
                .Set(n => n.UpdatedOn, DateTime.UtcNow);
            var result = await dbEntity.UpdateOneAsync(filter, update);
            return result.IsAcknowledged;
        }
    }
}
