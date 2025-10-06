using HanwhaClient.Model.Common;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Model.Dto
{
    public class ExceptionLogsRequest : PagingSortingModel
    {
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public string? SearchText { get; set; }
        public bool? Status { get; set; }

    }

    public class ExceptionLogsResponse
    {
        public int TotalCount { get; set; }
        public IEnumerable<ExceptionLogsDetails> ExceptionLogsDetails { get; set; }
    }

    public class ExceptionLogsDetails
    {
        public string HttpMethod { get; set; }
        public string QueryString { get; set; }
        public string RequestBody { get; set; }
        public int StatusCode { get; set; }
        public string ResponseBody { get; set; }
        public DateTime RequestTime { get; set; }
        public DateTime ResponseTime { get; set; }
        public bool IsSuccess { get; set; } = true;
        public string? ExceptionMessage { get; set; }
        public string? StackTrace { get; set; }
        public string? ExceptionType { get; set; }
        public DateTime LoggedAt { get; set; }
        public string? UserId { get; set; }
        public string? RequestPath { get; set; }
        public string id { get; set; }
    }
}
