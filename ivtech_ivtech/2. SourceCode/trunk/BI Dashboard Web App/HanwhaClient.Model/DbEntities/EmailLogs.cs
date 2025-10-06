using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace HanwhaClient.Model.DbEntities
{
    public class EmailLogs : BaseModel
    {
        [BsonElement("to")]
        public IEnumerable<string> To { get; set; }

        [BsonElement("cc")]
        public IEnumerable<string> CC { get; set; } = new List<string>();

        [BsonElement("bcc")]
        public IEnumerable<string> BCC { get; set; } = new List<string>();

        [BsonElement("subject")]
        public string Subject { get; set; }

        [BsonElement("body")]
        public string Body { get; set; }

        [BsonElement("attachments")]
        public IEnumerable<AttachmentModel> Attachments { get; set; } = new List<AttachmentModel>();

        [BsonElement("errorMessage")]
        public string ErrorMessage { get; set; }

        [BsonElement("timestamp")]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        [BsonElement("isSuccess")]
        public bool IsSuccess { get; set; }
    }
    public class AttachmentModel
    {
        [BsonElement("FileName")]
        public string FileName { get; set; }

        [BsonElement("FileBytes")]
        public byte[] FileBytes { get; set; }
    }
}
