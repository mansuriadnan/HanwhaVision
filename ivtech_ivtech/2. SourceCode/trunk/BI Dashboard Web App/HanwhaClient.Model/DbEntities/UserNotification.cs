using MongoDB.Bson.Serialization.Attributes;

namespace HanwhaClient.Model.DbEntities
{
    public class UserNotification : BaseModel
    {
        [BsonElement("title")]
        public string Title { get; set; }

        [BsonElement("content")]
        public string? Content { get; set; }

        [BsonElement("isRead")]
        public bool IsRead { get; set; }

        [BsonElement("actionName")]
        public string? ActionName { get; set; }

        [BsonElement("actionParameter")]
        public string? ActionParameter { get; set; }

    }
}
