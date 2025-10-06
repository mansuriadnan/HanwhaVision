namespace HanwhaClient.Model.DeviceApiResponse
{
    public class SunapiRootObject
    {
        public List<ChannelEventTrigger> ChannelEvent { get; set; }
    }

    public class ChannelEventTrigger
    {
        public int Channel { get; set; }
        public bool MotionDetection { get; set; }
        public Dictionary<string, bool> MotionDetectionRegions { get; set; }
        public Dictionary<string, int> MotionDetectionRegionsLevel { get; set; }
        public bool Tampering { get; set; }
        public bool DefocusDetection { get; set; }
        public ObjectDetectiondata ObjectDetection { get; set; }
    }


    public class ObjectDetectiondata
    {
        public bool ObjectDetection { get; set; }
        public ObjectTypes ObjectTypes { get; set; }
        public ObjectTypeDetails ObjectTypeDetails { get; set; }
    }

    public class ObjectTypes
    {
        public bool Person { get; set; }
        public bool Vehicle { get; set; }
    }

    public class ObjectTypeDetails
    {
        public bool Vehicle_Types_Bicycle { get; set; }
        public bool Vehicle_Types_Car { get; set; }
        public bool Vehicle_Types_Motorcycle { get; set; }
        public bool Vehicle_Types_Bus { get; set; }
        public bool Vehicle_Types_Truck { get; set; }
    }

    public class WiseAiRootObject
    {
        public List<EventStatus> EventStatus { get; set; }
    }

    public class EventStatus
    {
        public string EventName { get; set; }
        public DateTime Time { get; set; }
        public Source Source { get; set; }
        public Data Data { get; set; }
    }

    public class Source
    {
        public int Channel { get; set; }
        public int? SourceID { get; set; }
        public int? ROIID { get; set; }
        public int? Profile { get; set; }
        public string AppName { get; set; }
        public string AppID { get; set; }
        public string AppEvent { get; set; }
        public string Type { get; set; }
        public int RuleIndex { get; set; }
        public string VideoSourceToken { get; set; }
        public string RuleName { get; set; }
    }

    public class Data
    {
        public bool State { get; set; }
        public int? Level { get; set; }
        public string Action { get; set; }
        public string ObjectId { get; set; }
        public string ClassTypes { get; set; }
        public string VehicleTypes { get; set; }
        public string ObjectIDs { get; set; }
        public double? Speed { get; set; }
        public int Count { get; set; }
    }


}
