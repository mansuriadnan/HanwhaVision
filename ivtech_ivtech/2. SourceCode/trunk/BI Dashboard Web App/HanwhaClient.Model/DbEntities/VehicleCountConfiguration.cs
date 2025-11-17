using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Model.DbEntities
{
    public class VehicleCountConfiguration
    {
        [BsonElement("Channel")]
        public int Channel { get; set; }

        [BsonElement("MasterName")]
        public string MasterName { get; set; }

        [BsonElement("Enable")]
        public bool Enable { get; set; }

        [BsonElement("ReportEnable")]
        public bool ReportEnable { get; set; }

        [BsonElement("ReportFilename")]
        public string ReportFilename { get; set; }

        [BsonElement("ReportFileType")]
        public string ReportFileType { get; set; }

        [BsonElement("CalibrationMode")]
        public string CalibrationMode { get; set; }

        [BsonElement("ObjectSizeCoordinate")]
        public List<Coordinate> ObjectSizeCoordinate { get; set; }

        [BsonElement("Lines")]
        public List<Lines>? Lines { get; set; }

        [BsonElement("Areas")]
        public List<Area> Areas { get; set; }
    }

    public class Area
    {
        [BsonElement("Area")]
        public int AreaNumber { get; set; }

        [BsonElement("Type")]
        public string Type { get; set; }

        [BsonElement("Coordinates")]
        public List<Coordinate> Coordinates { get; set; }
    }
}
