using HanwhaClient.Infrastructure.Connection;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.Dto;
using MongoDB.Bson;
using MongoDB.Driver;


namespace HanwhaClient.Infrastructure.Repository
{
    public class DeviceEventsRepository : RepositoryBase<DeviceEvents>, IDeviceEventsRepository
    {
        public DeviceEventsRepository(MongoDbConnectionService mongoDbConnectionService) : base(mongoDbConnectionService, AppDBConstants.DeviceEvents)
        {
        }

        public async Task<(IEnumerable<DeviceEventsLogsResponse> deviceDetails, int eventCount)> GetDeviceEventsLogsAsync(DeviceEventsLogsRequest request)
        {
            Console.WriteLine($"Querying from {request.FromDate} to {request.ToDate}");
            var pipeline = new List<BsonDocument>();

            // Optional filter
            var match = new BsonDocument();
            match.Add("isDeleted", false);
            if (request.FromDate.HasValue || request.ToDate.HasValue)            
            {
                var dateFilter = new BsonDocument();
                if (request.FromDate.HasValue)
                    dateFilter.Add("$gte", request.FromDate.Value);
                if (request.ToDate.HasValue)
                    dateFilter.Add("$lt", request.ToDate.Value.AddSeconds(1));
                match.Add("createdOn", dateFilter);
            }      

            if (match.ElementCount > 0)
                pipeline.Add(new BsonDocument("$match", match));
           
            pipeline.Add(BsonDocument.Parse(@"
            {
              $lookup: {
                from: 'zoneCamera',
                let: { deviceId: '$deviceId' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ['$deviceId', '$$deviceId'] },
                          { $eq: ['$isDeleted', false] }
                        ]
                      }
                    }
                  },
                  { $limit: 1 }
                ],
                as: 'zoneCamera'
              }
            }
            "));

            //// Unwind zoneCamera to deconstruct the array
            //pipeline.Add(new BsonDocument("$unwind", "$zoneCamera"));
            pipeline.Add(BsonDocument.Parse("{ $unwind: { path: \"$zoneCamera\", preserveNullAndEmptyArrays: true } }"));

            // Filter after lookup using zoneId[], floorId[], and status
            var postLookupMatch = new BsonDocument();

            if (request.EventNames != null && request.EventNames.Any())
            {
                postLookupMatch.Add("eventName", new BsonDocument("$in", new BsonArray(request.EventNames)));
            }

            //if (request.DeviceIds != null && request.DeviceIds.Any())
            //{
            //    var deviceIdsStrings = request.DeviceIds.Select(id => new ObjectId(id));
            //    postLookupMatch.Add("deviceId", new BsonDocument("$in", new BsonArray(deviceIdsStrings)));
            //}

            if (!string.IsNullOrEmpty(request.Status) && request.Status != "All")
            {
                bool acknowledged = request.Status.Equals("Acknowledged", StringComparison.OrdinalIgnoreCase);
                postLookupMatch.Add("IsAcknowledged", acknowledged);
            }
            var exprConditions = new BsonArray();
            if (request.FloorIds?.Any() == true)
            {
                //var floorObjectIds = new BsonArray(request.FloorIds.Select(id => new ObjectId(id)));

                //exprConditions.Add(new BsonDocument("$and", new BsonArray {
                //new BsonDocument("$in", new BsonArray { "$zoneCamera.floorId", floorObjectIds }),
                //new BsonDocument("$ne", new BsonArray { "$zoneCamera.floorId", BsonNull.Value })
                //}));
                var floorConditions = new BsonArray();

                var validFloorIds = request.FloorIds
                    .Where(id => ObjectId.TryParse(id, out var _) && id != "000000000000000000000000")
                    .Select(id => new ObjectId(id))
                    .ToList();

                if (validFloorIds.Any())
                {
                    floorConditions.Add(new BsonDocument(
                        "$in", new BsonArray { "$zoneCamera.floorId", new BsonArray(validFloorIds) }));
                }

                if (request.FloorIds.Contains("000000000000000000000000"))
                {
                    floorConditions.Add(new BsonDocument(
                        "$eq", new BsonArray {
                        new BsonDocument("$ifNull", new BsonArray { "$zoneCamera.floorId", BsonNull.Value }),
                        BsonNull.Value
                        }));
                }

                if (floorConditions.Any())
                {
                    exprConditions.Add(new BsonDocument("$or", floorConditions));
                }
            
            }

            if (request.ZoneIds?.Any() == true)
            {
                var zoneObjectIds = new BsonArray(request.ZoneIds.Select(id => new ObjectId(id)));

                exprConditions.Add(new BsonDocument("$and", new BsonArray {
                new BsonDocument("$in", new BsonArray { "$zoneCamera.zoneId", zoneObjectIds }),
                new BsonDocument("$ne", new BsonArray { "$zoneCamera.zoneId", BsonNull.Value })
            }));
            }

            if (exprConditions.Count > 0)
            {
                postLookupMatch.Add("$expr", new BsonDocument("$and", exprConditions));
            }

            if (postLookupMatch.ElementCount > 0)
                pipeline.Add(new BsonDocument("$match", postLookupMatch));

            //// Lookup Zone
            pipeline.Add(new BsonDocument("$lookup", new BsonDocument
            {
                { "from", "zoneMaster" },
                { "let", new BsonDocument("zoneId", "$zoneCamera.zoneId") },
                { "pipeline", new BsonArray
                {
                    new BsonDocument("$match", new BsonDocument
                    {
                        { "$expr", new BsonDocument("$and", new BsonArray
                            {
                                new BsonDocument("$eq", new BsonArray { "$_id", "$$zoneId" }),
                                new BsonDocument("$eq", new BsonArray { "$isDeleted", false })
                            })
                        }
                    }),
                    new BsonDocument("$project", new BsonDocument
                    {
                        { "_id", 1 },
                        { "zoneName", 1 }
                    })
                }
                },
                { "as", "zone" }
            }));

            pipeline.Add(new BsonDocument("$lookup", new BsonDocument
            {
                { "from", "floorPlanMaster" },
                { "let", new BsonDocument("floorId", "$zoneCamera.floorId") },
                { "pipeline", new BsonArray
                    {
                        new BsonDocument("$match", new BsonDocument
                        {
                            { "$expr", new BsonDocument("$and", new BsonArray
                                {
                                    new BsonDocument("$eq", new BsonArray { "$_id", "$$floorId" }),
                                    new BsonDocument("$eq", new BsonArray { "$isDeleted", false })
                                })
                            }
                        }),
                        new BsonDocument("$project", new BsonDocument
                        {
                            { "_id", 1 },
                            { "floorPlanName", 1 }
                        })
                    }
                },
                { "as", "floor" }
            }));

            pipeline.Add(BsonDocument.Parse("{ $unwind: { path: \"$zone\", preserveNullAndEmptyArrays: true } }"));
            pipeline.Add(BsonDocument.Parse("{ $unwind: { path: \"$floor\", preserveNullAndEmptyArrays: true } }"));

            //pipeline.Add(new BsonDocument("$match", new BsonDocument
            //{
            //    { "zone._id", new BsonDocument("$ne", BsonNull.Value) },
            //    { "floor._id", new BsonDocument("$ne", BsonNull.Value) }
            //}));

            if (request.SortBy == "isAcknowledged")
            {
                request.SortBy = "IsAcknowledged";
            }
            request.SortBy ??= "createdOn";
            request.SortOrder ??= -1;
            
            // $facet to split into two parallel pipelines
            pipeline.Add(new BsonDocument("$facet", new BsonDocument
            {
                    { "data", new BsonArray
                        {
                            //new BsonDocument("$replaceRoot", new BsonDocument("newRoot", "$doc")),
                            new BsonDocument("$sort", new BsonDocument(request.SortBy, request.SortOrder)),
                            new BsonDocument("$skip", (request.PageNumber - 1) * request.PageSize),
                            new BsonDocument("$limit", request.PageSize),
                            new BsonDocument("$project", new BsonDocument
                            {
                                {"_id", 1 },
                                { "createdOn", 1 },
                                { "eventName", 1 },
                                { "description", new BsonDocument("$concat", new BsonArray {
                                    new BsonDocument("$ifNull", new BsonArray { new BsonDocument("$toString", "$ruleIndex"), "" }),
                                    " - ",
                                    new BsonDocument("$ifNull", new BsonArray { "$ruleName", "" })
                                })},
                                { "zoneName", new BsonDocument("$ifNull", new BsonArray { "$zone.zoneName", "Default Zone" }) },
                                { "floorName", new BsonDocument("$ifNull", new BsonArray { "$floor.floorPlanName", "Default Floor" }) },
                                { "videoSourceToken", 1 },
                                { "IsAcknowledged", 1 }
                            })
                        }
                    },
                    { "totalCount", new BsonArray
                        {
                            //new BsonDocument("$replaceRoot", new BsonDocument("newRoot", "$doc")),
                            new BsonDocument("$count", "count")
                        }
                    }
            }));
            var result = await dbEntity.Aggregate<BsonDocument>(pipeline).FirstOrDefaultAsync();

            var data = result["data"].AsBsonArray.Select(doc =>
            {
                var d = doc.AsBsonDocument;
                string GetSafeString(string key, string defaultValue)
                {
                    return d.TryGetValue(key, out var value) && value.IsString
                        ? value.AsString
                        : defaultValue;
                }
                return new DeviceEventsLogsResponse
                {
                    Id = d.GetValue("_id", "").AsObjectId.ToString(),
                    EventName = d.GetValue("eventName", "").AsString,
                    EventDescription = d.GetValue("description", "").AsString,
                    CreatedOn = (DateTime)d.GetValue("createdOn", ""),
                    ZoneName = GetSafeString("zoneName", "Default Zone"),
                    FloorName = GetSafeString("floorName", "Default Floor"),
                    VideoLink = d.TryGetValue("videoSourceToken", out var tokenVal) && tokenVal.IsString
                                ? tokenVal.AsString
                                : "N/A",
                    IsAcknowledged = Convert.ToBoolean(d.GetValue("IsAcknowledged", false)),
                };
            }).ToList();
            int totalCount = result["totalCount"].AsBsonArray.FirstOrDefault()?.AsBsonDocument.GetValue("count", 0).AsInt32 ?? 0;
            return (data, totalCount);
        }

        public async Task<(IEnumerable<DeviceEvents> deviceDetails, int eventCount)>GetDeviceEventsLogsAsync1(DeviceEventsLogsRequest request)
        {
            var filters = new List<FilterDefinition<DeviceEvents>>();
            filters.Add(Builders<DeviceEvents>.Filter.And(
                        Builders<DeviceEvents>.Filter.In(x => x.DeviceId, request.DeviceIds),
                        Builders<DeviceEvents>.Filter.Gte(x => x.CreatedOn, request.FromDate),
                        Builders<DeviceEvents>.Filter.Lte(x => x.CreatedOn, request.ToDate)
                        ));


            if(request.EventNames != null && request.EventNames.Count() > 0)
            {
                filters.Add(Builders<DeviceEvents>.Filter.In(x => x.EventName, request.EventNames));
            }

            if(request.Status == "Acknowledged")
            {
                filters.Add(Builders<DeviceEvents>.Filter.Eq(x => x.IsAcknowledged, true));
            }
            else if(request.Status == "Pending")
            {
                filters.Add(Builders<DeviceEvents>.Filter.Eq(x => x.IsAcknowledged, false));
            }

            var finalFilter = filters.Any() ? Builders<DeviceEvents>.Filter.And(filters) : Builders<DeviceEvents>.Filter.Empty;
            string sortField = request.SortBy ?? "createdOn"; // default sort field
            bool sortDescending = request.SortOrder == -1;     // -1 = desc, 1 = asc

            var sortDefinition = sortDescending
                ? Builders<DeviceEvents>.Sort.Descending(sortField)
                : Builders<DeviceEvents>.Sort.Ascending(sortField);

            var data = await dbEntity.Find(finalFilter).Sort(sortDefinition).Skip((request.PageNumber - 1) * request.PageSize).Limit(request.PageSize).ToListAsync();
            int totalCount = (int) await dbEntity.CountDocumentsAsync(finalFilter);
            return (data, totalCount);
        }

        public async Task<bool> UpdateDeviceEventsStatusAsync(string id, string userId)
        {
            var filter = Builders<DeviceEvents>.Filter.Eq(e => e.Id, id);

            var update = Builders<DeviceEvents>.Update.Combine(
                    Builders<DeviceEvents>.Update.Set(e => e.IsAcknowledged, true),
                    Builders<DeviceEvents>.Update.Set(e => e.UpdatedBy, userId),
                    Builders<DeviceEvents>.Update.Set(e => e.UpdatedOn, DateTime.UtcNow)
                );

            var result = await dbEntity.UpdateOneAsync(filter, update);

            return result.ModifiedCount > 0;
        }

        public async Task<IEnumerable<EventQueueAnalysis>> PedestrianQueueAnalysisDataAsync(string deviceId, DateTime startdate, DateTime enddate, int channel, int IntervalMinute)
        {
            var pipeline = new[]
            {
                new BsonDocument("$match", new BsonDocument
                {
                    { "deviceId", new ObjectId(deviceId)  },
                    { "eventName", "OpenSDK.WiseAI.PedestrianDetection" },
                    { "createdOn", new BsonDocument {
                        { "$gte", startdate },
                        { "$lte", enddate }
                    }},
                    { "channelNo", channel },
                    { "$expr", new BsonDocument("$and", new BsonArray
                        {
                            new BsonDocument("$ne", new BsonArray { "$pedestrianDetection", BsonNull.Value }),
                            new BsonDocument("$eq", new BsonArray { "$pedestrianDetection.state", true })
                        })
                    }
                }),
                new BsonDocument("$project", new BsonDocument
                {
                    { "count", 1 },
                    { "createdOn", 1 },
                    { "bucketTime", new BsonDocument("$add", new BsonArray
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
                                    1000 * 60 * IntervalMinute
                                })),
                                1000 * 60 * IntervalMinute
                            })
                        })
                    }
                }),
                new BsonDocument("$group", new BsonDocument
                {
                    { "_id", "$bucketTime" },
                    { "OccurrenceCount", new BsonDocument("$sum", 1) }
                }),
                new BsonDocument("$sort", new BsonDocument("_id", 1))
            };

            var pipelineData = await dbEntity.Aggregate<BsonDocument>(pipeline).ToListAsync();

            var result = pipelineData.Select(g => new EventQueueAnalysis
            {
                DateTime = g["_id"].ToUniversalTime(),
                QueueCount = g["OccurrenceCount"].ToInt32(),
            }).ToList();
            return result;
        }

        public async Task<IEnumerable<EventQueueAnalysis>> ProxomityDetectionAnalysisDataAsync(string deviceId, DateTime startdate, DateTime enddate, int channel, int intervalMinute)
        {
            var pipeline = new[]
            {
                new BsonDocument("$match", new BsonDocument
                {
                    { "deviceId", new ObjectId(deviceId)  },
                    { "eventName", "OpenSDK.WiseAI.ProximityDetection" },
                    { "createdOn", new BsonDocument {
                        { "$gte", startdate },
                        { "$lte", enddate }
                    }},
                    { "channelNo", channel },
                    { "$expr", new BsonDocument("$and", new BsonArray
                        {
                            new BsonDocument("$ne", new BsonArray { "$proximityDetection", BsonNull.Value }),
                            new BsonDocument("$eq", new BsonArray { "$proximityDetection.state", true })
                        })
                    }
                }),
                new BsonDocument("$project", new BsonDocument
                {
                    { "count", 1 },
                    { "createdOn", 1 },
                    { "bucketTime", new BsonDocument("$add", new BsonArray
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
                        })
                    }
                }),
                new BsonDocument("$group", new BsonDocument
                {
                    { "_id", "$bucketTime" },
                    { "OccurrenceCount", new BsonDocument("$sum", 1) }
                }),
                new BsonDocument("$sort", new BsonDocument("_id", 1))
            };

            var pipelineData = await dbEntity.Aggregate<BsonDocument>(pipeline).ToListAsync();

            var result = pipelineData.Select(g => new EventQueueAnalysis
            {
                DateTime = g["_id"].ToUniversalTime(),
                QueueCount = g["OccurrenceCount"].ToInt32(),
            }).ToList();
            return result;
        }

        public async Task<IEnumerable<StoppedVehicleByTypeData>> StoppedVehicleByTypeAnalysisDataAsync(string deviceId, DateTime startdate, DateTime enddate, int channel, int intervalMinute)
        {
            var bucketIntervalMillis = 1000 * 60 * intervalMinute; // 10 minutes in milliseconds

            var pipeline = new[]
            {
                // 1. Match relevant documents
                new BsonDocument("$match", new BsonDocument
                {
                    { "deviceId", new ObjectId(deviceId) },
                    { "eventName", "OpenSDK.WiseAI.StoppedVehicleDetection" },
                    { "createdOn", new BsonDocument {
                        { "$gte", startdate },
                        { "$lte", enddate }
                    }},
                    { "channelNo", channel },
                    { "$expr", new BsonDocument("$ne", new BsonArray { "$stoppedVehicleByType", BsonNull.Value }) }
                }),

                // 2. Project vehicleType and bucketed time
                new BsonDocument("$project", new BsonDocument
                {
                    { "vehicleType", "$stoppedVehicleByType.vehicleType" },
                    { "bucketTime", new BsonDocument("$add", new BsonArray
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
                                    bucketIntervalMillis
                                })),
                                bucketIntervalMillis
                            })
                        })
                    }
                }),

                // 3. Group by vehicleType and bucketTime
                new BsonDocument("$group", new BsonDocument
                {
                    { "_id", new BsonDocument {
                        { "bucketTime", "$bucketTime" },
                        { "vehicleType", "$vehicleType" }
                    }},
                    { "OccurrenceCount", new BsonDocument("$sum", 1) }
                }),

                // 4. Sort by bucketTime and vehicleType
                new BsonDocument("$sort", new BsonDocument
                {
                    { "_id.bucketTime", 1 },
                    { "_id.vehicleType", 1 }
                })
            };

            // Execute the aggregation pipeline
            var pipelineData = await dbEntity.Aggregate<BsonDocument>(pipeline).ToListAsync();

            // Process the results into a structured format
            var result = pipelineData
                .GroupBy(g => g["_id"]["bucketTime"].ToUniversalTime()) // Group by bucketTime
                .Select(group => new StoppedVehicleByTypeData
                {
                    DateTime = group.Key, // The bucket time
                    Car = group.FirstOrDefault(g => g["_id"]["vehicleType"] == "Car")?.GetValue("OccurrenceCount", 0).ToInt32() ?? 0,
                    Bus = group.FirstOrDefault(g => g["_id"]["vehicleType"] == "Bus")?.GetValue("OccurrenceCount", 0).ToInt32() ?? 0,
                    Truck = group.FirstOrDefault(g => g["_id"]["vehicleType"] == "Truck")?.GetValue("OccurrenceCount", 0).ToInt32() ?? 0,
                    Motorcycle = group.FirstOrDefault(g => g["_id"]["vehicleType"] == "Motorcycle")?.GetValue("OccurrenceCount", 0).ToInt32() ?? 0,
                    Bicycle = group.FirstOrDefault(g => g["_id"]["vehicleType"] == "Cycle")?.GetValue("OccurrenceCount", 0).ToInt32() ?? 0
                })
                .ToList();

            return result;
        }


        public async Task<IEnumerable<EventQueueAnalysis>> VehicleSpeedViolationAnalysisDataAsync(string deviceId, DateTime startdate, DateTime enddate, int channel, int intervalMinute)
        {
            var pipeline = new[]
            {
                new BsonDocument("$match", new BsonDocument
                {
                    { "deviceId", new ObjectId(deviceId)  },
                    { "eventName", "OpenSDK.WiseAI.VehicleSpeedDetection" },
                    { "createdOn", new BsonDocument {
                        { "$gte", startdate },
                        { "$lte", enddate }
                    }},
                    { "channelNo", channel },
                    { "$expr", new BsonDocument("$and", new BsonArray
                        {
                            new BsonDocument("$ne", new BsonArray { "$vehicleSpeedDetection", BsonNull.Value }),
                            new BsonDocument("$eq", new BsonArray { "$vehicleSpeedDetection.state", true })
                        })
                    }
                }),
                new BsonDocument("$project", new BsonDocument
                {
                    { "count", 1 },
                    { "createdOn", 1 },
                    { "bucketTime", new BsonDocument("$add", new BsonArray
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
                        })
                    }
                }),
                new BsonDocument("$group", new BsonDocument
                {
                    { "_id", "$bucketTime" },
                    { "OccurrenceCount", new BsonDocument("$sum", 1) }
                }),
                new BsonDocument("$sort", new BsonDocument("_id", 1))
            };

            var pipelineData = await dbEntity.Aggregate<BsonDocument>(pipeline).ToListAsync();

            var result = pipelineData.Select(g => new EventQueueAnalysis
            {
                DateTime = g["_id"].ToUniversalTime(),
                QueueCount = g["OccurrenceCount"].ToInt32(),
            }).ToList();
            return result;
        }


        public async Task<IEnumerable<EventQueueAnalysis>> TrafficJamAnalysisDataAsync(string deviceId, DateTime startdate, DateTime enddate, int channel, int intervalMinute)
        {
            var pipeline = new[]
            {
                new BsonDocument("$match", new BsonDocument
                {
                    { "deviceId", new ObjectId(deviceId)  },
                    { "eventName", "OpenSDK.WiseAI.TrafficJamDetection" },
                    { "createdOn", new BsonDocument {
                        { "$gte", startdate },
                        { "$lte", enddate }
                    }},
                    { "channelNo", channel },
                    { "$expr", new BsonDocument("$and", new BsonArray
                        {
                            new BsonDocument("$ne", new BsonArray { "$trafficJamDetection", BsonNull.Value }),
                            new BsonDocument("$eq", new BsonArray { "$trafficJamDetection.state", true })
                        })
                    }
                }),
                new BsonDocument("$project", new BsonDocument
                {
                    { "count", 1 },
                    { "createdOn", 1 },
                    { "bucketTime", new BsonDocument("$add", new BsonArray
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
                        })
                    }
                }),
                new BsonDocument("$group", new BsonDocument
                {
                    { "_id", "$bucketTime" },
                    { "OccurrenceCount", new BsonDocument("$sum", 1) }
                }),
                new BsonDocument("$sort", new BsonDocument("_id", 1))
            };

            var pipelineData = await dbEntity.Aggregate<BsonDocument>(pipeline).ToListAsync();

            var result = pipelineData.Select(g => new EventQueueAnalysis
            {
                DateTime = g["_id"].ToUniversalTime(),
                QueueCount = g["OccurrenceCount"].ToInt32(),
            }).ToList();
            return result;
        }

        public async Task<IEnumerable<EventQueueAnalysis>> SlipFallQueueAnalysisDataAsync(string deviceId, DateTime startdate, DateTime enddate, int channel, int IntervalMinute)
        {
            var pipeline = new[]
            {
                new BsonDocument("$match", new BsonDocument
                {
                    { "deviceId", new ObjectId(deviceId)  },
                    { "eventName", "OpenSDK.WiseAI.SlipAndFallDetection" },
                    { "createdOn", new BsonDocument {
                        { "$gte", startdate },
                        { "$lte", enddate }
                    }},
                    { "channelNo", channel },
                    { "$expr", new BsonDocument("$and", new BsonArray
                        {
                            new BsonDocument("$ne", new BsonArray { "$slipFallDetection", BsonNull.Value }),
                            new BsonDocument("$eq", new BsonArray { "$slipFallDetection.state", true })
                        })
                    }
                }),
                new BsonDocument("$project", new BsonDocument
                {
                    { "count", 1 },
                    { "createdOn", 1 },
                    { "bucketTime", new BsonDocument("$add", new BsonArray
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
                                    1000 * 60 * IntervalMinute
                                })),
                                1000 * 60 * IntervalMinute
                            })
                        })
                    }
                }),
                new BsonDocument("$group", new BsonDocument
                {
                    { "_id", "$bucketTime" },
                    { "OccurrenceCount", new BsonDocument("$sum", 1) }
                }),
                new BsonDocument("$sort", new BsonDocument("_id", 1))
            };

            var pipelineData = await dbEntity.Aggregate<BsonDocument>(pipeline).ToListAsync();

            var result = pipelineData.Select(g => new EventQueueAnalysis
            {
                DateTime = g["_id"].ToUniversalTime(),
                QueueCount = g["OccurrenceCount"].ToInt32(),
            }).ToList();
            return result;
        }

        public async Task<IEnumerable<EventQueueAnalysis>> WrongWayQueueAnalysisDataAsync(string deviceId, DateTime startdate, DateTime enddate, int channel, int IntervalMinute)
        {
            var pipeline = new[]
            {
                new BsonDocument("$match", new BsonDocument
                {
                    { "deviceId", new ObjectId(deviceId)  },
                    { "eventName", "OpenSDK.WiseAI.WrongWayDetection" },
                    { "createdOn", new BsonDocument {
                        { "$gte", startdate },
                        { "$lte", enddate }
                    }},
                    {"ruleName", new BsonDocument("$not", new BsonDocument("$regex", new BsonRegularExpression("Uturn", "i")))},
                    { "channelNo", channel },
                    { "$expr", new BsonDocument("$and", new BsonArray
                        {
                            new BsonDocument("$ne", new BsonArray { "$wrongWayDetection", BsonNull.Value }),
                            new BsonDocument("$eq", new BsonArray { "$wrongWayDetection.state", true })
                        })
                    }
                }),
                new BsonDocument("$project", new BsonDocument
                {
                    { "count", 1 },
                    { "createdOn", 1 },
                    { "bucketTime", new BsonDocument("$add", new BsonArray
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
                                    1000 * 60 * IntervalMinute
                                })),
                                1000 * 60 * IntervalMinute
                            })
                        })
                    }
                }),
                new BsonDocument("$group", new BsonDocument
                {
                    { "_id", "$bucketTime" },
                    { "OccurrenceCount", new BsonDocument("$sum", 1) }
                }),
                new BsonDocument("$sort", new BsonDocument("_id", 1))
            };

            var pipelineData = await dbEntity.Aggregate<BsonDocument>(pipeline).ToListAsync();

            var result = pipelineData.Select(g => new EventQueueAnalysis
            {
                DateTime = g["_id"].ToUniversalTime(),
                QueueCount = g["OccurrenceCount"].ToInt32(),
            }).ToList();
            return result;
        }

        public async Task<IEnumerable<EventQueueAnalysis>> BlockedExitAnalysisDataAsync(string deviceId, DateTime startdate, DateTime enddate, int channel, int intervalMinute)
        {
            var pipeline = new[]
            {
                new BsonDocument("$match", new BsonDocument
                {
                    { "deviceId", new ObjectId(deviceId)  },
                    { "eventName", "OpenSDK.WiseAI.BlockedExitDetection" },
                    { "createdOn", new BsonDocument {
                        { "$gte", startdate },
                        { "$lte", enddate }
                    }},
                    { "channelNo", channel },
                    { "$expr", new BsonDocument("$and", new BsonArray
                        {
                            new BsonDocument("$ne", new BsonArray { "$blockedExitDetection", BsonNull.Value }),
                            new BsonDocument("$eq", new BsonArray { "$blockedExitDetection.state", true })
                        })
                    }
                }),
                new BsonDocument("$project", new BsonDocument
                {
                    { "count", 1 },
                    { "createdOn", 1 },
                    { "bucketTime", new BsonDocument("$add", new BsonArray
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
                        })
                    }
                }),
                new BsonDocument("$group", new BsonDocument
                {
                    { "_id", "$bucketTime" },
                    { "OccurrenceCount", new BsonDocument("$sum", 1) }
                }),
                new BsonDocument("$sort", new BsonDocument("_id", 1))
            };

            var pipelineData = await dbEntity.Aggregate<BsonDocument>(pipeline).ToListAsync();

            var result = pipelineData.Select(g => new EventQueueAnalysis
            {
                DateTime = g["_id"].ToUniversalTime(),
                QueueCount = g["OccurrenceCount"].ToInt32(),
            }).ToList();
            return result;
        }


        public async Task<IEnumerable<EventQueueAnalysis>> VehicleUTurnAnalysisDataAsync(string deviceId, DateTime startdate, DateTime enddate, int channel, int IntervalMinute)
        {
            var pipeline = new[]
            {
                new BsonDocument("$match", new BsonDocument
                {
                    { "deviceId", new ObjectId(deviceId) },
                    { "eventName", "OpenSDK.WiseAI.WrongWayDetection" },
                    { "createdOn", new BsonDocument {
                        { "$gte", startdate },
                        { "$lte", enddate }
                    }},
                    { "channelNo", channel },
                    { "ruleName", new BsonDocument(
                        "$regex", new BsonRegularExpression("uturn", "i")
                    )},
                    { "$expr", new BsonDocument("$and", new BsonArray
                        {
                            new BsonDocument("$ne", new BsonArray { "$wrongWayDetection", BsonNull.Value }),
                            new BsonDocument("$eq", new BsonArray { "$wrongWayDetection.state", true })
                        })
                    }
                }),
                new BsonDocument("$project", new BsonDocument
                {
                    { "count", 1 },
                    { "createdOn", 1 },
                    { "bucketTime", new BsonDocument("$add", new BsonArray
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
                                    1000 * 60 * IntervalMinute
                                })),
                                1000 * 60 * IntervalMinute
                            })
                        })
                    }
                }),
                new BsonDocument("$group", new BsonDocument
                {
                    { "_id", "$bucketTime" },
                    { "OccurrenceCount", new BsonDocument("$sum", 1) }
                }),
                new BsonDocument("$sort", new BsonDocument("_id", 1))
            };

            var pipelineData = await dbEntity.Aggregate<BsonDocument>(pipeline).ToListAsync();

            var result = pipelineData.Select(g => new EventQueueAnalysis
            {
                DateTime = g["_id"].ToUniversalTime(),
                QueueCount = g["OccurrenceCount"].ToInt32(),
            }).ToList();
            return result;
        }

        public async Task<IEnumerable<EventQueueAnalysis>> SpeedDetectionByVehicleAsync(string deviceId, DateTime startdate, DateTime enddate, int channel, int IntervalMinute)
        {
            var pipeline = new[]
            {
                new BsonDocument("$match", new BsonDocument
                {
                    { "deviceId", new ObjectId(deviceId)  },
                    { "eventName", "OpenSDK.WiseAI.VehicleSpeedDetection" },
                    { "createdOn", new BsonDocument {
                        { "$gte", startdate },
                        { "$lte", enddate }
                    }},
                    { "channelNo", channel },
                    { "$expr", new BsonDocument("$and", new BsonArray
                        {
                            new BsonDocument("$ne", new BsonArray { "$vehicleSpeedDetection", BsonNull.Value }),
                            new BsonDocument("$eq", new BsonArray { "$vehicleSpeedDetection.state", true })
                        })
                    }
                }),
                new BsonDocument("$project", new BsonDocument
                {
                    { "count", 1 },
                    { "createdOn", 1 },
                    { "bucketTime", new BsonDocument("$add", new BsonArray
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
                                    1000 * 60 * IntervalMinute
                                })),
                                1000 * 60 * IntervalMinute
                            })
                        })
                    }
                }),
                new BsonDocument("$group", new BsonDocument
                {
                    { "_id", "$bucketTime" },
                    { "OccurrenceCount", new BsonDocument("$sum", 1) }
                }),
                new BsonDocument("$sort", new BsonDocument("_id", 1))
            };

            var pipelineData = await dbEntity.Aggregate<BsonDocument>(pipeline).ToListAsync();

            var result = pipelineData.Select(g => new EventQueueAnalysis
            {
                DateTime = g["_id"].ToUniversalTime(),
                QueueCount = g["OccurrenceCount"].ToInt32(),
            }).ToList();
            return result;
        }

        public async Task<IEnumerable<EventQueueAnalysis>> ForkliftSpeedDetectionAnalysisAsync(string deviceId, DateTime startdate, DateTime enddate, int channel, int IntervalMinute)
        {
            var pipeline = new[]
            {
                new BsonDocument("$match", new BsonDocument
                {
                    { "deviceId", new ObjectId(deviceId)  },
                    { "eventName", "OpenSDK.WiseAI.ForkliftSpeedDetection" },
                    { "createdOn", new BsonDocument {
                        { "$gte", startdate },
                        { "$lte", enddate }
                    }},
                    { "channelNo", channel },
                    { "$expr", new BsonDocument("$and", new BsonArray
                        {
                            new BsonDocument("$ne", new BsonArray { "$forkliftSpeedDetection", BsonNull.Value }),
                            new BsonDocument("$eq", new BsonArray { "$forkliftSpeedDetection.state", true })
                        })
                    }
                }),
                new BsonDocument("$project", new BsonDocument
                {
                    { "count", 1 },
                    { "createdOn", 1 },
                    { "bucketTime", new BsonDocument("$add", new BsonArray
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
                                    1000 * 60 * IntervalMinute
                                })),
                                1000 * 60 * IntervalMinute  
                            })
                        })
                    }
                }),
                new BsonDocument("$group", new BsonDocument
                {
                    { "_id", "$bucketTime" },
                    { "OccurrenceCount", new BsonDocument("$sum", 1) }
                }),
                new BsonDocument("$sort", new BsonDocument("_id", 1))
            };

            var pipelineData = await dbEntity.Aggregate<BsonDocument>(pipeline).ToListAsync();

            var result = pipelineData.Select(g => new EventQueueAnalysis
            {
                DateTime = g["_id"].ToUniversalTime(),
                QueueCount = g["OccurrenceCount"].ToInt32(),
            }).ToList();
            return result;
        }
    }

}
