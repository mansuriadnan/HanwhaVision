namespace HanwhaClient.Model.PeopleWidget
{
    public class GenderWisePeopleCounting
    {
        public string Gender { get; set; }
        public int Count { get; set; } = 0;
        public int MinCount { get; set; } = int.MaxValue;
        public DateTime? MinDate { get; set; }
        public int MaxCount { get; set; } = 0;
        public DateTime? MaxDate { get; set; }
    }

    public class GenderWisePeopleAnalysisCount
    {
        public DateTime DateTime { get; set; }
        public int MaleCount { get; set; } = 0;
        public int FemaleCount { get; set; } = 0;
        public int UndefinedCount { get; set; } = 0;

    }

    public class PeopleCountAggregatedDto
    {
        public DateTime Interval { get; set; }
        public int LineIndex { get; set; }
        public double AvgInCount { get; set; }
        public double AvgOutCount { get; set; }
    }
}