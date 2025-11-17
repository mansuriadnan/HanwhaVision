using Quartz;

namespace HanwhaClient.BackgroundTask
{
    public class ExampleJob : IJob
    {
        public Task Execute(IJobExecutionContext context)
        {
            Console.WriteLine($"Example job executed at: {DateTime.Now}");

            var jobName = context.JobDetail.Key.Name;
            var jobGroup = context.JobDetail.Key.Group;

            // Custom logic for the job execution
            Console.WriteLine($"Job {jobName} from group {jobGroup} executed at: {DateTime.Now}");
            return Task.CompletedTask;
        }
    }

    public class ExampleJob2 : IJob
    {
        public Task Execute(IJobExecutionContext context)
        {
            Console.WriteLine($"Example 2 job executed at: {DateTime.Now}");

            var jobName = context.JobDetail.Key.Name;
            var jobGroup = context.JobDetail.Key.Group;

            // Custom logic for the job execution
            Console.WriteLine($"Job {jobName} from group {jobGroup} executed at: {DateTime.Now}");
            return Task.CompletedTask;
        }
    }
}
