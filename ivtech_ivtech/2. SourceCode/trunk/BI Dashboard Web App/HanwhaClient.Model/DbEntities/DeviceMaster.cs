using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace HanwhaClient.Model.DbEntities
{
    public class DeviceMaster : BaseModel
    {
        public DeviceMaster()
        {
            // Initialize EventSources
            Features = new SunapiWiseModel();
        }
        [BsonElement("deviceType")]
        public string? DeviceType { get; set; }

        [BsonElement("deviceName")]
        public string? DeviceName { get; set; }

        [BsonElement("ipAddress")]
        public string? IpAddress { get; set; }

        [BsonElement("userName")]
        public string? UserName { get; set; }

        [BsonElement("password")]
        public string? Password { get; set; }

        [BsonElement("isHttps")]
        [BsonRepresentation(BsonType.Boolean)]
        public bool IsHttps { get; set; } = true;
        
        [BsonElement("location")]
        public string? Location { get; set; }

        [BsonElement("apiModel")]
        public string? APIModel { get; set; } // X,Q, T SUNAPI OR AI Box P Series WiseAPI

        [BsonElement("model")]
        public string? Model { get; set; }

        [BsonElement("serialNumber")]
        public string? SerialNumber { get; set; }

        [BsonElement("macAddress")]
        public string? MacAddress { get; set; }

        [BsonElement("channelEvent")]
        public IEnumerable<ChannelEvent>? ChannelEvent { get; set; }

        [BsonElement("peopleCount")]
        public IEnumerable<PeopleCountView>? PeopleCount { get; set; }

        [BsonElement("objectCountingConfiguration")]
        public IEnumerable<ChannelConfiguration>? ObjectCountingConfiguration { get; set; }

        [BsonElement("vehicleCount")]
        public IEnumerable<VehicleCountConfiguration>? VehicleCount { get; set; }

        [BsonElement("features")]
        public SunapiWiseModel? Features { get; set; }

        [BsonElement("isDefaultZone")]
        public bool isDefaultZone { get; set; } = true;

        [BsonElement("isOnline")]
        public bool IsOnline { get; set; } = false;

    }

    public class VehicleCountViewModel
    {
        public List<VehicleCountConfiguration>? VehicleCount { get; set; }
    }
    public class PeopleCountViewModel
    {
        public IEnumerable<PeopleCountView>? PeopleCount { get; set; }
    }
    public class ChannelEventViewModel
    {
        public List<ChannelEvent>? ChannelEvent { get; set; }
    }

    public class EventSourcesMotionViewModel
    {
        public List<EventSourcesMotion>? EventSources { get; set; }
    }


    public class SunapiWiseModel
    {
        [BsonElement("wiseAI")]
        public List<CapabilityConfiguration>? WiseAI { get; set; }

        [BsonElement("sunapi")]
        public List<EventSourcesMotion>? Sunapi { get; set; }
    }


    public class PeopleCountView
    {
        [BsonElement("channel")]
        public int Channel { get; set; }

        [BsonElement("masterName")]
        public string MasterName { get; set; }

        [BsonElement("enable")]
        public bool Enable { get; set; }

        [BsonElement("reportEnable")]
        public bool ReportEnable { get; set; }

        [BsonElement("reportFilename")]
        public string? ReportFilename { get; set; }

        [BsonElement("reportFileType")]
        public string? ReportFileType { get; set; }

        [BsonElement("calibrationMode")]
        public string? CalibrationMode { get; set; }

        [BsonElement("objectSizeCoordinate")]
        public List<Coordinate>? ObjectSizeCoordinate { get; set; }

        [BsonElement("lines")]
        public List<Lines>? Lines { get; set; }

        [BsonElement("areas")]
        public List<Areas>? Areas { get; set; }
    }

    public class Coordinate
    {
        [BsonElement("x")]
        public int X { get; set; }

        [BsonElement("y")]
        public int Y { get; set; }
    }

    public class Lines
    {
        [BsonElement("line")]
        public int line { get; set; }

        [BsonElement("index")]
        public int Index { get; set; }

        [BsonElement("mode")]
        public string Mode { get; set; }

        [BsonElement("name")]
        public string Name { get; set; }

        [BsonElement("enable")]
        public bool Enable { get; set; }

        [BsonElement("coordinates")]
        public List<Coordinate> Coordinates { get; set; }
    }

    public class Areas
    {
        [BsonElement("area")]
        public int Area { get; set; }

        [BsonElement("type")]
        public string? Type { get; set; }

        [BsonElement("coordinates")]
        public List<Coordinate>? Coordinates { get; set; }
    }

    public class AlarmInput
    {
        [BsonElement("inputs")]
        public Dictionary<string, bool> Inputs { get; set; }
    }

    public class AlarmOutput
    {
        [BsonElement("outputs")]
        public Dictionary<string, bool> Outputs { get; set; }
    }

    public class MotionDetectionRegions
    {
        [BsonElement("regions")]
        public Dictionary<string, bool> Regions { get; set; }
    }

    public class MotionDetectionRegionsLevel
    {
        [BsonElement("levels")]
        public Dictionary<string, int> Levels { get; set; }
    }

    public class DigitalAutoTracking
    {
        [BsonElement("profiles")]
        public Dictionary<string, bool> Profiles { get; set; }
    }

    public class AudioAnalytics
    {
        [BsonElement("scream")]
        public bool Scream { get; set; }

        [BsonElement("gunshot")]
        public bool Gunshot { get; set; }

        [BsonElement("explosion")]
        public bool Explosion { get; set; }

        [BsonElement("glassBreak")]
        public bool GlassBreak { get; set; }
    }

    public class WiseAI
    {
        [BsonElement("lineCrossing")]
        public bool LineCrossing { get; set; }

        [BsonElement("lineCrossingRules")]
        public Dictionary<string, bool> LineCrossingRules { get; set; }

        [BsonElement("ivaArea")]
        public bool IvaArea { get; set; }

        [BsonElement("ivaAreaRules")]
        public Dictionary<string, bool> IvaAreaRules { get; set; }

        [BsonElement("objectDetection")]
        public bool ObjectDetection { get; set; }

        [BsonElement("objectDetectionRules")]
        public Dictionary<string, bool> ObjectDetectionRules { get; set; }

        [BsonElement("stoppedVehicleDetection")]
        public bool StoppedVehicleDetection { get; set; }

        [BsonElement("stoppedVehicleDetectionRules")]
        public Dictionary<string, bool> StoppedVehicleDetectionRules { get; set; }

        [BsonElement("trafficJamDetection")]
        public bool TrafficJamDetection { get; set; }

        [BsonElement("trafficJamDetectionRules")]
        public Dictionary<string, bool> TrafficJamDetectionRules { get; set; }

        [BsonElement("vehicleQueueHigh")]
        public bool VehicleQueueHigh { get; set; }

        [BsonElement("vehicleQueueHighRules")]
        public Dictionary<string, bool> VehicleQueueHighRules { get; set; }

        [BsonElement("vehicleQueueMedium")]
        public bool VehicleQueueMedium { get; set; }

        [BsonElement("vehicleQueueMediumRules")]
        public Dictionary<string, bool> VehicleQueueMediumRules { get; set; }

        [BsonElement("pedestrianDetection")]
        public bool PedestrianDetection { get; set; }

        [BsonElement("pedestrianDetectionRules")]
        public Dictionary<string, bool> PedestrianDetectionRules { get; set; }

        [BsonElement("vehicleSpeedDetection")]
        public bool VehicleSpeedDetection { get; set; }

        [BsonElement("vehicleSpeedDetectionRules")]
        public Dictionary<string, bool> VehicleSpeedDetectionRules { get; set; }

        [BsonElement("wrongWayDetection")]
        public bool WrongWayDetection { get; set; }

        [BsonElement("wrongWayDetectionRules")]
        public Dictionary<string, bool> WrongWayDetectionRules { get; set; }

        [BsonElement("motionDetectionArea")]
        public bool MotionDetectionArea { get; set; }

        [BsonElement("motionDetectionAreaRules")]
        public Dictionary<string, bool> MotionDetectionAreaRules { get; set; }
    }

    public class OpenSDK
    {
        [BsonElement("wiseAI")]
        public WiseAI WiseAI { get; set; }
    }

    public class ChannelEvent
    {
        [BsonElement("channel")]
        public int Channel { get; set; }

        [BsonElement("connected")]
        public bool Connected { get; set; }

        [BsonElement("motionDetection")]
        public bool MotionDetection { get; set; }

        [BsonElement("motionDetectionRegions")]
        public MotionDetectionRegions MotionDetectionRegions { get; set; }

        [BsonElement("motionDetectionRegionsLevel")]
        public MotionDetectionRegionsLevel MotionDetectionRegionsLevel { get; set; }

        [BsonElement("tampering")]
        public bool Tampering { get; set; }

        [BsonElement("audioDetection")]
        public bool AudioDetection { get; set; }

        [BsonElement("defocusDetection")]
        public bool DefocusDetection { get; set; }

        [BsonElement("digitalAutoTracking")]
        public DigitalAutoTracking DigitalAutoTracking { get; set; }

        [BsonElement("audioAnalytics")]
        public AudioAnalytics AudioAnalytics { get; set; }

        [BsonElement("shockDetection")]
        public bool ShockDetection { get; set; }

        [BsonElement("openSDK")]
        public OpenSDK OpenSDK { get; set; }
    }

    //public class OpenSDKAppStatus
    //{
    //    [BsonElement("status")]
    //    public string Status { get; set; }

    //    [BsonElement("description")]
    //    public string Description { get; set; }
    //}

    public class SystemEvent
    {
        [BsonElement("timeChange")]
        public bool TimeChange { get; set; }

        [BsonElement("powerReboot")]
        public bool PowerReboot { get; set; }

        [BsonElement("fwUpdate")]
        public bool FWUpdate { get; set; }

        [BsonElement("factoryReset")]
        public bool FactoryReset { get; set; }

        [BsonElement("configurationBackup")]
        public bool ConfigurationBackup { get; set; }

        [BsonElement("configurationRestore")]
        public bool ConfigurationRestore { get; set; }

        [BsonElement("configChange")]
        public bool ConfigChange { get; set; }

        [BsonElement("sdFormat")]
        public bool SDFormat { get; set; }

        [BsonElement("sdFail")]
        public bool SDFail { get; set; }

        [BsonElement("sdFull")]
        public bool SDFull { get; set; }

        [BsonElement("sdInsert")]
        public bool SDInsert { get; set; }

        [BsonElement("sdRemove")]
        public bool SDRemove { get; set; }

        [BsonElement("nasConnect")]
        public bool NASConnect { get; set; }

        [BsonElement("nasDisconnect")]
        public bool NASDisconnect { get; set; }

        [BsonElement("nasFail")]
        public bool NASFail { get; set; }

        [BsonElement("nasFull")]
        public bool NASFull { get; set; }

        [BsonElement("nasFormat")]
        public bool NASFormat { get; set; }
    }

    //public class OpenSDK
    //{
    //    [BsonElement("wiseAI")]
    //    public WiseAI WiseAI { get; set; }
    //}

    //public class WiseAI
    //{
    //    [BsonElement("ivaArea")]
    //    public bool IvaArea { get; set; }

    //    [BsonElement("ivaAreaRules")]
    //    public Dictionary<string, bool> IvaAreaRules { get; set; }

    //    [BsonElement("lineCrossing")]
    //    public bool LineCrossing { get; set; }

    //    [BsonElement("lineCrossingRules")]
    //    public Dictionary<string, bool> LineCrossingRules { get; set; }

    //    [BsonElement("motionDetectionArea")]
    //    public bool MotionDetectionArea { get; set; }

    //    [BsonElement("motionDetectionAreaRules")]
    //    public Dictionary<string, bool> MotionDetectionAreaRules { get; set; }

    //    [BsonElement("objectDetection")]
    //    public bool ObjectDetection { get; set; }

    //    [BsonElement("objectDetectionRules")]
    //    public Dictionary<string, bool> ObjectDetectionRules { get; set; }
    //}

    public class OpenSDKAppStatus
    {
        [BsonElement("wiseAI")]
        public WiseAIStatus WiseAI { get; set; }
    }

    public class WiseAIStatus
    {
        [BsonElement("status")]
        public string Status { get; set; }

        [BsonElement("description")]
        public string Description { get; set; }
    }

    //public class SystemEvent
    //{
    //    [BsonElement("configChange")]
    //    public bool ConfigChange { get; set; }

    //    [BsonElement("fwUpdate")]
    //    public bool FWUpdate { get; set; }

    //    [BsonElement("timeChange")]
    //    public bool TimeChange { get; set; }
    //}

    public class DeviceInfo
    {
        public string? Model { get; set; }
        public string? SerialNumber { get; set; }
        public string? FirmwareVersion { get; set; }
        public string? BuildDate { get; set; }
        public string? WebURL { get; set; }
        public string? DeviceType { get; set; }
        public string? ConnectedMACAddress { get; set; }
        public string? ISPVersion { get; set; }
        public string? CGIVersion { get; set; }
        public string? ONVIFVersion { get; set; }
        public string? DeviceName { get; set; }
        public string? DeviceLocation { get; set; }
        public string? DeviceDescription { get; set; }
        public string? Memo { get; set; }
        public string? Language { get; set; }
        public string? PasswordStrength { get; set; }
        public string? FirmwareGroup { get; set; }
        public string? AIModelDetectionVersion { get; set; }
    }

    public class ObjectCountingConfigurationEntity
    {
        [BsonElement("objectCountingConfiguration")]
        public IEnumerable<ChannelConfiguration>? ObjectCountingConfiguration { get; set; }
    }

    public class ChannelConfiguration
    {
        [BsonElement("channel")]
        public int Channel { get; set; }

        [BsonElement("countingRules")]
        public List<CountingRule>? CountingRules { get; set; }
    }

    public class CountingRule
    {
        [BsonElement("enable")]
        public bool Enable { get; set; }

        [BsonElement("excludeAreas")]
        public List<object>? ExcludeAreas { get; set; }

        [BsonElement("index")]
        public int Index { get; set; }

        [BsonElement("lines")]
        public List<LineChannel>? Lines { get; set; }

        [BsonElement("objectType")]
        public string? ObjectType { get; set; }
    }

    public class LineChannel
    {
        [BsonElement("index")]
        public int Index { get; set; }

        [BsonElement("lineCoordinates")]
        public List<LineCoordinate>? LineCoordinates { get; set; }

        [BsonElement("mode")]
        public string? Mode { get; set; }

        [BsonElement("name")]
        public string? Name { get; set; }
    }

    public class LineCoordinate
    {
        [BsonElement("x")]
        public int X { get; set; }

        [BsonElement("y")]
        public int Y { get; set; }
    }
}
