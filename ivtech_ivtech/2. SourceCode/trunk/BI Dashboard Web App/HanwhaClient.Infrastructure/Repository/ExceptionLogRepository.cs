using HanwhaClient.Infrastructure.Connection;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.Dto;
using MongoDB.Bson;
using MongoDB.Driver;

namespace HanwhaClient.Infrastructure.Repository
{
    public class ExceptionLogRepository : RepositoryBase<ExceptionLog>, IExceptionLogRepository
    {
        public ExceptionLogRepository(MongoDbConnectionService mongoDbConnectionService) : base(mongoDbConnectionService, AppDBConstants.ExceptionLog)
        {
        }

        public async Task<(IEnumerable<ExceptionLog> ExceptionLogsDetails, int TotalCount)> GetExceptionLogs(ExceptionLogsRequest request)
        {
            var filters = new List<FilterDefinition<ExceptionLog>>();
            
            ProjectionDefinition<ExceptionLog> projection = Builders<ExceptionLog>.Projection
            .Include("HttpMethod")
            .Include("QueryString")
            .Include("RequestBody")
            .Include("StatusCode")
            .Include("ResponseBody")
            .Include("RequestTime")
            .Include("ResponseTime")
            .Include("IsSuccess")
            .Include("exceptionMessage")
            .Include("stackTrace")
            .Include("exceptionType")
            .Include("loggedAt")
            .Include("RequestPath")
            .Include("_id");

            if (!string.IsNullOrEmpty(request.SearchText))
            {
                var searchRegex = new BsonRegularExpression(request.SearchText, "i");

                filters.Add(
                    Builders<ExceptionLog>.Filter.Or(
                        Builders<ExceptionLog>.Filter.Regex(x => x.ExceptionMessage, searchRegex),
                        Builders<ExceptionLog>.Filter.Regex(x => x.StackTrace, searchRegex),
                        Builders<ExceptionLog>.Filter.Regex(x => x.RequestPath, searchRegex),
                        Builders<ExceptionLog>.Filter.Regex(x => x.ExceptionType, searchRegex)
                    )
                );
            }

            filters.Add(Builders<ExceptionLog>.Filter.And(
                    Builders<ExceptionLog>.Filter.Eq(x => x.IsDeleted, false),
                    Builders<ExceptionLog>.Filter.Gt(x => x.LoggedAt, request.FromDate),
                    Builders<ExceptionLog>.Filter.Lt(x => x.LoggedAt, request.ToDate),
                    Builders<ExceptionLog>.Filter.Eq(x => x.IsSuccess, request.Status))
                );
            var finalFilter = filters.Any() ? Builders<ExceptionLog>.Filter.And(filters) : Builders<ExceptionLog>.Filter.Empty;

            string sortField = request.SortBy ?? "loggedAt"; // default sort field
            bool sortDescending = request.SortOrder == -1;     // -1 = desc, 1 = asc

            var sortDefinition = sortDescending
                ? Builders<ExceptionLog>.Sort.Descending(sortField)
                : Builders<ExceptionLog>.Sort.Ascending(sortField);
            var data = await dbEntity.Find(finalFilter).Sort(sortDefinition).Skip((request.PageNumber - 1) * request.PageSize).Limit(request.PageSize).ToListAsync();
            int totalCount = (int)await dbEntity.CountDocumentsAsync(finalFilter);
            return (data, totalCount);
        }
        
    }
}
