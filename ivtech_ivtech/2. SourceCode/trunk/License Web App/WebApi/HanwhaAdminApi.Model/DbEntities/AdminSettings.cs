using MongoDB.Bson.Serialization.Attributes;


namespace HanwhaAdminApi.Model.DbEntities
{
    public class AdminSettings : BaseModel
    {
        [BsonElement("logo")]
        public string? Logo { get; set; }

        [BsonElement("superAdminEmailAddress")]
        public string? SuperAdminEmailAddress { get; set; }

        [BsonElement("smtpSettings")]
        public SmtpSettings? SmtpSettings { get; set; }
    }

    public class SmtpSettings
    {
        [BsonElement("host")]
        public string Host { get; set; }

        [BsonElement("port")]
        public int Port { get; set; }

        [BsonElement("enableSsl")]
        public bool EnableSsl { get; set; }

        [BsonElement("username")]
        public string Username { get; set; }

        [BsonElement("password")]
        public string Password { get; set; }

        [BsonElement("fromEmail")]
        public string FromEmail { get; set; }
    }
}
