using HanwhaClient.Model.DbEntities;

namespace HanwhaClient.Model.DeviceApiResponse
{
    public class VehicleRootObject
    {
        public IEnumerable<VehicleCountData> VehicleCount { get; set; }
    }

    public class MultiLaneCountingLiveResponse
    {
        public List<MultiLaneObjectCounting> countingLive { get; set; }
    }

    public class MultiLaneObjectCounting
    {
        public int Channel { get; set; }
        public List<MultiLaneChannelLine> CountingRules { get; set; }
    }

    public class MultiLaneChannelLine
    {
        public int Index { get; set; }
        public List<DirectionBasedResult> DirectionBasedResult { get; set; }
    }

    public class MultiLaneConfiguration
    {
        public IEnumerable<MultiLaneLines> Configurations { get; set; }
    }

    public class MultiLaneLines
    {
        public int Channel { get; set; }
        public bool Enable { get; set; }
        public IEnumerable<MultiLaneCountingRules> countingRules { get; set; }
    }

    public class MultiLaneCountingRules
    {
        public int Index { get; set; }
        public string Name { get; set; }
    }

}
