using HanwhaClient.Infrastructure.Connection;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.Dto;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Driver;
using System.Linq;
using System.Threading.Channels;

namespace HanwhaClient.Infrastructure.Repository
{
    public class VehicleRepository : RepositoryBase<VehicleCount>, IVehicleRepository
    {
        private readonly IMongoCollection<ZoneCamera> zoneCameraMapCollection;
        public VehicleRepository(MongoDbConnectionService mongoDbConnectionService) : base(mongoDbConnectionService, AppDBConstants.VehicleCount)
        {
            zoneCameraMapCollection = mongoDbConnectionService.Database.GetCollection<ZoneCamera>("zoneCamera");
        }

        public async Task<IEnumerable<CameraCapacityUtilizationByDevice>> GetVehicleCameraCapacityUtilizationByDeviceAsync(string deviceId, DateTime startdate, DateTime enddate, TimeSpan timeOffSet, int channel, int[]? vehicleLineIndex = null)
        {
            var filters = Builders<VehicleCount>.Filter.And(
                        Builders<VehicleCount>.Filter.Eq(x => x.DeviceId, deviceId),
                        Builders<VehicleCount>.Filter.Gte(x => x.CreatedOn, startdate),
                        Builders<VehicleCount>.Filter.Lte(x => x.CreatedOn, enddate),
                        Builders<VehicleCount>.Filter.Eq(x => x.ChannelNo, channel));

            var filter = Builders<VehicleCount>.Filter.And(filters);
            var docs = await dbEntity.Aggregate()
                                      .Match(filter)
                                      .Project(p => new
                                      {
                                          CreatedOnWithOffset = timeOffSet != TimeSpan.Zero ? p.CreatedOn!.Value.Add(timeOffSet) : p.CreatedOn, // Add timezone offset if provided
                                          DateOnly = p.CreatedOn!.Value.Date, // Extract only the date portion
                                          VehicleCounts = p.VehicleCounts
                                      })
                                      .Group(x => new { deviceId, x.CreatedOnWithOffset!.Value.Date }, g => new
                                      {
                                          Id = g.Key.Date,
                                          MaxInCount = g.Max(z => z.VehicleCounts != null && z.VehicleCounts.Any() && vehicleLineIndex != null && vehicleLineIndex.Any() ? z.VehicleCounts
                                                        .SelectMany(vc => vc.Lines ?? Enumerable.Empty<VehicleLine>()).Where(l => vehicleLineIndex.Contains(l.LineIndex))
                                                        .Sum(l => l.InCount) : 0),
                                          MaxOutCount = g.Max(z => z.VehicleCounts != null && z.VehicleCounts.Any() && vehicleLineIndex != null && vehicleLineIndex.Any() ? z.VehicleCounts
                                                    .SelectMany(vc => vc.Lines ?? Enumerable.Empty<VehicleLine>()).Where(l => vehicleLineIndex.Contains(l.LineIndex))
                                                    .Sum(l => l.OutCount) : 0),
                                      }).ToListAsync();

            IEnumerable<CameraCapacityUtilizationByDevice> result = docs.Select(doc => new CameraCapacityUtilizationByDevice
            {
                DeviceId = deviceId,
                Date = doc.Id,
                UtilizationCount = doc.MaxInCount != null && doc.MaxOutCount != null  ? doc.MaxInCount - doc.MaxOutCount : 0
            });

            return result;
        }

