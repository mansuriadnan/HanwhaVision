namespace HanwhaClient.Model.DeviceApiResponse
{
    #region SUNAPI People Counting response    

    public class Line1
    {
        public int LineIndex { get; set; }
        public string Name { get; set; }
        public int InCount { get; set; }
        public int OutCount { get; set; }
    }

    public class PeopleCountChannel
    {
        public int Channel { get; set; }
        public List<Line1> Lines { get; set; }
    }

    public class PeopleCountResponse
    {
        public List<PeopleCountChannel> PeopleCount { get; set; }
    }

    #endregion

    #region WiseAI People Counting response

    public class ObjectCountingLiveResponse
    {
        public List<ObjectCountingLive> ObjectCountingLive { get; set; }
    }

    public class ObjectCountingLive
    {
        public int Channel { get; set; }
        public List<ChannelCountingRule> CountingRules { get; set; }
    }

    public class ChannelCountingRule
    {
        public int Index { get; set; }
        public List<ChannelLine> Lines { get; set; }
    }

    public class ChannelLine
    {
        public int Index { get; set; }
        public List<DirectionBasedResult> DirectionBasedResult { get; set; }
    }

    public class DirectionBasedResult
    {
        public int Count { get; set; }
        public string Direction { get; set; }
        public List<VehicleInfo> VehicleInfo { get; set; }
        public List<GenderAgeInfo> genderAgeInfo { get; set; }
    }

    public class VehicleInfo
    {
        public int Count { get; set; }
        public string VehicleType { get; set; }
    }

    public class GenderAgeInfo
    {
        public List<PeopleAge> Age { get; set; }
        public List<PeopleGender> Gender { get; set; }
    }

    public class PeopleAge
    {
        public string AgeType { get; set; }
        public int Count { get; set; }
    }

    public class PeopleGender
    {
        public string GenderType { get; set; }
        public int Count { get; set; }
    }

    public class ResetDeviceCountResponse
    {
        public string Response { get; set; }
    }

    #endregion
}
