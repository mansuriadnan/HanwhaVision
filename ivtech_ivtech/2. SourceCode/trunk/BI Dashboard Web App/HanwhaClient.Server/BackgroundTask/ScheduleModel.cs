using HanwhaClient.Server.BackgroundTask;

namespace HanwhaClient.BackgroundTask
{
    public class ScheduledJob
    {
        public string JobName { get; set; }
        public string JobGroup { get; set; }
        public string CronSchedule { get; set; }    
        public int Priority { get; set; } = 5;
        public Type ScheduleType { get; set; }
    }

    public static class JobScheduler
    {
        public static List<ScheduledJob> GetScheduledJobs()
        {
            return new List<ScheduledJob>
            {
                new ScheduledJob
                {
                    JobName = "ExampleJob1",
                    JobGroup = "GroupName",
                    CronSchedule = "0/10 * * * * ?", // every 15 seconds
                    ScheduleType = typeof(ExampleJob)
                },
                new ScheduledJob
                {
                    JobName = "ExampleJob2",
                    JobGroup = "GroupName",
                    CronSchedule = "0/15 * * * * ?", // every 30 seconds
                    ScheduleType = typeof(ExampleJob)
                },
                new ScheduledJob
                {
                    JobName = "ExampleJob22",
                    JobGroup = "GroupName22",
                    CronSchedule = "0 2 18 * * ? *", // specific time, every day 06:02 PM
                    ScheduleType = typeof(ExampleJob2)
                },
                new ScheduledJob
                {
                    JobName = "PeopleCountJob",
                    JobGroup = "DeviceGroup",
                    CronSchedule = "0 0/2 * * * ?", // every 15 seconds
                    ScheduleType = typeof(PeopleCountJob)
                },
                new ScheduledJob
                {
                    JobName = "VehicleCountJob",
                    JobGroup = "VehicleGroup",
                    CronSchedule = "0 0/2 * * * ?", // every 15 seconds
                    ScheduleType = typeof(VehicleCountJob)
                },
                new ScheduledJob
                {
                    JobName = "DeviceStatus",
                    JobGroup = "DeviceStatus",
                    CronSchedule = "0 0/2 * * * ?", // every 15 seconds
                    ScheduleType = typeof(CheckDeviceStatusJob)
                },
                new ScheduledJob
                {
                    JobName = "ShoppingCartCount",
                    JobGroup = "ShoppingCartCount",
                    CronSchedule = "0 0/2 * * * ?", // every 15 seconds
                    ScheduleType = typeof(ShoppingCartCountJob)
                },
                new ScheduledJob
                {
                    JobName = "ForkliftCount",
                    JobGroup = "ForkliftCount",
                    CronSchedule = "0 0/2 * * * ?", // every 15 seconds
                    ScheduleType = typeof(ForkliftCountJob)
                },
                new ScheduledJob
                {
                    JobName = "MultiLaneVehicleCount",
                    JobGroup = "MultiLaneVehicleCount",
                    CronSchedule = "0 0/2 * * * ?", // every 15 seconds
                    ScheduleType = typeof(MultiLaneVehicleCountJob)
                },
                new ScheduledJob
                {
                    JobName = "CheckZoneOccupancy",
                    JobGroup = "CheckZoneOccupancy",
                    CronSchedule = "0 0/1 * * * ?", // every 15 seconds
                    ScheduleType = typeof(CheckZoneOccupancy)
                },
                new ScheduledJob
                {
                    JobName = "HeatMap",
                    JobGroup = "HeatMap",
                    CronSchedule = "0 0 0/4 * * ?", // every hours
                    ScheduleType = typeof(HeatMapJob)
                },
                new ScheduledJob
                {
                    JobName = "OperationalTiming",
                    JobGroup = "OperationalTiming",
                    CronSchedule = "0 0/5 * * * ?", // every 5 miniute
                    ScheduleType = typeof(ManageOperationalTimingJob)
                },
                new ScheduledJob
                {
                    JobName = "ReportScheduler",
                    JobGroup = "ReportScheduler",
                    CronSchedule = "0 0/5 * * * ?", // every 5 miniute
                    ScheduleType = typeof(ReportSchedulerJob)
                },
                
                // Add more jobs as needed
            };
        }
    }
}
