using HanwhaClient.Infrastructure.Connection;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.Dto;
using MongoDB.Bson;
using MongoDB.Driver;

namespace HanwhaClient.Infrastructure.Repository
{
    public class MultiLaneVehicleCountRepository : RepositoryBase<MultiLaneVehicleCount>, IMultiLaneVehicleCountRepository
    {
        public MultiLaneVehicleCountRepository(MongoDbConnectionService mongoDbConnectionService) : base(mongoDbConnectionService, AppDBConstants.MultiLaneVehicleCount)
        {
        }

        public async Task<IEnumerable<VehicleTurningMovementResponse>> VehicleTurningMovementAnalysisData(string deviceId, DateTime startdate, DateTime enddate, int channel, int intervalMinute)
        {

            var pipeline = new List<BsonDocument>
            {
                // 1. Match relevant documents
                new BsonDocument("$match", new BsonDocument
                {
                    { "deviceId", new ObjectId(deviceId) },
                    { "createdOn", new BsonDocument { { "$gte", startdate }, { "$lte", enddate } } },
                    { "channelNo", channel }
                }),
            
                // 2. Add 10-minute bucket time
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
            
                // 3. Sort descending to get latest first within group
                new BsonDocument("$sort", new BsonDocument
                {
                    { "bucketTime", 1 },
                    { "createdOn", -1 }
                }),
            
                // 4. Group by bucket and get latest document
                new BsonDocument("$group", new BsonDocument
                {
                    { "_id", "$bucketTime" },
                    { "latest", new BsonDocument("$first", "$$ROOT") }
                }),
            
                // 5. Project summed counts by direction types
                new BsonDocument("$project", new BsonDocument
                {
                    { "bucketTime", "$_id" },
                    { "rightMaxCount", new BsonDocument("$sum", new BsonDocument("$map", new BsonDocument
                        {
                            { "input", "$latest.directionCount" },
                            { "as", "dir" },
                            { "in", new BsonDocument("$cond", new BsonArray
                                {
                                    new BsonDocument("$regexMatch", new BsonDocument
                                    {
                                        { "input", "$$dir.direction" },
                                        { "regex", "right" },
                                        { "options", "i" }
                                    }),
                                    "$$dir.count",
                                    0
                                })
                            }
                        }))
                    },
                    { "leftMaxCount", new BsonDocument("$sum", new BsonDocument("$map", new BsonDocument
                        {
                            { "input", "$latest.directionCount" },
                            { "as", "dir" },
                            { "in", new BsonDocument("$cond", new BsonArray
                                {
                                    new BsonDocument("$regexMatch", new BsonDocument
                                    {
                                        { "input", "$$dir.direction" },
                                        { "regex", "left" },
                                        { "options", "i" }
                                    }),
                                    "$$dir.count",
                                    0
                                })
                            }
                        }))
                    },
                    { "straightMaxCount", new BsonDocument("$sum", new BsonDocument("$map", new BsonDocument
                        {
                            { "input", "$latest.directionCount" },
                            { "as", "dir" },
                            { "in", new BsonDocument("$cond", new BsonArray
                                {
                                    new BsonDocument("$regexMatch", new BsonDocument
                                    {
                                        { "input", "$$dir.direction" },
                                        { "regex", "straight" },
                                        { "options", "i" }
                                    }),
                                    "$$dir.count",
                                    1
                                })
                            }
                        }))
                    }
                }),
            
                // 6. Sort results by time ascending
                new BsonDocument("$sort", new BsonDocument("bucketTime", 1))
            };

            var docs = await dbEntity.Aggregate<BsonDocument>(pipeline).ToListAsync();

            return docs.Select(doc => new VehicleTurningMovementResponse
            {
                DateTime = doc["bucketTime"].ToUniversalTime(),
                Right = doc["rightMaxCount"].AsInt32,
                Left = doc["leftMaxCount"].AsInt32,
                Straight = doc["straightMaxCount"].AsInt32
            }).ToList();
        }
    }
}