        public async Task<List<PeopleVehicleCountSummary>> GetVehicleCountMinMaxAverageAsync(string deviceId, DateTime startdate, DateTime enddate, TimeSpan timeOffSet, int[]? peopleLineIndex = null, int channelNo = 0)
        {
            var filters = Builders<VehicleCount>.Filter.And(
                          Builders<VehicleCount>.Filter.Eq(x => x.DeviceId, deviceId), // Filter by device IDs
                          Builders<VehicleCount>.Filter.Gte(x => x.CreatedOn, startdate), // Filter by start date
                          Builders<VehicleCount>.Filter.Lte(x => x.CreatedOn, enddate), // Filter by end date
                          Builders<VehicleCount>.Filter.Eq(x => x.ChannelNo, channelNo));

            // Combine all filters into a single filter
            var filter = Builders<VehicleCount>.Filter.And(filters);

            var result = await dbEntity.Aggregate()
                                .Match(filter)
                                .Project(p => new
                                {
                                    CreatedOn = p.CreatedOn,
                                    DateOnly = p.CreatedOn!.Value.Date,
                                    Lines = p.VehicleCounts
                                                .SelectMany(vc => vc.Lines)
                                                .Where(line => peopleLineIndex.Contains(line.LineIndex))
                                                .ToList()
                                })
                                //.SortByDescending(p => p.CreatedOn)
                                .Project(p => new
                                {
                                    p.CreatedOn,
                                    CreatedOnWithOffset = timeOffSet != TimeSpan.Zero ? p.CreatedOn!.Value.Add(timeOffSet) : p.CreatedOn, 
                                    p.DateOnly,
                                    FlattenedLines = p.Lines

                                })
                                .Match(p => p.FlattenedLines.Any(line => line.InCount > 0 || line.OutCount > 0)) // 💡 Keep only entries with non-zero count
                                .Group(p => p.CreatedOnWithOffset!.Value.Date, g => new
                                {
                                    Date = g.Key,
                                    Latest = g.First(),
                                    TotalInCount = g.Max(x => x.FlattenedLines.Sum(l => l.InCount)),
                                    TotalOutCount = g.Max(x => x.FlattenedLines.Sum(l => l.OutCount))
                                })
                                .Project(p => new PeopleVehicleCountSummary
                                {
                                    Date = p.Date,
                                    TotalInCount = p.TotalInCount,
                                    TotalOutCount = p.TotalOutCount
                                }).ToListAsync();

            return result;
        }

        public async Task<List<VehicleByTypeCountWidgetData>> GetLatestVehicleCountDetails(FilterDefinition<VehicleCount> filter)
        {
            List<VehicleByTypeCountWidgetData> vehicleByTypeCountWidgetData = new List<VehicleByTypeCountWidgetData>();

            vehicleByTypeCountWidgetData = await dbEntity
                            .Find(filter)
                            .Project(x => new VehicleByTypeCountWidgetData
                            {
                                DeviceId = x.DeviceId,
                                VehicleCounts = x.VehicleCounts,
                                CreatedOn = x.CreatedOn
                            })
                            .ToListAsync();

            //var latestPerDayVehicleCount = vehicleByTypeCountWidgetData
            // .Where(vc => vc.CreatedOn != null)
            //.GroupBy(vc => new
            //{
            //    Date = vc.CreatedOn?.Date,
            //    DeviceId = vc.DeviceId
            //})
            //.Select(g => g.MaxBy(vc => vc.CreatedOn)).ToList();

            //return latestPerDayVehicleCount;

            var maxInCountPerDateDevice = vehicleByTypeCountWidgetData
                .Where(vc => vc.CreatedOn != null && vc.VehicleCounts != null)
                .GroupBy(vc => new
                {
                    Date = vc.CreatedOn.Value.Date,
                    vc.DeviceId
                })
                .Select(g => g
                    .OrderByDescending(v =>
                        (v.VehicleCounts)
                            .Sum(c =>
                                (c.Lines != null && c.Lines.Any())
                                    ? c.Lines.Max(line => line?.InCount ?? 0)
                                    : 0
                            )
                    )
                    .FirstOrDefault() 
                )
                .Where(x => x != null)
                .ToList();

            return maxInCountPerDateDevice;
        }

        //public async Task<List<PeopleCountRawDto>> GetAllVehicleChartDataAsync(string deviceIds, DateTime startdate, DateTime enddate, int[]? peopleLineIndex = null, int channelNo = 0)
        //{
        //    try
        //    {
        //        // Build the filter criteria for the query
        //        var filters = Builders<VehicleCount>.Filter.And(
        //                    Builders<VehicleCount>.Filter.Eq(x => x.DeviceId, deviceIds), // Filter by device IDs
        //                    Builders<VehicleCount>.Filter.Eq(x => x.ChannelNo, channelNo), // Filter by channel No
        //                    Builders<VehicleCount>.Filter.Gte(x => x.CreatedOn, startdate), // Filter by start date
        //                    Builders<VehicleCount>.Filter.Lt(x => x.CreatedOn, enddate)); // Filter by end date

        //        // Combine all filters into a single filter
        //        var filter = Builders<VehicleCount>.Filter.And(filters);

