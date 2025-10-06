using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Model.DbEntities
{
    public class CapabilityConfiguration
    {
        [BsonElement("aiSettings")]
        public bool AiSettings { get; set; }

        [BsonElement("channel")]
        public int Channel { get; set; }

        [BsonElement("crowdcounting")]
        public bool CrowdCounting { get; set; }

        [BsonElement("dataserver")]
        public bool DataServer { get; set; }

        [BsonElement("facemaskdetection")]
        public bool FaceMaskDetection { get; set; }

        [BsonElement("frameMetaType")]
        public string FrameMetaType { get; set; }

        [BsonElement("heatmap")]
        public bool Heatmap { get; set; }

        [BsonElement("imagetransfer")]
        public bool ImageTransfer { get; set; }

        [BsonElement("imagetransferTypes")]
        public List<string> ImageTransferTypes { get; set; }

        [BsonElement("ivaarea")]
        public bool IvaArea { get; set; }

        [BsonElement("license")]
        public bool License { get; set; }

        [BsonElement("linecrossing")]
        public bool LineCrossing { get; set; }

        [BsonElement("maxResolution")]
        public Resolution MaxResolution { get; set; }

        [BsonElement("multilanevehiclecounting")]
        public bool MultiLaneVehicleCounting { get; set; }

        [BsonElement("objectcounting")]
        public bool ObjectCounting { get; set; }

        [BsonElement("objectcountingTypes")]
        public List<string> ObjectCountingTypes { get; set; }

        [BsonElement("objectdetection")]
        public bool ObjectDetection { get; set; }

        [BsonElement("pedestriandetection")]
        public bool PedestrianDetection { get; set; }

        [BsonElement("queuemanagement")]
        public bool QueueManagement { get; set; }

        [BsonElement("rotation")]
        public bool Rotation { get; set; }

        [BsonElement("sightmind")]
        public bool SightMind { get; set; }

        [BsonElement("slipAndFallDetection")]
        public bool SlipAndFallDetection { get; set; }

        [BsonElement("socialdistancing")]
        public bool SocialDistancing { get; set; }

        [BsonElement("stoppedvehicledetection")]
        public bool StoppedVehicleDetection { get; set; }

        [BsonElement("trafficjamdetection")]
        public bool TrafficJamDetection { get; set; }

        [BsonElement("vehicleheatmap")]
        public bool VehicleHeatmap { get; set; }

        [BsonElement("vehiclequeuemanagement")]
        public bool VehicleQueueManagement { get; set; }

        [BsonElement("vehiclespeeddetection")]
        public bool VehicleSpeedDetection { get; set; }

        [BsonElement("wisedetector")]
        public bool WiseDetector { get; set; }

        [BsonElement("wisedetectorMaxModels")]
        public int WiseDetectorMaxModels { get; set; }

        [BsonElement("wrongwaydetection")]
        public bool WrongWayDetection { get; set; }
    }

    public class Resolution
    {
        [BsonElement("height")]
        public int Height { get; set; }

        [BsonElement("width")]
        public int Width { get; set; }
    }

    public class CapabilitiesModel
    {
        [BsonElement("capabilities")]
        public List<CapabilityConfiguration> Capabilities { get; set; }
    }
}
