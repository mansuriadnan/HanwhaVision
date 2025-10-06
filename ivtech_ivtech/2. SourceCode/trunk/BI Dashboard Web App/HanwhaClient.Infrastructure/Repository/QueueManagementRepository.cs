using HanwhaClient.Infrastructure.Connection;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.Dto;
using MongoDB.Bson;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace HanwhaClient.Infrastructure.Repository
{
    public class QueueManagementRepository : RepositoryBase<QueueManagement>, IQueueManagementRepository
    {
        public QueueManagementRepository(MongoDbConnectionService mongoDbConnectionService) : base(mongoDbConnectionService, AppDBConstants.QueueManagement)
        {

        }

        public async Task<IEnumerable<EventQueueAnalysis>> ForkliftQueueAnalysisDataAsync(string deviceId, DateTime startdate, DateTime enddate, int channel, int intervalMinute)
        {
            var pipeline = new[]
            {
                new BsonDocument("$match", new BsonDocument
                {
                    { "deviceId", new ObjectId(deviceId)  },
                    { "eventName", "OpenSDK.WiseAI.ForkliftQueueCountChanged" },
                    { "createdOn", new BsonDocument {
                        { "$gte", startdate },
                        { "$lte", enddate }
                    }},
                    { "channelNo", channel }
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
                    { "MaxCount", new BsonDocument("$max", "$count") }
                }),
                new BsonDocument("$sort", new BsonDocument("_id", 1))
            };

            var pipelineData = await dbEntity.Aggregate<BsonDocument>(pipeline).ToListAsync();

            var result = pipelineData.Select(g => new EventQueueAnalysis
            {
                DateTime = g["_id"].ToUniversalTime(),
                QueueCount = g["MaxCount"].ToInt32(),
            }).ToList();
            return result;
        }

        public async Task<IEnumerable<EventQueueAnalysis>> PeopleQueueAnalysisDataAsync(string deviceId, DateTime startdate, DateTime enddate, int channel, int intervalMinute)
        {
            var pipeline = new[]
            {
                new BsonDocument("$match", new BsonDocument
                {
                    { "deviceId", new ObjectId(deviceId)  },
                    { "eventName", "OpenSDK.WiseAI.QueueCountChanged" },
                    { "createdOn", new BsonDocument {
                        { "$gte", startdate },
                        { "$lte", enddate }
                    }},
                    { "channelNo", channel }
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
                    { "MaxCount", new BsonDocument("$max", "$count") }
                }),
                new BsonDocument("$sort", new BsonDocument("_id", 1))
            };

            var pipelineData = await dbEntity.Aggregate<BsonDocument>(pipeline).ToListAsync();

            var result = pipelineData.Select(g => new EventQueueAnalysis
            {
                DateTime = g["_id"].ToUniversalTime(),
                QueueCount = g["MaxCount"].ToInt32(),
            }).ToList();
            return result;
        }

        public async Task<IEnumerable<EventQueueAnalysis>> ShoppingQueueAnalysisDataAsync(string deviceId, DateTime startdate, DateTime enddate, int channel, int intervalMinute)
        {
            var pipeline = new[]
            {
                new BsonDocument("$match", new BsonDocument
                {
                    { "deviceId", new ObjectId(deviceId)  },
                    { "eventName", "OpenSDK.WiseAI.ShoppingCartQueueCountChanged" },
                    { "createdOn", new BsonDocument {
                        { "$gte", startdate },
                        { "$lte", enddate }
                    }},
                    { "channelNo", channel }
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
                    { "MaxCount", new BsonDocument("$max", "$count") }
                }),
                new BsonDocument("$sort", new BsonDocument("_id", 1))
            };

            var pipelineData = await dbEntity.Aggregate<BsonDocument>(pipeline).ToListAsync();

            var result = pipelineData.Select(g => new EventQueueAnalysis
            {
                DateTime = g["_id"].ToUniversalTime(),
                QueueCount = g["MaxCount"].ToInt32(),
            }).ToList();
            return result;
        }

        //This method return max queue in 10 min intervals of vehicle
        public async Task<IEnumerable<EventQueueAnalysis>> VehicleQueueAnalysisDataAsync(string deviceId, DateTime startdate, DateTime enddate, int channel, int IntervalMinute)
        {
            var pipeline = new[]
            {
                new BsonDocument("$match", new BsonDocument
                {
                    { "deviceId", new ObjectId(deviceId)  },
                    { "eventName", "OpenSDK.WiseAI.VehicleQueueCountChanged" },
                    { "createdOn", new BsonDocument {
                        { "$gte", startdate },
                        { "$lte", enddate }
                    }},
                    { "channelNo", channel }
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
                    { "MaxCount", new BsonDocument("$max", "$count") }
                }),
                new BsonDocument("$sort", new BsonDocument("_id", 1))
            };

            var pipelineData = await dbEntity.Aggregate<BsonDocument>(pipeline).ToListAsync();

            var result = pipelineData.Select(g => new EventQueueAnalysis
            {
                DateTime = g["_id"].ToUniversalTime(),
                QueueCount = g["MaxCount"].ToInt32(),
            }).ToList();
            return result;
        }

        
    }
}
