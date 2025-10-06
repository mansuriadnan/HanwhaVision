using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Model.DbEntities
{
    public class ExceptionLog : BaseModel
    {
        public string HttpMethod { get; set; }
        //public string RequestPath { get; set; }
        public string QueryString { get; set; }
        public string RequestBody { get; set; }
        public int StatusCode { get; set; }
        public string ResponseBody { get; set; }
        public DateTime RequestTime { get; set; }
        public DateTime ResponseTime { get; set; }
        public bool IsSuccess { get; set; } = true;
        

        [BsonElement("exceptionMessage")]
        public string? ExceptionMessage { get; set; }
        [BsonElement("stackTrace")]
        public string? StackTrace { get; set; }
        [BsonElement("exceptionType")]
        public string? ExceptionType { get; set; }
        [BsonElement("loggedAt")]
        public DateTime LoggedAt { get; set; } = DateTime.UtcNow;
        [BsonElement("userId")]
        public string? UserId { get; set; }
        [BsonElement("RequestPath")]
        public string? RequestPath { get; set; }
    }
}
