using HanwhaClient.Infrastructure.Connection;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.Dto;
using HanwhaClient.Model.PeopleWidget;
using MongoDB.Bson;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace HanwhaClient.Infrastructure.Repository
{
    public class PeopleCountRepository : RepositoryBase<PeopleCount>, IPeopleCountRepository
    {
        public PeopleCountRepository(MongoDbConnectionService mongoDbConnectionService) : base(mongoDbConnectionService, AppDBConstants.PeopleCount)
        {
        }

        public async Task<IEnumerable<CameraCapacityUtilizationByDevice>> GetPeopleCameraCapacityUtilizationByDeviceAsync(string deviceId, DateTime startdate, DateTime enddate, TimeSpan timeOffSet, int channel, int[]? peopleLineIndex = null)
        {
            var filters = new List<FilterDefinition<PeopleCount>>();
            filters.Add(Builders<PeopleCount>.Filter.Eq(x => x.DeviceId, deviceId));
            filters.Add(Builders<PeopleCount>.Filter.Gte(x => x.CreatedOn, startdate));
            filters.Add(Builders<PeopleCount>.Filter.Lte(x => x.CreatedOn, enddate));
            filters.Add(Builders<PeopleCount>.Filter.Eq(x => x.ChannelNo, channel));
            //filters.Add(Builders<PeopleCount>.Filter.ElemMatch(x => x.Lines, Builders<Line>.Filter.In(l => l.LineIndex, peopleLineIndex)));

            var filter = filters.Any() ? Builders<PeopleCount>.Filter.And(filters) : Builders<PeopleCount>.Filter.Empty;

            var docs = await dbEntity.Aggregate()
                         .Match(filter)
                         .Project(p => new
                         {
                             CreatedOnWithOffset = timeOffSet != TimeSpan.Zero ? p.CreatedOn!.Value.Add(timeOffSet) : p.CreatedOn, // Add timezone offset if provided
                             Lines = p.Lines.Where(l => peopleLineIndex.Contains(l.LineIndex)).ToList()
                         })
                         .Group(x => new { deviceId, x.CreatedOnWithOffset!.Value.Date }, g => new
                         {
                             Id = g.Key.Date,
                             MaxInCount = g.Max(z => z.Lines != null && z.Lines.Any() && peopleLineIndex != null && peopleLineIndex.Any()
                                     ? z.Lines.Where(l => peopleLineIndex.Contains(l.LineIndex))
                                     .Sum(l => l.InCount) : 0),
                             MaxOutCount = g.Max(z => z.Lines != null && z.Lines.Any() && peopleLineIndex != null && peopleLineIndex.Any()
                             ? z.Lines.Where(l => peopleLineIndex.Contains(l.LineIndex))
                             .Sum(l => l.OutCount) : 0),
                             //records = g.Select(r => r.Lines.Where(l => peopleLineIndex.Contains(l.LineIndex)).Select(l => l.InCount))
                         })
                        .ToListAsync();

            IEnumerable<CameraCapacityUtilizationByDevice> result = docs.Select(doc => new CameraCapacityUtilizationByDevice
            {
                DeviceId = deviceId,
                Date = doc.Id,
                UtilizationCount = doc.MaxInCount != null && doc.MaxOutCount != null  ? doc.MaxInCount - doc.MaxOutCount : 0
            });

            return result;
        }

        public async Task<List<PeopleCount>> GetCamerasByCameraIds(List<string> cameraIds)
        {
            try
            {
                // Query PeopleCount collection where CameraId matches
                var filter = Builders<PeopleCount>.Filter.In(pc => pc.DeviceId, cameraIds);
                var peopleCounts = await dbEntity.Find(filter).ToListAsync();
                return peopleCounts;
            }
            catch (Exception ex)
            {
                var msg = ex.Message;
                throw;
            }
        }

        public async Task<List<PeopleCount>> GetCamerasBySelectedDate(string currentDate)
        {
            // Parse the currentDate string into a DateTime object
            DateTime parsedDate = DateTime.Parse(currentDate);

            // Create a filter to match the date part of the CreatedOn field
            var filter = Builders<PeopleCount>.Filter.Gte(pc => pc.CreatedOn, parsedDate.Date) &
                         Builders<PeopleCount>.Filter.Lt(pc => pc.CreatedOn, parsedDate.Date.AddDays(1));

            // Find the matching documents
            var peopleCounts = await dbEntity.Find(filter).ToListAsync();
            return peopleCounts;
        }

        // Method to get the minimum, maximum, and average people count
        public async Task<List<PeopleVehicleCountSummary>> GetPeopleCountMinMaxAverageAsync(string deviceId, DateTime startdate,
                                                                                    DateTime enddate, TimeSpan offset, int[]? peopleLineIndex = null, int channelNo = 0)
        {
            
            var dateOnly = enddate.Date; // This removes time, seconds, ms
            

            // Build the filter criteria for the query
            var filters = Builders<PeopleCount>.Filter.And(
                Builders<PeopleCount>.Filter.Eq(x => x.DeviceId, deviceId), // Filter by device IDs
                Builders<PeopleCount>.Filter.Gte(x => x.CreatedOn, startdate), // Filter by start date
                Builders<PeopleCount>.Filter.Lte(x => x.CreatedOn, enddate), // Filter by end date
                Builders<PeopleCount>.Filter.Eq(x => x.ChannelNo, channelNo) // Filter by channel number
            );

            // Combine all filters into a single filter
            var filter = Builders<PeopleCount>.Filter.And(filters);

            // Execute the aggregation query
            var result = await dbEntity.Aggregate()
                 .Match(filter) // Apply the filter
                 .Project(p => new
                 {
                     CreatedOn = p.CreatedOn,
                     CreatedOnWithOffset = offset != TimeSpan.Zero ?
                         p.CreatedOn!.Value.Add(offset) :
                         p.CreatedOn, // Add timezone offset if provided
                     DateOnly = p.CreatedOn!.Value.Date, // Extract only the date portion
                     Lines = p.Lines.Where(l => peopleLineIndex.Contains(l.LineIndex)).ToList()
                 })
                 //.SortByDescending(p => p.CreatedOn) // Sort by creation date in descending order
                 .Match(p => p.Lines.Any(line => line.InCount > 0 || line.OutCount > 0)) // 💡 Keep only entries with non-zero count
                 .Group(p => new { deviceId, p.CreatedOnWithOffset!.Value.Date }, g => new
                 {
                     Date = g.Key.Date,
                     TotalInCount = g.Max(x => x.Lines.Sum(l => l.InCount)),
                     TotalOutCount = g.Max(x => x.Lines.Sum(l => l.OutCount))
                     //Latest = g.First() // Get the latest entry for each date
                 })
                 .Project(p => new PeopleVehicleCountSummary
                 {
                     Date = p.Date,
                     //CreatedOnWithTimezone = p.Latest.CreatedOnWithOffset, // New field with timezone offset
                     TotalInCount = p.TotalInCount, // Sum of InCount for the latest entry
                     TotalOutCount = p.TotalOutCount // Sum of OutCount for the latest entry
                 })
                 .ToListAsync();

            return result;
        }

        public async Task<List<PeopleVehicleCountSummary>> GetHourlyLatestPeopleCountAsync1(
        string deviceIds, DateTime startdate, DateTime enddate, int[]? peopleLineIndex = null)
        {
            var dateOnly = enddate.Date; // This removes time, seconds, ms
            var nextDate = dateOnly.AddDays(1); // Start of the next day

            // Filters
            var filters = Builders<PeopleCount>.Filter.And(
                Builders<PeopleCount>.Filter.Eq(x => x.DeviceId, deviceIds),
                Builders<PeopleCount>.Filter.Gte(x => x.CreatedOn, startdate),
                Builders<PeopleCount>.Filter.Lt(x => x.CreatedOn, nextDate),
                Builders<PeopleCount>.Filter.ElemMatch(x => x.Lines,
                    Builders<Line>.Filter.In(l => l.LineIndex, peopleLineIndex))
            );

            // 10-minute interval ticks (ticks = 100 nanoseconds per tick)
            var tenMinutesTicks = TimeSpan.FromMinutes(10).Ticks;

            // Aggregation
            var result = await dbEntity.Aggregate()
                .Match(filters)
                .Project(p => new
                {
                    CreatedOn = p.CreatedOn,
                    Interval = new DateTime((p.CreatedOn.Value.Ticks / tenMinutesTicks) * tenMinutesTicks),
                    Lines = p.Lines
                })
                .Match(p => p.Lines.Any(line => line.InCount > 0 || line.OutCount > 0)) // Filter zero entries
                .Group(p => p.Interval, g => new
                {
                    Interval = g.Key,
                    TotalIn = g.SelectMany(x => x.Lines).Sum(x => x.InCount),
                    TotalOut = g.SelectMany(x => x.Lines).Sum(x => x.OutCount)
                })
                .SortBy(p => p.Interval)
                .Project(p => new PeopleVehicleCountSummary
                {
                    Date = p.Interval,
                    TotalInCount = p.TotalIn,
                    TotalOutCount = p.TotalOut
                })
                .ToListAsync();

            return result;
        }

        public async Task<List<PeopleCountRawDto>> GetHourlyLatestPeopleCountAsyncOLD(string deviceIds, DateTime startdate,
                                                                             DateTime enddate, int[]? peopleLineIndex = null, int channelNo = 0)
        {
            try
            {
                // Build the filter criteria for the query
                var filters = Builders<PeopleCount>.Filter.And(
                            Builders<PeopleCount>.Filter.Eq(x => x.DeviceId, deviceIds), // Filter by device IDs
                            Builders<PeopleCount>.Filter.Eq(x => x.ChannelNo, channelNo), // Filter by channel No
                            Builders<PeopleCount>.Filter.Gte(x => x.CreatedOn, startdate), // Filter by start date
                            Builders<PeopleCount>.Filter.Lt(x => x.CreatedOn, enddate)); // Filter by end date

                // Combine all filters into a single filter
                var filter = Builders<PeopleCount>.Filter.And(filters);

                var results = await dbEntity.Aggregate()
                                    .Match(filter)
                                    .Project(p => new PeopleCountRawDto
                                    {
                                        CreatedOn = p.CreatedOn,
                                        Lines = p.Lines.Where(l => peopleLineIndex.Contains(l.LineIndex)).ToList()
                                    })
                                    .SortBy(p => p.CreatedOn)
                                    .ToListAsync();
                return results;
            }
            catch (Exception ex)
            {
                var msg = ex.Message;
                throw;
            }
        }
        //public async Task<List<PeopleVehicleCountSummary>> GetHourlyLatestPeopleCountAsync(string deviceIds, DateTime startdate,
        //                                                            DateTime enddate, int[]? peopleLineIndex, int channelNo, int intervalMinutes)
        //{
        //    try
        //    {
        //        var pipeline = new List<BsonDocument>
        //{
        //    // 1. Match documents by deviceId, channelNo, and createdOn range
        //    new BsonDocument("$match", new BsonDocument
        //    {
        //        { "deviceId", new ObjectId(deviceIds) },
        //        { "createdOn", new BsonDocument { { "$gte", startdate }, { "$lte", enddate } } },
        //        { "channelNo", channelNo }
        //    }),

        //    // 2. Compute 10-minute bucket using floor logic
        //    new BsonDocument("$addFields", new BsonDocument("bucketTime", new BsonDocument("$add", new BsonArray
        //    {
        //        BsonValue.Create(startdate),
        //        new BsonDocument("$multiply", new BsonArray
        //        {
        //            new BsonDocument("$floor", new BsonDocument("$divide", new BsonArray
        //            {
        //                new BsonDocument("$subtract", new BsonArray { "$createdOn", BsonValue.Create(startdate) }),
        //                1000 * 60 * intervalMinutes // 10 minutes in milliseconds
        //            })),
        //            1000 * 60 * intervalMinutes
        //        })
        //    }))),

        //    // 3. Sort to get latest records first within each bucket
        //    new BsonDocument("$sort", new BsonDocument
        //    {
        //        { "bucketTime", 1 },
        //        { "createdOn", -1 } // Latest first within each bucket
        //    }),

        //    // 4. Group by bucketTime and pick the first (latest) entry
        //    //new BsonDocument("$group", new BsonDocument
        //    //{
        //    //    { "_id", "$bucketTime" },
        //    //    { "bucketTime", new BsonDocument("$first", "$bucketTime") },
        //    //    { "latest", new BsonDocument("$first", "$$ROOT") }
        //    //}),

        //    // 5. Replace root with the latest doc
        //    new BsonDocument("$replaceRoot", new BsonDocument("newRoot", "$latest")),

        //    // 6. Final sort ascending by time
        //    new BsonDocument("$sort", new BsonDocument("createdOn", 1)),

        //    // 7. Project to calculate inCount and outCount from lines array
        //    new BsonDocument("$project", new BsonDocument
        //    {
        //        { "bucketTime", 1 },
        //        { "createdOn", 1 },
        //        { "inCount", new BsonDocument("$cond", new BsonArray
        //        {
        //            // Condition: check if lines array exists and has elements
        //            new BsonDocument("$and", new BsonArray
        //            {
        //                new BsonDocument("$isArray", "$lines"),
        //                new BsonDocument("$gt", new BsonArray { new BsonDocument("$size", "$lines"), 0 })
        //            }),
        //            // If true: sum inCount from filtered lines
        //            new BsonDocument("$sum", new BsonDocument("$map", new BsonDocument
        //            {
        //                { "input", peopleLineIndex != null && peopleLineIndex.Length > 0
        //                    ? new BsonDocument("$filter", new BsonDocument
        //                    {
        //                        { "input", "$lines" },
        //                        { "as", "line" },
        //                        { "cond", new BsonDocument("$in", new BsonArray { "$$line.lineIndex", new BsonArray(peopleLineIndex) }) }
        //                    })
        //                    : null // If no filter, use all lines
        //                },
        //                { "as", "line" },
        //                { "in", new BsonDocument("$ifNull", new BsonArray { "$$line.inCount", 0 }) }
        //            })),
        //            // If false: return 0
        //            0
        //        }) },
        //        { "outCount", new BsonDocument("$cond", new BsonArray
        //        {
        //            // Condition: check if lines array exists and has elements
        //            new BsonDocument("$and", new BsonArray
        //            {
        //                new BsonDocument("$isArray", "$lines"),
        //                new BsonDocument("$gt", new BsonArray { new BsonDocument("$size", "$lines"), 0 })
        //            }),
        //            // If true: sum outCount from filtered lines
        //            new BsonDocument("$sum", new BsonDocument("$map", new BsonDocument
        //            {
        //                { "input", peopleLineIndex != null && peopleLineIndex.Length > 0
        //                    ? new BsonDocument("$filter", new BsonDocument
        //                    {
        //                        { "input", "$lines" },
        //                        { "as", "line" },
        //                        { "cond", new BsonDocument("$in", new BsonArray { "$$line.lineIndex", new BsonArray(peopleLineIndex) }) }
        //                    })
        //                    :null // If no filter, use all lines
        //                },
        //                { "as", "line" },
        //                { "in", new BsonDocument("$ifNull", new BsonArray { "$$line.outCount", 0 }) }
        //            })),
        //            // If false: return 0
        //            0
        //        }) }
        //    })
        //};

        //        var aggregationResult = await dbEntity.Aggregate<BsonDocument>(pipeline).ToListAsync();

        //        var result = aggregationResult.Select(doc =>
        //        {
        //            var bucketTime = doc.Contains("bucketTime") && doc["bucketTime"].IsBsonDateTime
        //                ? doc["bucketTime"].ToUniversalTime()
        //                : (doc.Contains("createdOn") && doc["createdOn"].IsBsonDateTime
        //                    ? doc["createdOn"].ToUniversalTime()
        //                    : DateTime.MinValue);

        //            var hour = bucketTime.Hour;
        //            var start = DateTime.Today.AddHours(hour);
        //            var end = start.AddHours(1);

        //            string FormatHour(DateTime dt) =>
        //                dt.ToString("htt", System.Globalization.CultureInfo.InvariantCulture).ToLower();

        //            var hourRange = $"{FormatHour(start)} to {FormatHour(end)}";

        //            return new PeopleVehicleCountSummary
        //            {
        //                TotalInCount = doc.Contains("inCount") ? doc["inCount"].ToInt32() : 0,
        //                TotalOutCount = doc.Contains("outCount") ? doc["outCount"].ToInt32() : 0,
        //                Date = bucketTime,
        //                HourRange = hourRange
        //            };
        //        }).ToList();

        //        return result;
        //    }
        //    catch (Exception ex)
        //    {
        //        var msg = ex.Message;
        //        throw;
        //    }
        //}

        public async Task<List<PeopleVehicleCountSummary>> GetHourlyLatestPeopleCountAsync(string deviceIds, DateTime startdate,
                                                    DateTime enddate, int[]? peopleLineIndex, int channelNo, int intervalMinutes)
        {
            try
            {
                var pipeline = new List<BsonDocument>
 {
     // 1. Match documents by deviceId, channelNo, and createdOn range
     new BsonDocument("$match", new BsonDocument
     {
         { "deviceId", new ObjectId(deviceIds) },
         { "createdOn", new BsonDocument { { "$gte", startdate }, { "$lte", enddate } } },
         { "channelNo", channelNo }
     }),

     // 2. Compute 10-minute bucket using floor logic
     new BsonDocument("$addFields", new BsonDocument("bucketTime", new BsonDocument("$add", new BsonArray
     {
         BsonValue.Create(startdate),
         new BsonDocument("$multiply", new BsonArray
         {
             new BsonDocument("$floor", new BsonDocument("$divide", new BsonArray
             {
                 new BsonDocument("$subtract", new BsonArray { "$createdOn", BsonValue.Create(startdate) }),
                 1000 * 60 * intervalMinutes // 10 minutes in milliseconds
             })),
             1000 * 60 * intervalMinutes
         })
     }))),

     // **NEW STEP: Calculate inCount and outCount for each document before sorting**
     new BsonDocument("$addFields", new BsonDocument
     {
         { "calculatedInCount", new BsonDocument("$cond", new BsonArray
         {
             // Condition: check if lines array exists and has elements
             new BsonDocument("$and", new BsonArray
             {
                 new BsonDocument("$isArray", "$lines"),
                 new BsonDocument("$gt", new BsonArray { new BsonDocument("$size", "$lines"), 0 })
             }),
             // If true: sum inCount from filtered lines
             new BsonDocument("$sum", new BsonDocument("$map", new BsonDocument
             {
                 { "input", peopleLineIndex != null && peopleLineIndex.Length > 0
                     ? new BsonDocument("$filter", new BsonDocument
                     {
                         { "input", "$lines" },
                         { "as", "line" },
                         { "cond", new BsonDocument("$in", new BsonArray { "$$line.lineIndex", new BsonArray(peopleLineIndex) }) }
                     })
                     : "$lines" // If no filter, use all lines
                 },
                 { "as", "line" },
                 { "in", new BsonDocument("$ifNull", new BsonArray { "$$line.inCount", 0 }) }
             })),
             // If false: return 0
             0
         }) },
         { "calculatedOutCount", new BsonDocument("$cond", new BsonArray
         {
             // Condition: check if lines array exists and has elements
             new BsonDocument("$and", new BsonArray
             {
                 new BsonDocument("$isArray", "$lines"),
                 new BsonDocument("$gt", new BsonArray { new BsonDocument("$size", "$lines"), 0 })
             }),
             // If true: sum outCount from filtered lines
             new BsonDocument("$sum", new BsonDocument("$map", new BsonDocument
             {
                 { "input", peopleLineIndex != null && peopleLineIndex.Length > 0
                     ? new BsonDocument("$filter", new BsonDocument
                     {
                         { "input", "$lines" },
                         { "as", "line" },
                         { "cond", new BsonDocument("$in", new BsonArray { "$$line.lineIndex", new BsonArray(peopleLineIndex) }) }
                     })
                     : "$lines" // If no filter, use all lines
                 },
                 { "as", "line" },
                 { "in", new BsonDocument("$ifNull", new BsonArray { "$$line.outCount", 0 }) }
             })),
             // If false: return 0
             0
         }) }
     }),

     //// **MODIFIED STEP: Sort by bucketTime, then by calculatedInCount (desc), then by calculatedOutCount (desc), then createdOn (desc)**
     //new BsonDocument("$sort", new BsonDocument
     //{
     //    { "bucketTime", 1 },
     //    { "calculatedInCount", -1 }, // Max inCount first
     //    { "calculatedOutCount", -1 }, // Then max outCount (as tie-breaker for inCount)
     //    { "createdOn", -1 } // Then latest entry (as tie-breaker for counts)
     //}),

     // **MODIFIED STEP: Group by bucketTime and pick the first (which now has the max inCount/outCount)**
     //new BsonDocument("$group", new BsonDocument
     //{
     //    { "_id", "$bucketTime" },
     //    { "bucketTime", new BsonDocument("$first", "$bucketTime") },
     //    { "maxEntry", new BsonDocument("$first", "$$ROOT") } // Renamed for clarity
     //}),

     new BsonDocument("$group", new BsonDocument

{

    { "_id", "$bucketTime" },
    { "maxInCount", new BsonDocument("$max", "$calculatedInCount") },
    { "maxOutCount", new BsonDocument("$max", "$calculatedOutCount") },

}),
 

     // **MODIFIED STEP: Replace root with the maxEntry doc**
   //  new BsonDocument("$replaceRoot", new BsonDocument("newRoot", "$maxEntry")),

     // 7. Final sort ascending by time (this will still be on 'createdOn' from the maxEntry doc)
     new BsonDocument("$sort", new BsonDocument("_id", 1)),

     // 8. Project to calculate inCount and outCount from lines array (remains the same as these fields will be present from maxEntry)
     // Note: We use the already calculated 'calculatedInCount' and 'calculatedOutCount' to avoid re-calculating here.
     //new BsonDocument("$project", new BsonDocument
     //{
     //    { "bucketTime", 1 },
     //    { "createdOn", 1 },
     //    { "inCount", "$calculatedInCount" }, // Use the pre-calculated field
     //    { "outCount", "$calculatedOutCount" } // Use the pre-calculated field
     //})
 };

                var aggregationResult = await dbEntity.Aggregate<BsonDocument>(pipeline).ToListAsync();

                var data =  aggregationResult.Select(d => new PeopleVehicleCountSummary
                {
                    Date = d["_id"].ToUniversalTime(),
                    TotalInCount = d.GetValue("maxInCount", 0).ToInt32(),
                    TotalOutCount = d.GetValue("maxOutCount", 0).ToInt32(),
                }).ToList();

                return data;

                //var result = aggregationResult.Select(doc =>
                //{
                //    var bucketTime = doc.Contains("bucketTime") && doc["bucketTime"].IsBsonDateTime
                //        ? doc["bucketTime"].ToUniversalTime()
                //        : (doc.Contains("createdOn") && doc["createdOn"].IsBsonDateTime
                //            ? doc["createdOn"].ToUniversalTime()
                //            : DateTime.MinValue);

                //    var hour = bucketTime.Hour;
                //    var start = DateTime.Today.AddHours(hour);
                //    var end = start.AddHours(1);

                //    string FormatHour(DateTime dt) =>
                //        dt.ToString("htt", System.Globalization.CultureInfo.InvariantCulture).ToLower();

                //    var hourRange = $"{FormatHour(start)} to {FormatHour(end)}";

                //    return new PeopleVehicleCountSummary
                //    {
                //        TotalInCount = doc.Contains("inCount") ? doc["inCount"].ToInt32() : 0,
                //        TotalOutCount = doc.Contains("outCount") ? doc["outCount"].ToInt32() : 0,
                //        Date = bucketTime,
                //        HourRange = hourRange
                //    };
                //}).ToList();

                //return result;
            }
            catch (Exception ex)
            {
                var msg = ex.Message;
                throw;
            }
        }

        public async Task<List<PeopleVehicleCountSummary>> GetPeopleBasedAsync(string deviceIds, DateTime startdate,
                                                                 DateTime enddate, int[]? peopleLineIndex, int channelNo, int intervalMinutes)
        {
            try
            {
                var pipeline = new List<BsonDocument>
        {
            // 1. Match documents by deviceId, channelNo, and createdOn range
            new BsonDocument("$match", new BsonDocument
            {
                { "deviceId", new ObjectId(deviceIds) },
                { "createdOn", new BsonDocument { { "$gte", startdate }, { "$lte", enddate } } },
                { "channelNo", channelNo }
            }),

            // 2. Compute 10-minute bucket using floor logic
            new BsonDocument("$addFields", new BsonDocument("bucketTime", new BsonDocument("$add", new BsonArray
            {
                BsonValue.Create(startdate),
                new BsonDocument("$multiply", new BsonArray
                {
                    new BsonDocument("$floor", new BsonDocument("$divide", new BsonArray
                    {
                        new BsonDocument("$subtract", new BsonArray { "$createdOn", BsonValue.Create(startdate) }),
                        1000 * 60 * intervalMinutes // 10 minutes in milliseconds
                    })),
                    1000 * 60 * intervalMinutes
                })
            }))),

            // 3. Sort to get latest records first within each bucket
            new BsonDocument("$sort", new BsonDocument
            {
                { "bucketTime", 1 },
                { "createdOn", -1 } // Latest first within each bucket
            }),

            // 4. Group by bucketTime and pick the first (latest) entry
            new BsonDocument("$group", new BsonDocument
            {
                { "_id", "$bucketTime" },
                { "bucketTime", new BsonDocument("$first", "$bucketTime") },
                { "latest", new BsonDocument("$first", "$$ROOT") }
            }),

            // 5. Replace root with the latest doc
            new BsonDocument("$replaceRoot", new BsonDocument("newRoot", "$latest")),

            // 6. Final sort ascending by time
            new BsonDocument("$sort", new BsonDocument("createdOn", 1)),

            // 7. Project to calculate inCount and outCount from lines array
            new BsonDocument("$project", new BsonDocument
            {
                { "bucketTime", 1 },
                { "createdOn", 1 },
                { "inCount", new BsonDocument("$cond", new BsonArray
                {
                    // Condition: check if lines array exists and has elements
                    new BsonDocument("$and", new BsonArray
                    {
                        new BsonDocument("$isArray", "$lines"),
                        new BsonDocument("$gt", new BsonArray { new BsonDocument("$size", "$lines"), 0 })
                    }),
                    // If true: sum inCount from filtered lines
                    new BsonDocument("$sum", new BsonDocument("$map", new BsonDocument
                    {
                        { "input", peopleLineIndex != null && peopleLineIndex.Length > 0
                            ? new BsonDocument("$filter", new BsonDocument
                            {
                                { "input", "$lines" },
                                { "as", "line" },
                                { "cond", new BsonDocument("$in", new BsonArray { "$$line.lineIndex", new BsonArray(peopleLineIndex) }) }
                            })
                            : null // If no filter, use all lines
                        },
                        { "as", "line" },
                        { "in", new BsonDocument("$ifNull", new BsonArray { "$$line.inCount", 0 }) }
                    })),
                    // If false: return 0
                    0
                }) },
                { "outCount", new BsonDocument("$cond", new BsonArray
                {
                    // Condition: check if lines array exists and has elements
                    new BsonDocument("$and", new BsonArray
                    {
                        new BsonDocument("$isArray", "$lines"),
                        new BsonDocument("$gt", new BsonArray { new BsonDocument("$size", "$lines"), 0 })
                    }),
                    // If true: sum outCount from filtered lines
                    new BsonDocument("$sum", new BsonDocument("$map", new BsonDocument
                    {
                        { "input", peopleLineIndex != null && peopleLineIndex.Length > 0
                            ? new BsonDocument("$filter", new BsonDocument
                            {
                                { "input", "$lines" },
                                { "as", "line" },
                                { "cond", new BsonDocument("$in", new BsonArray { "$$line.lineIndex", new BsonArray(peopleLineIndex) }) }
                            })
                            :null // If no filter, use all lines
                        },
                        { "as", "line" },
                        { "in", new BsonDocument("$ifNull", new BsonArray { "$$line.outCount", 0 }) }
                    })),
                    // If false: return 0
                    0
                }) }
            })
        };

                var aggregationResult = await dbEntity.Aggregate<BsonDocument>(pipeline).ToListAsync();


                // Assuming you have a parameter `interval` which can be 15 or 30

                var result = aggregationResult.Select(doc =>
                {
                    var bucketTime = doc.Contains("bucketTime") && doc["bucketTime"].IsBsonDateTime
                        ? doc["bucketTime"].ToUniversalTime()
                        : (doc.Contains("createdOn") && doc["createdOn"].IsBsonDateTime
                            ? doc["createdOn"].ToUniversalTime()
                            : DateTime.MinValue);

                    // Round down the actual time to the nearest interval
                    var minutes = (bucketTime.Minute / intervalMinutes) * intervalMinutes;
                    var start = new DateTime(bucketTime.Year, bucketTime.Month, bucketTime.Day, bucketTime.Hour, 0, 0)
                                .AddMinutes(minutes);
                    var end = start.AddMinutes(intervalMinutes);

                    string FormatTime(DateTime dt) =>
                        dt.ToString("htt", System.Globalization.CultureInfo.InvariantCulture).ToLower();

                    var hourRange = $"{FormatTime(start)} to {FormatTime(end)}";

                    return new PeopleVehicleCountSummary
                    {
                        TotalInCount = doc.Contains("inCount") ? doc["inCount"].ToInt32() : 0,
                        TotalOutCount = doc.Contains("outCount") ? doc["outCount"].ToInt32() : 0,
                        Date = bucketTime,
                        HourRange = hourRange
                    };
                }).ToList();



                return result;
            }
            catch (Exception ex)
            {
                var msg = ex.Message;
                throw;
            }
        }


        public async Task<List<NewVsTotalVisitorCountWidgetData>> GetLatestPeopleCountDetails(FilterDefinition<PeopleCount> filter,TimeSpan offset)
        {
            //CreatedOnWithOffset = offset != TimeSpan.Zero ?
            //           p.CreatedOn!.Value.Add(offset) :
            //           p.CreatedOn, // Add timezone offset if provided
            List<NewVsTotalVisitorCountWidgetData> vehicleByTypeCountWidgetData = new List<NewVsTotalVisitorCountWidgetData>();
            vehicleByTypeCountWidgetData = await dbEntity
                            .Find(filter)
                            .Project(x => new NewVsTotalVisitorCountWidgetData
                            {
                                DeviceId = x.DeviceId,
                                Lines = x.Lines,
                                ChannelNo = x.ChannelNo,
                                CreatedOn = x.CreatedOn
                            })
                            .ToListAsync();

            // Apply offset to CreatedOn
            var adjustedData = vehicleByTypeCountWidgetData
                .Where(vc => vc.CreatedOn.HasValue)
                .Select(vc => new NewVsTotalVisitorCountWidgetData
                {
                    DeviceId = vc.DeviceId,
                    Lines = vc.Lines,
                    ChannelNo = vc.ChannelNo,
                    CreatedOn = vc.CreatedOn.Value.Add(offset), // Apply offset here
                })
                .ToList();

            // Group by offset-adjusted date + device and select latest per group
            //var latestPerDayPeopleCount = adjustedData
            //    .GroupBy(vc => new
            //    {
            //        Date = vc.CreatedOn?.Date,
            //        DeviceId = vc.DeviceId
            //    })
            //    .Select(g => g.MaxBy(vc => vc.CreatedOn))
            //    .ToList();

            //return latestPerDayPeopleCount;
            // Group by date (adjusted), and find record with max inCount per day
            var maxInCountRecordPerDay = adjustedData
                .GroupBy(vc => new
                {
                    Date = vc.CreatedOn?.Date,
                    DeviceId = vc.DeviceId
                })
                .Select(g => g
                    .OrderByDescending(x => x.Lines?.Sum(l => l.InCount) ?? 0)
                    .First())
                .ToList();

            return maxInCountRecordPerDay;

        }

        // Helper function to round down to nearest 10-minute interval

        public async Task<PeopleCountByDevice> GetPeopleCountByDeviceAsync(string deviceId, DateTime startdate, DateTime enddate, int channel, TimeSpan offset, int[]? peopleLineIndex = null)
        {
            var filters = new List<FilterDefinition<PeopleCount>>();
            filters.Add(Builders<PeopleCount>.Filter.Eq(x => x.DeviceId, deviceId));
            filters.Add(Builders<PeopleCount>.Filter.Gte(x => x.CreatedOn, startdate));
            filters.Add(Builders<PeopleCount>.Filter.Lte(x => x.CreatedOn, enddate));
            filters.Add(Builders<PeopleCount>.Filter.Eq(x => x.ChannelNo, channel));

            var filter = filters.Any() ? Builders<PeopleCount>.Filter.And(filters) : Builders<PeopleCount>.Filter.Empty;

            //var docs = await dbEntity.Aggregate()
            //             .Match(filter)
            //             .Project(p => new
            //             {
            //                 CreatedOn = p.CreatedOn,
            //                 CreatedOnWithOffset = offset != TimeSpan.Zero
            //                    ? p.CreatedOn!.Value.Add(offset)
            //                    : p.CreatedOn,
            //                 Lines = p.Lines
            //             })
            //             .Group(x => x.CreatedOnWithOffset!.Value.Date, g => new
            //             {
            //                 date = g.Key,
            //                 deviceInCount = g.Max(x => x.Lines.Where(l => peopleLineIndex.Contains(l.LineIndex)).Sum(y => y.InCount)),
            //                 deviceOutCount = g.Max(x => x.Lines.Where(l => peopleLineIndex.Contains(l.LineIndex)).Sum(y => y.OutCount)),
            //                 records = g.Select(r => r.Lines.Sum(l => l.InCount - l.OutCount))
            //             })
            //            .ToListAsync();
            //var docs = await dbEntity.Aggregate()
            //             .SortByDescending(p => p.CreatedOn)
            //             .Match(filter)
            //             .Project(p => new
            //             {
            //                 CreatedOn = p.CreatedOn,
            //                 CreatedOnWithOffset = offset != TimeSpan.Zero
            //                    ? p.CreatedOn!.Value.Add(offset)
            //                    : p.CreatedOn,
            //                 Lines = p.Lines
            //             })
            //             .Group(p => p.CreatedOnWithOffset!.Value.Date, g => new
            //             {
            //                 date = g.Key,
            //                 latestRecord = g.OrderByDescending(x => x.CreatedOnWithOffset).First()
            //             })
            //             .Project(g => new
            //             {
            //                 g.date,
            //                 deviceInCount = g.latestRecord.Lines
            //                    .Where(l => peopleLineIndex.Contains(l.LineIndex))
            //                    .Sum(l => l.InCount),
            //                 deviceOutCount = g.latestRecord.Lines
            //                    .Where(l => peopleLineIndex.Contains(l.LineIndex))
            //                    .Sum(l => l.OutCount),
            //                 records = g.latestRecord.Lines.Sum(l => l.InCount - l.OutCount),
            //                 createdOn = g.latestRecord.CreatedOnWithOffset
            //             })
            //             .ToListAsync();
            var docs = await dbEntity.Aggregate()
                .Match(filter)
                .Project(p => new
                {
                    p.CreatedOn,
                    CreatedOnWithOffset = offset != TimeSpan.Zero
                        ? p.CreatedOn!.Value.Add(offset)
                        : p.CreatedOn,
                    TotalInCount = p.Lines
                        .Where(l => peopleLineIndex.Contains(l.LineIndex))
                        .Sum(l => l.InCount),
                    TotalOutCount = p.Lines
                        .Where(l => peopleLineIndex.Contains(l.LineIndex))
                        .Sum(l => l.OutCount),
                    NetCount = p.Lines.Sum(l => l.InCount - l.OutCount),
                    Lines = p.Lines
                })
                .Group(p => p.CreatedOnWithOffset!.Value.Date, g => new
                {
                    Date = g.Key,
                    maxRecord = g.OrderByDescending(x => x.TotalInCount).First()
                })
                .Project(g => new
                {
                    g.Date,
                    deviceInCount = g.maxRecord.TotalInCount,
                    deviceOutCount = g.maxRecord.TotalOutCount,
                    records = g.maxRecord.NetCount,
                    createdOn = g.maxRecord.CreatedOn
                })
                .ToListAsync();

            PeopleCountByDevice result = new PeopleCountByDevice
            {
                DeviceId = deviceId,
                PeopleInCount = docs.Sum(x => x.deviceInCount),
                PeopelOutCount = docs.Sum(x => x.deviceOutCount),
            };

            return result;
        }

        //public async Task<IEnumerable<(DateTime date, PeopleCount peopleInCount)>> GenderWisePeopleCountingAsync(WidgetRequest widgetRequest, IEnumerable<ZoneCamera> zoneCameras, TimeSpan timeOffset)
        //{
        //    var deviceChannelFilters = zoneCameras
        //    .Select(pair =>
        //        Builders<PeopleCount>.Filter.And(
        //            Builders<PeopleCount>.Filter.Eq(x => x.DeviceId, pair.DeviceId),
        //            Builders<PeopleCount>.Filter.Eq(x => x.ChannelNo, pair.Channel)
        //        )
        //    )
        //    .ToList();

        //    var filters = new List<FilterDefinition<PeopleCount>>
        //    {
        //        Builders<PeopleCount>.Filter.Eq(x => x.IsDeleted, false),
        //        Builders<PeopleCount>.Filter.Or(deviceChannelFilters),
        //        Builders<PeopleCount>.Filter.Gte(x => x.CreatedOn, widgetRequest.StartDate),
        //        Builders<PeopleCount>.Filter.Lte(x => x.CreatedOn, widgetRequest.EndDate)
        //    };

        //    var filter = filters.Any() ? Builders<PeopleCount>.Filter.And(filters) : Builders<PeopleCount>.Filter.Empty;

        //    var peopleCountResult = await dbEntity.Aggregate()
        //        .Match(filter)
        //        .Project(p => new
        //        {
        //            CreatedOn = p.CreatedOn,
        //            CreatedOnWithOffset = timeOffset != TimeSpan.Zero ? p.CreatedOn!.Value.Add(timeOffset) : p.CreatedOn, // Add timezone offset if provided
        //            DateOnly = p.CreatedOn!.Value.Date, // Extract only the date portion
        //            Lines = p.Lines,
        //            DeviceId = p.DeviceId
        //        })
        //        .Group(x => new { Date = x.CreatedOnWithOffset!.Value.Date, x.DeviceId }, grp => new
        //        {
        //            date = grp.Key.Date,
        //            peopleInCount = grp.OrderByDescending(y => y.CreatedOnWithOffset).FirstOrDefault()
        //        }).Project(z => new  
        //        {
        //            date = z.date,
        //            peopleInCount = new PeopleCount
        //            {
        //                DeviceId = z.peopleInCount.DeviceId,
        //                Lines = z.peopleInCount.Lines
        //            },
        //        }).ToListAsync();


        //    return peopleCountResult.Select(x => (x.date, x.peopleInCount));
        //}

        public async Task<IEnumerable<(DateTime date, PeopleCount peopleInCount)>> GenderWisePeopleCountingAsync(
    WidgetRequest widgetRequest,
    IEnumerable<ZoneCamera> zoneCameras,
    TimeSpan timeOffset)
        {
            var deviceChannelFilters = zoneCameras
                .Select(pair =>
                    Builders<PeopleCount>.Filter.And(
                        Builders<PeopleCount>.Filter.Eq(x => x.DeviceId, pair.DeviceId),
                        Builders<PeopleCount>.Filter.Eq(x => x.ChannelNo, pair.Channel)
                    )
                )
                .ToList();

            var filters = new List<FilterDefinition<PeopleCount>>
    {
        Builders<PeopleCount>.Filter.Eq(x => x.IsDeleted, false),
        Builders<PeopleCount>.Filter.Or(deviceChannelFilters),
        Builders<PeopleCount>.Filter.Gte(x => x.CreatedOn, widgetRequest.StartDate),
        Builders<PeopleCount>.Filter.Lte(x => x.CreatedOn, widgetRequest.EndDate)
    };

            var filter = filters.Any()
                ? Builders<PeopleCount>.Filter.And(filters)
                : Builders<PeopleCount>.Filter.Empty;

            // optimized aggregation pipeline
            var peopleCountResult = await dbEntity.Aggregate()
                .Match(filter)
                .Project(p => new
                {
                    CreatedOn = p.CreatedOn,
                    CreatedOnWithOffset = timeOffset != TimeSpan.Zero
                        ? p.CreatedOn!.Value.Add(timeOffset)
                        : p.CreatedOn,
                    DeviceId = p.DeviceId,
                    Lines = p.Lines
                })
                .SortByDescending(p => p.CreatedOnWithOffset) // ensure latest doc comes first
                .Group(p => new { Date = p.CreatedOnWithOffset!.Value.Date, p.DeviceId },
                    g => new
                    {
                        date = g.Key.Date,
                        peopleInCount = g.First() // first after sort = latest record
                    })
                .Project(z => new
                {
                    date = z.date,
                    peopleInCount = new PeopleCount
                    {
                        DeviceId = z.peopleInCount.DeviceId,
                        Lines = z.peopleInCount.Lines
                    }
                })
                .ToListAsync();

            return peopleCountResult.Select(x => (x.date, x.peopleInCount));
        }


        public async Task<IEnumerable<CountAnalysisData>> PeopleCameraCapacityUtilizationAnalysisByZones(string deviceId, DateTime startdate, DateTime enddate, int channel, int[]? peopleLineIndex = null, int intervalMinute = 10)
        {
            var pipeline = new List<BsonDocument>
            {
                // Match filter
                new BsonDocument("$match", new BsonDocument
                {
                    { "deviceId", new ObjectId(deviceId) },
                    { "createdOn", new BsonDocument {
                        { "$gte", startdate },
                        { "$lte", enddate }
                    }},
                    { "channelNo", channel }
                }),
            
                // Calculate bucket time
                new BsonDocument("$addFields", new BsonDocument("bucketTime", new BsonDocument("$add", new BsonArray
                {
                    BsonValue.Create(startdate),
                    new BsonDocument("$multiply", new BsonArray
                    {
                        new BsonDocument("$floor", new BsonDocument("$divide", new BsonArray
                        {
                            new BsonDocument("$subtract", new BsonArray
                            {
                                "$createdOn", BsonValue.Create(startdate)
                            }),
                            1000 * 60 * intervalMinute
                        })),
                        1000 * 60 * intervalMinute
                    })
                }))),
            
                // Compute (InCount - OutCount) sum per document (but only for selected lineIndexes)
                new BsonDocument("$project", new BsonDocument
                {
                    { "bucketTime", 1 },
                    { "inCountPerDoc", new BsonDocument("$cond", new BsonArray
                    {
                        new BsonDocument("$and", new BsonArray
                        {
                            new BsonDocument("$isArray", "$lines"),
                            new BsonDocument("$gt", new BsonArray { new BsonDocument("$size", "$lines"), 0 }),
                            new BsonDocument("$gt", new BsonArray { peopleLineIndex.Count(), 0 })
                        }),

                        new BsonDocument("$sum", new BsonDocument("$map", new BsonDocument
                        {
                            { "input", new BsonDocument("$filter", new BsonDocument
                                {
                                    { "input", "$lines" },
                                    { "as", "line" },
                                    { "cond", new BsonDocument("$in", new BsonArray { "$$line.lineIndex", new BsonArray(peopleLineIndex) }) }
                                })
                            },
                            { "as", "line" },
                            { "in", "$$line.inCount" }
                        })),
                        0
                    })
                },
                { "outCountPerDoc", new BsonDocument("$cond", new BsonArray
                    {
                        new BsonDocument("$and", new BsonArray
                        {
                            new BsonDocument("$isArray", "$lines"),
                            new BsonDocument("$gt", new BsonArray { new BsonDocument("$size", "$lines"), 0 }),
                            new BsonDocument("$gt", new BsonArray { peopleLineIndex.Count(), 0 })
                        }),

                        new BsonDocument("$sum", new BsonDocument("$map", new BsonDocument
                        {
                            { "input", new BsonDocument("$filter", new BsonDocument
                                {
                                    { "input", "$lines" },
                                    { "as", "line" },
                                    { "cond", new BsonDocument("$in", new BsonArray { "$$line.lineIndex", new BsonArray(peopleLineIndex) }) }
                                })
                            },
                            { "as", "line" },
                            { "in", "$$line.outCount" }
                        })),
                        0
                    })
                }}),
            
                // Group by 10-min interval and average the utilization
                new BsonDocument("$group", new BsonDocument
                {
                    { "_id", "$bucketTime" },
                    { "maxInCount", new BsonDocument("$max", "$inCountPerDoc") },
                    { "maxOutCount", new BsonDocument("$max", "$outCountPerDoc") }
                }),

                new BsonDocument("$sort", new BsonDocument("_id", 1))
            };

            var docs = await dbEntity.Aggregate<BsonDocument>(pipeline).ToListAsync();
            var result = docs.Select(doc => new CountAnalysisData
            {
                Count = (int)doc["maxInCount"] - (int)doc["maxOutCount"],
                DateTime = doc["_id"].ToUniversalTime()
            });
            return result;
        }


        public async Task<List<PeopleCountAggregatedDto>> GetPeopleCountHalfHourlyAverageAsync(
    string deviceIds, DateTime startdate, DateTime enddate,
    int[]? peopleLineIndex = null, int channelNo = 0)
        {
            try
            {
                var builder = Builders<PeopleCount>.Filter;
                var filters = builder.And(
                    builder.Eq(x => x.DeviceId, deviceIds),
                    builder.Eq(x => x.ChannelNo, channelNo),
                    builder.Gte(x => x.CreatedOn, startdate),
                    builder.Lt(x => x.CreatedOn, enddate)
                );

                var pipeline = new BsonDocument[]
                {
            new BsonDocument("$match", filters.ToBsonDocument()),

            new BsonDocument("$unwind", "$Lines"),

            peopleLineIndex != null
            ? new BsonDocument("$match", new BsonDocument("Lines.lineIndex", new BsonDocument("$in", new BsonArray(peopleLineIndex))))
            : new BsonDocument(),

            new BsonDocument("$project", new BsonDocument
            {
                { "lineIndex", "$Lines.lineIndex" },
                { "inCount", "$Lines.inCount" },
                { "outCount", "$Lines.outCount" },
                { "interval", new BsonDocument("$dateTrunc", new BsonDocument {
                    { "date", "$CreatedOn" },
                    { "unit", "minute" },
                    { "binSize", 30 },
                    { "timezone", "UTC" } // Adjust if needed
                })}
            }),

            new BsonDocument("$group", new BsonDocument
            {
                { "_id", new BsonDocument {
                    { "interval", "$interval" },
                    { "lineIndex", "$lineIndex" }
                }},
                { "avgInCount", new BsonDocument("$avg", "$inCount") },
                { "avgOutCount", new BsonDocument("$avg", "$outCount") }
            }),

            new BsonDocument("$project", new BsonDocument
            {
                { "interval", "$_id.interval" },
                { "lineIndex", "$_id.lineIndex" },
                { "avgInCount", 1 },
                { "avgOutCount", 1 },
                { "_id", 0 }
            }),

            new BsonDocument("$sort", new BsonDocument("interval", 1))
                };

                var result = await dbEntity.Aggregate<PeopleCountAggregatedDto>(pipeline).ToListAsync();
                return result;
            }
            catch (Exception ex)
            {
                var msg = ex.Message;
                throw;
            }
        }

        public async Task<IEnumerable<GenderWisePeopleAnalysisCount>> GenderWisePeopleCountAnalysisData(string deviceId, DateTime startdate, DateTime enddate, int channel, int[]? peopleLineIndex = null, int intervalMinutes = 10)
        {
            var lineFilter = peopleLineIndex != null && peopleLineIndex.Any()
                    ? new BsonDocument("$in", new BsonArray { "$$line.lineIndex", new BsonArray(peopleLineIndex) })
                    : new BsonDocument();

            var pipeline = new List<BsonDocument>
            {
                // Match documents
                new BsonDocument("$match", new BsonDocument
                {
                    { "deviceId", new ObjectId(deviceId) },
                    { "createdOn", new BsonDocument { { "$gte", startdate }, { "$lte", enddate } } },
                    { "channelNo", channel }
                }),

                // Create 10-min interval bucket
                new BsonDocument("$addFields", new BsonDocument("bucketTime", new BsonDocument("$add", new BsonArray
                {
                    BsonValue.Create(startdate),
                    new BsonDocument("$multiply", new BsonArray
                    {
                        new BsonDocument("$floor", new BsonDocument("$divide", new BsonArray
                        {
                            new BsonDocument("$subtract", new BsonArray { "$createdOn", BsonValue.Create(startdate) }),
                            1000 * 60 * intervalMinutes
                        })),
                        1000 * 60 * intervalMinutes
                    })
                }))),

                // Project: sum counts per document (matching lines only)
                new BsonDocument("$project", new BsonDocument
                {
                    { "bucketTime", 1 },
                    {
                        "maleCount", new BsonDocument("$sum", new BsonDocument("$map", new BsonDocument
                        {
                            { "input", new BsonDocument("$filter", new BsonDocument
                                {
                                    { "input", "$lines" },
                                    { "as", "line" },
                                    { "cond", peopleLineIndex != null && peopleLineIndex.Any() ? lineFilter : new BsonDocument() }
                                })
                            },
                            { "as", "line" },
                            { "in", new BsonDocument("$sum", new BsonDocument("$map", new BsonDocument
                                {
                                    { "input", new BsonDocument("$ifNull", new BsonArray { "$$line.genderInfo", new BsonArray() }) },
                                    { "as", "gender" },
                                    { "in", new BsonDocument("$cond", new BsonArray
                                        {
                                            new BsonDocument("$eq", new BsonArray { "$$gender.GenderType", "Male" }),
                                            "$$gender.Count",
                                            0
                                        })
                                    }
                                }))
                            }
                        }))
                    },
                    {
                        "femaleCount", new BsonDocument("$sum", new BsonDocument("$map", new BsonDocument
                        {
                            { "input", new BsonDocument("$filter", new BsonDocument
                                {
                                    { "input", "$lines" },
                                    { "as", "line" },
                                    { "cond", peopleLineIndex != null && peopleLineIndex.Any() ? lineFilter : new BsonDocument() }
                                })
                            },
                            { "as", "line" },
                            { "in", new BsonDocument("$sum", new BsonDocument("$map", new BsonDocument
                                {
                                    { "input", new BsonDocument("$ifNull", new BsonArray { "$$line.genderInfo", new BsonArray() }) },
                                    { "as", "gender" },
                                    { "in", new BsonDocument("$cond", new BsonArray
                                        {
                                            new BsonDocument("$eq", new BsonArray { "$$gender.GenderType", "Female" }),
                                            "$$gender.Count",
                                            0
                                        })
                                    }
                                }))
                            }
                        }))
                    },
                    {
                        "unknownCount", new BsonDocument("$sum", new BsonDocument("$map", new BsonDocument
                        {
                            { "input", new BsonDocument("$filter", new BsonDocument
                                {
                                    { "input", "$lines" },
                                    { "as", "line" },
                                    { "cond", peopleLineIndex != null && peopleLineIndex.Any() ? lineFilter : new BsonDocument() }
                                })
                            },
                            { "as", "line" },
                            { "in", new BsonDocument("$sum", new BsonDocument("$map", new BsonDocument
                                {
                                    { "input", new BsonDocument("$ifNull", new BsonArray { "$$line.genderInfo", new BsonArray() }) },
                                    { "as", "gender" },
                                    { "in", new BsonDocument("$cond", new BsonArray
                                        {
                                            new BsonDocument("$eq", new BsonArray { "$$gender.GenderType", "Unknown" }),
                                            "$$gender.Count",
                                            0
                                        })
                                    }
                                }))
                            }
                        }))
                    }
                }),

                // Group by 10-min interval: take MAX of each gender count
                new BsonDocument("$group", new BsonDocument
                {
                    { "_id", "$bucketTime" },
                    { "maxMaleCount", new BsonDocument("$max", "$maleCount") },
                    { "maxFemaleCount", new BsonDocument("$max", "$femaleCount") },
                    { "maxUnknownCount", new BsonDocument("$max", "$unknownCount") }
                }),

                // Sort by time
                new BsonDocument("$sort", new BsonDocument("_id", 1))
            };

            var docs = await dbEntity.Aggregate<BsonDocument>(pipeline).ToListAsync();

            return docs.Select(d => new GenderWisePeopleAnalysisCount
            {
                DateTime = d["_id"].ToUniversalTime(),
                MaleCount = d.GetValue("maxMaleCount", 0).ToInt32(),
                FemaleCount = d.GetValue("maxFemaleCount", 0).ToInt32(),
                UndefinedCount = d.GetValue("maxUnknownCount", 0).ToInt32()
            });
        }


        public async Task<PeopleVehicleInOutTotal> GetPeopleCountForReportAsync(DateTime startdate, DateTime enddate)
        {

            // Build the filter criteria for the query
            var filter = Builders<PeopleCount>.Filter.And(
                Builders<PeopleCount>.Filter.Gte(x => x.CreatedOn, startdate), // Filter by start date
                Builders<PeopleCount>.Filter.Lte(x => x.CreatedOn, enddate)   // Filter by end date
            );

            // Execute the aggregation query
            var result = await dbEntity.Aggregate()
                .Match(filter) // Apply the filter
                .Project(p => new
                {
                    CreatedOn = p.CreatedOn,
                    DateOnly = p.CreatedOn!.Value.Date, // Extract only the date portion
                    Lines = p.Lines // Include all lines
                })
                .SortByDescending(p => p.CreatedOn) // Sort by creation date in descending order
                .Match(p => p.Lines.Any(line => line.InCount > 0 || line.OutCount > 0)) // Keep only entries with non-zero count
                .Group(p => p.DateOnly, g => new
                {
                    Date = g.Key,
                    Latest = g.First() // Get the latest entry for each date
                })
                .Group(_ => true, g => new PeopleVehicleInOutTotal // Group all results into a single object
                {
                    TotalInCount = g.Sum(x => x.Latest.Lines.Sum(l => l.InCount)),
                    TotalOutCount = g.Sum(x => x.Latest.Lines.Sum(l => l.OutCount))
                })
                .FirstOrDefaultAsync(); // Get the single result

            // Return the result or a new empty object if null
            return result ?? new PeopleVehicleInOutTotal();
        }

        public async Task<IEnumerable<PeopleVehicleInOutAvgChart>>   PeopleInOutCountAnalysisAsync(string deviceId, DateTime startdate, DateTime enddate, int channel, int[]? peopleLineIndex, int intervalMinutes)
        {

            // Truncate start and end dates to remove seconds
            var truncatedStartDate = new DateTime(startdate.Year, startdate.Month, startdate.Day, startdate.Hour, startdate.Minute, 0);
            var truncatedEndDate = new DateTime(enddate.Year, enddate.Month, enddate.Day, enddate.Hour, enddate.Minute, 0);

            var pipeline = new List<BsonDocument>
            {
                // Match filter
                new BsonDocument("$match", new BsonDocument
                {
                    { "deviceId", new ObjectId(deviceId) },
                    { "createdOn", new BsonDocument {
                        { "$gte", startdate },
                        { "$lte", enddate }
                    }},
                    { "channelNo", channel }
                }),
            
                // Add field to truncate createdOn to minutes (remove seconds)
                new BsonDocument("$addFields", new BsonDocument("truncatedCreatedOn",
                    new BsonDocument("$dateFromParts", new BsonDocument
                    {
                        { "year", new BsonDocument("$year", "$createdOn") },
                        { "month", new BsonDocument("$month", "$createdOn") },
                        { "day", new BsonDocument("$dayOfMonth", "$createdOn") },
                        { "hour", new BsonDocument("$hour", "$createdOn") },
                        { "minute", new BsonDocument("$minute", "$createdOn") },
                        { "second", 0 } // Set seconds to 0
                    })
                )),

                // Calculate bucket time
                new BsonDocument("$addFields", new BsonDocument("bucketTime", new BsonDocument("$add", new BsonArray
                {
                    BsonValue.Create(truncatedStartDate),
                    new BsonDocument("$multiply", new BsonArray
                    {
                        new BsonDocument("$floor", new BsonDocument("$divide", new BsonArray
                        {
                            new BsonDocument("$subtract", new BsonArray
                            {
                                "$createdOn", BsonValue.Create(truncatedStartDate)
                            }),
                            1000 * 60 * intervalMinutes
                        })),
                        1000 * 60 * intervalMinutes
                    })
                }))),
            
            
                // Group by 10-min interval and average the utilization
                new BsonDocument("$project", new BsonDocument
                {
                    { "bucketTime", 1 },
                    { "createdOn", 1 },
                    { "inCount", new BsonDocument("$cond", new BsonArray
                    {
                        new BsonDocument("$and", new BsonArray
                        {
                            new BsonDocument("$isArray", "$lines"),
                            new BsonDocument("$gt", new BsonArray { new BsonDocument("$size", "$lines"), 0 }),
                            new BsonDocument("$gt", new BsonArray { peopleLineIndex?.Length ?? 0, 0 })
                        }),

                        new BsonDocument("$sum", new BsonDocument("$map", new BsonDocument
                        {
                            { "input", new BsonDocument("$filter", new BsonDocument
                                {
                                    { "input", "$lines" },
                                    { "as", "line" },
                                    { "cond", new BsonDocument("$in", new BsonArray {
                                        "$$line.lineIndex", new BsonArray(peopleLineIndex ?? Array.Empty<int>())
                                    })}
                                })
                            },
                            { "as", "line" },
                            { "in", new BsonDocument("$ifNull", new BsonArray { "$$line.inCount", 0 }) }
                        })),
                        0
                    }) },

                    { "outCount", new BsonDocument("$cond", new BsonArray
                    {
                        new BsonDocument("$and", new BsonArray
                        {
                            new BsonDocument("$isArray", "$lines"),
                            new BsonDocument("$gt", new BsonArray { new BsonDocument("$size", "$lines"), 0 }),
                            new BsonDocument("$gt", new BsonArray { peopleLineIndex?.Length ?? 0, 0 })
                        }),

                        new BsonDocument("$sum", new BsonDocument("$map", new BsonDocument
                        {
                            { "input", new BsonDocument("$filter", new BsonDocument
                                {
                                    { "input", "$lines" },
                                    { "as", "line" },
                                    { "cond", new BsonDocument("$in", new BsonArray {
                                        "$$line.lineIndex", new BsonArray(peopleLineIndex ?? Array.Empty<int>())
                                    })}
                                })
                            },
                            { "as", "line" },
                            { "in", new BsonDocument("$ifNull", new BsonArray { "$$line.outCount", 0 }) }
                        })),
                        0
                    }) }
                }),

                // 4. Group by bucketTime and get max inCount / outCount per 10-minute interval
                new BsonDocument("$group", new BsonDocument
                {
                    { "_id", "$bucketTime" },
                    { "maxInCount", new BsonDocument("$max", "$inCount") },
                    { "maxOutCount", new BsonDocument("$max", "$outCount") }
                }),

                // 5. Sort by time
                new BsonDocument("$sort", new BsonDocument("_id", 1))
            };

            var docs = await dbEntity.Aggregate<BsonDocument>(pipeline).ToListAsync();
            var result = docs.Select(doc => new PeopleVehicleInOutAvgChart
            {
                DateTime = doc["_id"].ToUniversalTime(),
                InCount = doc["maxInCount"].ToInt32(),
                OutCount = doc["maxOutCount"].ToInt32()
            });
            return result;
        }
    }
}
