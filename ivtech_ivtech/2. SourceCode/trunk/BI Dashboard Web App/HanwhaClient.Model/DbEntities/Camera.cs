using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Model.DbEntities
{

    public class Camera : BaseModel
    {

        [BsonElement("UploadedFile")]
        public UploadedFile UploadedFile { get; set; }

        [BsonElement("Polygons")]
        public Dictionary<string, List<PolygonPoint>> Polygons { get; set; }

        [BsonElement("Cameras")]
        public List<CameraTest> Cameras { get; set; }
    }

    public class UploadedFile
    {
        [BsonElement("Name")]
        public string Name { get; set; }

        [BsonElement("Base64Data")]
        public string Base64Data { get; set; }
    }

    public class PolygonPoint
    {
        [BsonElement("X")]
        public double X { get; set; }

        [BsonElement("Y")]
        public double Y { get; set; }
    }

    public class CameraTest
    {
        [BsonElement("Id")]
        public string Id { get; set; }

        [BsonElement("Position")]
        public Position Position { get; set; }

        [BsonElement("Name")]
        public string Name { get; set; }

        [BsonElement("Status")]
        public string Status { get; set; }

        [BsonElement("IconBase64")]
        public string IconBase64 { get; set; }
    }

    public class Position
    {
        [BsonElement("X")]
        public double X { get; set; }

        [BsonElement("Y")]
        public double Y { get; set; }
    }
}
