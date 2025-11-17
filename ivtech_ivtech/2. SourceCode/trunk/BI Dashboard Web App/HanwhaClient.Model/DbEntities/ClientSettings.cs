using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel;

namespace HanwhaClient.Model.DbEntities
{
    public class ClientSettings : BaseModel
    {
        [BsonElement("logo")]
        public string? Logo { get; set; }

        [BsonElement("smtpSettings")]
        public SmtpSettings? SmtpSettings { get; set; }

        [BsonElement("timeZone"), BsonRepresentation(BsonType.ObjectId)]
        public string TimeZone { get; set; }

        [BsonElement("operationalTiming")]
        public ClientOperationalTiming OperationalTiming { get; set; }

        [BsonElement("googleApiKey")]
        public string? GoogleApiKey { get; set; }

        [BsonElement("sSLCertificateFileName")]
        public string? SSLCertificateFileName { get; set; }

        [BsonElement("ftpConfiguration")]
        public FtpConfigurationSetting? FtpConfiguration { get; set; }

        [BsonElement("isReportSchedule")]
        public bool isReportSchedule { get; set; }

        [BsonElement("reportSchedule")]
        public ReportSchedule ReportSchedule { get; set; }

    }

    public class FtpConfigurationSetting
    {
        [BsonElement("host")]
        public string Host { get; set; }

        [BsonElement("user")]
        public string Username { get; set; }

        [BsonElement("password")]
        public string Password { get; set; }

        [BsonElement("port")]
        public int Port { get; set; }
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

    public class ReportSchedule
    {
        [BsonElement("emails")]
        public IEnumerable<string> Emails { get; set; }

        [BsonElement("widgets")]
        public IEnumerable<string> Widgets { get; set; }

        [BsonElement("startDate")]
        public DateTime StartDate { get; set; }

        [BsonElement("startTime")]
        public DateTime StartTime { get; set; }

        [BsonElement("reportFormat")]
        public string ReportFormat { get; set; }

        [BsonElement("sendInterval")]
        public string SendInterval { get; set; }

        [BsonElement("floorIds"), BsonRepresentation(BsonType.ObjectId)]
        public IEnumerable<string> FloorIds { get; set; }

        [BsonElement("zoneIds"), BsonRepresentation(BsonType.ObjectId)]
        public IEnumerable<string> zoneIds { get; set; }
    }


    public class ClientOperationalTimingRequest
    {
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
    }

    public class ClientOperationalTimeZoneRequest
    {
        public string TimeZone { get; set; }
    }

    public class ClientOperationalTiming
    {
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
    }

    public class ClientTimezones : BaseModel
    {
        [BsonElement("name")]
        public string Name { get; set; }
        [BsonElement("timeZoneName")]
        public string TimeZoneName { get; set; }
        [BsonElement("timeZoneAbbr")]
        public string TimeZoneAbbr { get; set; }
        [BsonElement("utcOffset")]
        public string UtcOffset { get; set; }
    }
    public class GoogleApiKeyRequest
    {
        public string ApiKey { get; set; }
    }

    public class TurnReportSchedule
    {
        public bool IsReportSchedule { get; set; }
    }

    public class ReportScheduleRequest
    {
        public string[] Emails { get; set; }
        public string[] Widgets { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime StartTime { get; set; }
        public string ReportFormat { get; set; }
        public string SendInterval { get; set; }
        public string[] FloorIds { get; set; }
        public string[]? ZoneIds { get; set; }
    }

    public class FtpConfigurationRequest
    {
        public string Host { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public int Port { get; set; }
    }
}
