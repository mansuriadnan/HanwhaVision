using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace HanwhaClient.Model.DbEntities
{
    public class DeviceEvents : BaseModel
    {
        [BsonElement("eventName")]
        public string EventName { get; set; }

        [BsonElement("deviceId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? DeviceId { get; set; }

        [BsonElement("channelNo")]
        public int? ChannelNo { get; set; }

        [BsonElement("deviceTime")]
        public DateTime? DeviceTime { get; set; }

        [BsonElement("ruleIndex")]
        public int? RuleIndex { get; set; }

        [BsonElement("ruleName")]
        public string RuleName { get; set; }

        [BsonElement("videoSourceToken")]
        public string VideoSourceToken { get; set; }

        [BsonElement("vehicleQueue")]
        public EventVehicleQueue? VehicleQueueData { get; set; }

        [BsonElement("peopleQueue")]
        public EventVehicleQueue? PeopleQueueData { get; set; }

        [BsonElement("ShoppingCartQueue")]
        public EventVehicleQueue? ShoppingCartQueue { get; set; }

        [BsonElement("forkLiftQueue")]
        public EventVehicleQueue? ForkLiftQueue { get; set; }

        [BsonElement("slipFallDetection")]
        public EventVehicleQueue? SlipFallDetection { get; set; }

        [BsonElement("wrongWayDetection")]
        public EventVehicleQueue? WrongWayDetection { get; set; }
        
        [BsonElement("pedestrianDetection")]
        public EventVehicleQueue? PedestrianDetection { get; set; }

        [BsonElement("blockedExitDetection")]
        public EventVehicleQueue? BlockedExitDetection { get; set; }

        [BsonElement("vehicleSpeedDetection")]
        public VehicleSpeedDetection? VehicleSpeedDetection { get; set; }

        [BsonElement("trafficJamDetection")]
        public EventVehicleQueue? TrafficJamDetection { get; set; }

        [BsonElement("stoppedVehicleByType")]
        public StoppedVehicleByType? StoppedVehicleByType { get; set; }

        [BsonElement("proximityDetection")]
        public EventVehicleQueue? ProximityDetection { get; set; }

        [BsonElement("forkliftSpeedDetection")]
        public VehicleSpeedDetection? ForkliftSpeedDetection { get; set; }

        [BsonElement("faceMaskDetection")]
        public EventVehicleQueue? FaceMaskDetection { get; set; }
        public bool IsAcknowledged { get; set; } = false;
    }

    public class VehicleSpeedDetection
    {
        [BsonElement("speed")]
        public double Speed { get; set; }

        [BsonElement("state")]
        public bool State { get; set; }
    }

    public class EventVehicleQueue
    {
        [BsonElement("state")]
        public bool State { get; set; }

        
    }

    public class StoppedVehicleByType
    {
        [BsonElement("state")]
        public bool State { get; set; }
        
        [BsonElement("vehicleType")]
        public String VehicleType { get; set; }
    }
}