        //        var results = await dbEntity.Aggregate()
        //                            .Match(filter)
        //                            .Project(p => new PeopleCountRawDto
        //                            {
        //                                CreatedOn = p.CreatedOn,

        //                                VehicleLine = p.VehicleCounts
        //                                        .SelectMany(vc => vc.Lines)
        //                                        .Where(line => peopleLineIndex.Contains(line.LineIndex))
        //                                        .ToList()

        //                            })
        //                            .SortBy(p => p.CreatedOn)
        //                            .ToListAsync();
        //        return results;
        //    }
        //    catch (Exception ex)
        //    {
        //        var msg = ex.Message;
        //        throw;
        //    }
        //}

        public async Task<List<PeopleVehicleCountSummary>> GetAllVehicleChartDataAsync(
     string deviceIds, DateTime startdate, DateTime enddate, int[]? vehicleLineIndex = null, int channelNo = 0, int intervalMinute = 10)
        {
            try
            {
                // Truncate start and end dates to remove seconds
                var truncatedStartDate = new DateTime(startdate.Year, startdate.Month, startdate.Day, startdate.Hour, startdate.Minute, 0);
                var truncatedEndDate = new DateTime(enddate.Year, enddate.Month, enddate.Day, enddate.Hour, enddate.Minute, 0);

                var pipeline = new List<BsonDocument>
        {
            new BsonDocument("$match", new BsonDocument
            {
                { "deviceId", new ObjectId(deviceIds) },
                { "createdOn", new BsonDocument { { "$gte", startdate }, { "$lte", enddate } } },
                { "channelNo", channelNo }
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
        
            // Calculate bucket time using truncated date
            new BsonDocument("$addFields", new BsonDocument("bucketTime", new BsonDocument("$add", new BsonArray
            {
                BsonValue.Create(truncatedStartDate),
                new BsonDocument("$multiply", new BsonArray
                {
                    new BsonDocument("$floor", new BsonDocument("$divide", new BsonArray
                    {
                        new BsonDocument("$subtract", new BsonArray { "$truncatedCreatedOn", BsonValue.Create(truncatedStartDate) }),
                        1000 * 60 * intervalMinute
                    })),
                    1000 * 60 * intervalMinute
                })
            }))),
        
            // Extract inCount and outCount by flattening and filtering vehicleCounts
            new BsonDocument("$project", new BsonDocument
            {
                { "bucketTime", 1 },
                { "createdOn", 1 },
                { "inCount", new BsonDocument("$sum", new BsonDocument("$map", new BsonDocument
                    {
                        { "input", new BsonDocument("$filter", new BsonDocument
                            {
                                { "input", new BsonDocument("$reduce", new BsonDocument
                                    {
                                        { "input", "$vehicleCounts" },
                                        { "initialValue", new BsonArray() },
                                        { "in", new BsonDocument("$concatArrays", new BsonArray
                                            {
                                                "$$value",
                                                new BsonDocument("$ifNull", new BsonArray { "$$this.lines", new BsonArray() })
                                            })
                                        }
                                    })
                                },
                                { "as", "line" },
                                { "cond", new BsonDocument("$in", new BsonArray
                                    {
                                        "$$line.LineIndex",
                                        new BsonArray(vehicleLineIndex)
                                    })
                                }
                            })
                        },
                        { "as", "line" },
                        { "in", new BsonDocument("$ifNull", new BsonArray { "$$line.InCount", 0 }) }
                    })
                )},

                { "outCount", new BsonDocument("$sum", new BsonDocument("$map", new BsonDocument
                    {
                        { "input", new BsonDocument("$filter", new BsonDocument
                            {
                                { "input", new BsonDocument("$reduce", new BsonDocument
                                    {
                                        { "input", "$vehicleCounts" },
                                        { "initialValue", new BsonArray() },
                                        { "in", new BsonDocument("$concatArrays", new BsonArray
                                            {
                                                "$$value",
                                                new BsonDocument("$ifNull", new BsonArray { "$$this.lines", new BsonArray() })
                                            })
                                        }
                                    })
                                },
                                { "as", "line" },
                                { "cond", new BsonDocument("$in", new BsonArray
                                    {
                                        "$$line.LineIndex",
                                        new BsonArray(vehicleLineIndex)
                                    })
                                }
                            })
                        },
                        { "as", "line" },
                        { "in", new BsonDocument("$ifNull", new BsonArray { "$$line.OutCount", 0 }) }
                    })
                )}
            }),
        
            // Group by bucket and get the MAX of in/out count
            new BsonDocument("$group", new BsonDocument
            {
                { "_id", "$bucketTime" },
                { "maxInCount", new BsonDocument("$max", "$inCount") },
                { "maxOutCount", new BsonDocument("$max", "$outCount") }
            }),
        
            // Sort ascending
            new BsonDocument("$sort", new BsonDocument("_id", 1))
        };

                var aggregationResult = await dbEntity.Aggregate<BsonDocument>(pipeline).ToListAsync();

                var result = aggregationResult.Select(doc =>
                {
                    var bucketTime = doc.Contains("_id") && doc["_id"].IsBsonDateTime
                        ? doc["_id"].ToUniversalTime()
                        : DateTime.MinValue; // or fallback to createdOn

                    var hour = bucketTime.Hour;
                    var start = DateTime.Today.AddHours(hour);
                    var end = start.AddHours(1);

                    string FormatHour(DateTime dt) =>
                        dt.ToString("htt", System.Globalization.CultureInfo.InvariantCulture).ToLower().Replace("m", "m"); // e.g. "11am"

                    var hourRange = $"{FormatHour(start)} to {FormatHour(end)}";

                    return new PeopleVehicleCountSummary
                    {
                        TotalInCount = doc["maxInCount"].ToInt32(),
                        TotalOutCount = doc["maxOutCount"].ToInt32(),
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

        public async Task<List<VehicleByTypeChartSummary>> VehicleByTypeLineChartAsync(
    string deviceIds, DateTime startdate, DateTime enddate, int[]? vehicleLineIndex, int channelNo, int intervalMinute)
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
                        1000 * 60 * intervalMinute
                    })),
                    1000 * 60 * intervalMinute
                })
            }))),

            // 3. Sort to get latest records first within each bucket
            new BsonDocument("$sort", new BsonDocument
            {
                { "bucketTime", 1 }
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

            // 7. Project to extract individual vehicle type counts from "In" object
            new BsonDocument("$project", new BsonDocument
            {
                { "bucketTime", 1 },
                { "carCount", new BsonDocument("$cond", new BsonArray
                {
                    new BsonDocument("$and", new BsonArray
                    {
                        new BsonDocument("$isArray", "$vehicleCounts"),
                        new BsonDocument("$gt", new BsonArray { new BsonDocument("$size", "$vehicleCounts"), 0 }),
                        new BsonDocument("$gt", new BsonArray { vehicleLineIndex.Length, 0 })
                    }),
                    new BsonDocument("$sum", new BsonDocument("$map", new BsonDocument
                    {
                        { "input", new BsonDocument("$filter", new BsonDocument
                        {
                            { "input", new BsonDocument("$reduce", new BsonDocument
                            {
                                { "input", "$vehicleCounts" },
                                { "initialValue", new BsonArray() },
                                { "in", new BsonDocument("$concatArrays", new BsonArray
                                {
                                    "$$value",
                                    new BsonDocument("$ifNull", new BsonArray { "$$this.lines", new BsonArray() })
                                })
                                }
                            })
                            },
                            { "as", "line" },
                            { "cond", new BsonDocument("$in", new BsonArray { "$$line.LineIndex", new BsonArray(vehicleLineIndex) }) }
                        })
                        },
                        { "as", "line" },
                        { "in", new BsonDocument("$ifNull", new BsonArray { "$$line.In.Car", 0 }) }
                    })),
                    0
                }) },
                { "busCount", new BsonDocument("$cond", new BsonArray
                {
                    new BsonDocument("$and", new BsonArray
                    {
                        new BsonDocument("$isArray", "$vehicleCounts"),
                        new BsonDocument("$gt", new BsonArray { new BsonDocument("$size", "$vehicleCounts"), 0 }),
                        new BsonDocument("$gt", new BsonArray { vehicleLineIndex.Length, 0 })
                    }),
                    new BsonDocument("$sum", new BsonDocument("$map", new BsonDocument
                    {
                        { "input", new BsonDocument("$filter", new BsonDocument
                        {
                            { "input", new BsonDocument("$reduce", new BsonDocument
                            {
                                { "input", "$vehicleCounts" },
                                { "initialValue", new BsonArray() },
                                { "in", new BsonDocument("$concatArrays", new BsonArray
                                {
                                    "$$value",
                                    new BsonDocument("$ifNull", new BsonArray { "$$this.lines", new BsonArray() })
                                })
                                }
                            })
                            },
                            { "as", "line" },
                            { "cond", new BsonDocument("$in", new BsonArray { "$$line.LineIndex", new BsonArray(vehicleLineIndex) }) }
                        })
                        },
                        { "as", "line" },
                        { "in", new BsonDocument("$ifNull", new BsonArray { "$$line.In.Bus", 0 }) }
                    })),
                    0
                }) },
                { "truckCount", new BsonDocument("$cond", new BsonArray
                {
                    new BsonDocument("$and", new BsonArray
                    {
                        new BsonDocument("$isArray", "$vehicleCounts"),
                        new BsonDocument("$gt", new BsonArray { new BsonDocument("$size", "$vehicleCounts"), 0 }),
                        new BsonDocument("$gt", new BsonArray { vehicleLineIndex.Length, 0 })
                    }),
                    new BsonDocument("$sum", new BsonDocument("$map", new BsonDocument
                    {
                        { "input", new BsonDocument("$filter", new BsonDocument
                        {
                            { "input", new BsonDocument("$reduce", new BsonDocument
                            {
                                { "input", "$vehicleCounts" },
                                { "initialValue", new BsonArray() },
                                { "in", new BsonDocument("$concatArrays", new BsonArray
                                {
                                    "$$value",
                                    new BsonDocument("$ifNull", new BsonArray { "$$this.lines", new BsonArray() })
                                })
                                }
                            })
                            },
                            { "as", "line" },
                            { "cond", new BsonDocument("$in", new BsonArray { "$$line.LineIndex", new BsonArray(vehicleLineIndex) }) }
                        })
                        },
                        { "as", "line" },
                        { "in", new BsonDocument("$ifNull", new BsonArray { "$$line.In.Truck", 0 }) }
                    })),
                    0
                }) },
                { "motorcycleCount", new BsonDocument("$cond", new BsonArray
                {
                    new BsonDocument("$and", new BsonArray
                    {
                        new BsonDocument("$isArray", "$vehicleCounts"),
                        new BsonDocument("$gt", new BsonArray { new BsonDocument("$size", "$vehicleCounts"), 0 }),
                        new BsonDocument("$gt", new BsonArray { vehicleLineIndex.Length, 0 })
                    }),
                    new BsonDocument("$sum", new BsonDocument("$map", new BsonDocument
                    {
                        { "input", new BsonDocument("$filter", new BsonDocument
                        {
                            { "input", new BsonDocument("$reduce", new BsonDocument
                            {
                                { "input", "$vehicleCounts" },
                                { "initialValue", new BsonArray() },
                                { "in", new BsonDocument("$concatArrays", new BsonArray
                                {
                                    "$$value",
                                    new BsonDocument("$ifNull", new BsonArray { "$$this.lines", new BsonArray() })
                                })
                                }
                            })
                            },
                            { "as", "line" },
                            { "cond", new BsonDocument("$in", new BsonArray { "$$line.LineIndex", new BsonArray(vehicleLineIndex) }) }
                        })
                        },
                        { "as", "line" },
                        { "in", new BsonDocument("$ifNull", new BsonArray { "$$line.In.Motorcycle", 0 }) }
                    })),
                    0
                }) },
                { "bicycleCount", new BsonDocument("$cond", new BsonArray
                {
                    new BsonDocument("$and", new BsonArray
                    {
                        new BsonDocument("$isArray", "$vehicleCounts"),
                        new BsonDocument("$gt", new BsonArray { new BsonDocument("$size", "$vehicleCounts"), 0 }),
                        new BsonDocument("$gt", new BsonArray { vehicleLineIndex.Length, 0 })
                    }),
                    new BsonDocument("$sum", new BsonDocument("$map", new BsonDocument
                    {
                        { "input", new BsonDocument("$filter", new BsonDocument
                        {
                            { "input", new BsonDocument("$reduce", new BsonDocument
                            {
                                { "input", "$vehicleCounts" },
                                { "initialValue", new BsonArray() },
                                { "in", new BsonDocument("$concatArrays", new BsonArray
                                {
                                    "$$value",
                                    new BsonDocument("$ifNull", new BsonArray { "$$this.lines", new BsonArray() })
                                })
                                }
                            })
                            },
                            { "as", "line" },
                            { "cond", new BsonDocument("$in", new BsonArray { "$$line.LineIndex", new BsonArray(vehicleLineIndex) }) }
                        })
                        },
                        { "as", "line" },
                        { "in", new BsonDocument("$ifNull", new BsonArray { "$$line.In.Bicycle", 0 }) }
                    })),
                    0
                }) }
            })
        };

                var aggregationResult = await dbEntity.Aggregate<BsonDocument>(pipeline).ToListAsync();

                var result = aggregationResult.Select(doc =>
                {
                    var bucketTime = doc.Contains("bucketTime") && doc["bucketTime"].IsBsonDateTime
                        ? doc["bucketTime"].ToUniversalTime()
                        : DateTime.MinValue; // or fallback to createdOn

                    var hour = bucketTime.Hour;
                    var start = DateTime.Today.AddHours(hour);
                    var end = start.AddHours(1);

                    string FormatHour(DateTime dt) =>
                        dt.ToString("htt", System.Globalization.CultureInfo.InvariantCulture).ToLower().Replace("m", "m"); // e.g. "11am"

                    var hourRange = $"{FormatHour(start)} to {FormatHour(end)}";

                    return new VehicleByTypeChartSummary
                    {
                        CarInCount = doc["carCount"].ToInt32(),
                        BusInCount = doc["busCount"].ToInt32(),
                        TruckInCount = doc["truckCount"].ToInt32(),
                        MotorCycleInCount = doc["motorcycleCount"].ToInt32(),
                        BicycleInCount = doc["bicycleCount"].ToInt32(),
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



        public async Task<IEnumerable<CountAnalysisData>> VehicleCameraCapacityUtilizationAnalysisByZones(string deviceId, DateTime startdate, DateTime enddate, int channel, int[]? vehicleLineIndex = null, int intervalMinute = 10)
        {
            // Truncate start and end dates to remove seconds
            var truncatedStartDate = new DateTime(startdate.Year, startdate.Month, startdate.Day, startdate.Hour, startdate.Minute, 0);
            var truncatedEndDate = new DateTime(enddate.Year, enddate.Month, enddate.Day, enddate.Hour, enddate.Minute, 0);

            var pipeline = new List<BsonDocument>
            {
                // Match
                new BsonDocument("$match", new BsonDocument
                {
                    { "deviceId", new ObjectId(deviceId) },
                    { "createdOn", new BsonDocument {
                        { "$gt", startdate },
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

             // Calculate bucket time using truncated date
            new BsonDocument("$addFields", new BsonDocument("bucketTime", new BsonDocument("$add", new BsonArray
            {
                BsonValue.Create(truncatedStartDate),
                new BsonDocument("$multiply", new BsonArray
                {
                    new BsonDocument("$floor", new BsonDocument("$divide", new BsonArray
                    {
                        new BsonDocument("$subtract", new BsonArray { "$truncatedCreatedOn", BsonValue.Create(truncatedStartDate) }),
                        1000 * 60 * intervalMinute
                    })),
                    1000 * 60 * intervalMinute
                })
            }))),
        
                // Flatten and project utilization per doc
                new BsonDocument("$project", new BsonDocument
                {
                    { "bucketTime", 1 },
                    { "inCountPerDoc", new BsonDocument("$cond", new BsonArray
                    {
                        new BsonDocument("$and", new BsonArray
                        {
                            new BsonDocument("$isArray", "$vehicleCounts"),
                            new BsonDocument("$gt", new BsonArray { new BsonDocument("$size", "$vehicleCounts"), 0 }),
                            new BsonDocument("$gt", new BsonArray { vehicleLineIndex.Length, 0 })
                        }),
                        
                        new BsonDocument("$sum", new BsonDocument("$map", new BsonDocument
                        {
                            { "input", new BsonDocument("$filter", new BsonDocument
                                {
                                    { "input", new BsonDocument("$reduce", new BsonDocument
                                        {
                                            { "input", "$vehicleCounts" },
                                            { "initialValue", new BsonArray() },
                                            { "in", new BsonDocument("$concatArrays", new BsonArray
                                                {
                                                    "$$value",
                                                    new BsonDocument("$ifNull", new BsonArray { "$$this.lines", new BsonArray() })
                                                })
                                            }
                                        })
                                    },
                                    { "as", "line" },
                                    { "cond", new BsonDocument("$in", new BsonArray { "$$line.LineIndex", new BsonArray(vehicleLineIndex) }) }
                                })
                            },
                            { "as", "line" },
                            { "in", "$$line.InCount" }
                        })),
                        0
                    })
                },
                { "outCountPerDoc", new BsonDocument("$cond", new BsonArray
                {
                    new BsonDocument("$and", new BsonArray
                    {
                        new BsonDocument("$isArray", "$vehicleCounts"),
                        new BsonDocument("$gt", new BsonArray { new BsonDocument("$size", "$vehicleCounts"), 0 }),
                        new BsonDocument("$gt", new BsonArray { vehicleLineIndex.Length, 0 })
                    }),

                    new BsonDocument("$sum", new BsonDocument("$map", new BsonDocument
                    {
                        { "input", new BsonDocument("$filter", new BsonDocument
                            {
                                { "input", new BsonDocument("$reduce", new BsonDocument
                                    {
                                        { "input", "$vehicleCounts" },
                                        { "initialValue", new BsonArray() },
                                        { "in", new BsonDocument("$concatArrays", new BsonArray
                                            {
                                                "$$value",
                                                new BsonDocument("$ifNull", new BsonArray { "$$this.lines", new BsonArray() })
                                            })
                                        }
                                    })
                                },
                                { "as", "line" },
                                { "cond", new BsonDocument("$in", new BsonArray { "$$line.LineIndex", new BsonArray(vehicleLineIndex) }) }
                            })
                        },
                        { "as", "line" },
                        { "in", "$$line.OutCount" }
                    })),
                    0
                })}}),
            
                // Group by 10-min interval and calculate avg
                new BsonDocument("$group", new BsonDocument
                {
                    { "_id", "$bucketTime" },
                    { "maxInCount", new BsonDocument("$max", "$inCountPerDoc") },
                    { "maxOutCount", new BsonDocument("$max", "$outCountPerDoc") }
                }),

                new BsonDocument("$sort", new BsonDocument("_id", 1))
            };


            // Execute the aggregation pipeline
            var docs = await dbEntity.Aggregate<BsonDocument>(pipeline).ToListAsync();


            var result = docs.Select(doc => new CountAnalysisData
            {
                Count = (int)doc["maxInCount"] - (int)doc["maxOutCount"],
                DateTime = doc["_id"].ToUniversalTime()
            });
            return result;
        }

        public async Task<PeopleVehicleInOutTotal> GetVehicleCountForReportAsync(DateTime startDate, DateTime endDate)
        {
            var filter = Builders<VehicleCount>.Filter.And(
                Builders<VehicleCount>.Filter.Gte(x => x.CreatedOn, startDate),
                Builders<VehicleCount>.Filter.Lte(x => x.CreatedOn, endDate)
            );

            var result = await dbEntity.Aggregate()
                .Match(filter)
                .Project(p => new
                {
                    CreatedOn = p.CreatedOn,
                    DateOnly = p.CreatedOn!.Value.Date,
                    Lines = p.VehicleCounts
                                .SelectMany(vc => vc.Lines)
                                .ToList()
                })
                .SortByDescending(p => p.CreatedOn)
                .Project(p => new
                {
                    p.CreatedOn,
                    p.DateOnly,
                    FlattenedLines = p.Lines
                })
                .Match(p => p.FlattenedLines.Any(line => line.InCount > 0 || line.OutCount > 0))
                .Group(p => p.DateOnly, g => new
                {
                    Date = g.Key,
                    Latest = g.First()
                })
                .Project(p => new PeopleVehicleCountSummary
                {
                    Date = p.Date,
                    TotalInCount = p.Latest.FlattenedLines.Sum(l => l.InCount),
                    TotalOutCount = p.Latest.FlattenedLines.Sum(l => l.OutCount)
                }).ToListAsync();


            var total = new PeopleVehicleInOutTotal
            {
                TotalInCount = result.Sum(s => s.TotalInCount),
                TotalOutCount = result.Sum(s => s.TotalOutCount)
            };

            return total;
        }

    }

}
