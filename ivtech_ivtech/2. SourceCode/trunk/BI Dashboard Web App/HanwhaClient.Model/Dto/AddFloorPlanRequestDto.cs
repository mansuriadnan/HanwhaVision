using HanwhaClient.Model.DbEntities;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Model.Dto
{

    public class AddFloorPlanRequestDto : BaseModel
    {
        public string? FloorId { get; set; }
        public string? FloorName { get; set; }
        public AddFloorPlanRequestDto()
        {
            Polygons = new Dictionary<string, List<PolygonPoint>>();
            Cameras = new List<CameraDto>();
            ZoneDto = new List<ZoneDto>();
        }
        public UploadedFileCamera? UploadedFile { get; set; }
        public Dictionary<string, List<PolygonPoint>>? Polygons { get; set; }
        public List<CameraDto>? Cameras { get; set; }
        public List<ZoneDto> ZoneDto { get; set; }
    }

    public class UploadedFileCamera
    {
        public string Name { get; set; }
        public string Base64Data { get; set; }
    }

    public class PolygonPointNew
    {
        public double X { get; set; }
        public double Y { get; set; }
    }

    public class AddCamera
    {
        public string Id { get; set; }
        public PositionCamera Position { get; set; }
        public string Name { get; set; }
        public string Status { get; set; }
        public string IconBase64 { get; set; }
    }

    public class PositionCamera
    {
        public double X { get; set; }
        public double Y { get; set; }
    }


    public class AddZonePlanRequest
    {
        public string floorId { get; set; }
        public string ZoneId { get; set; }
        public IEnumerable<XyPosition> ZoneArea { get; set; }
        public IEnumerable<MappedDevices>? Devices { get; set; }
    }

    public class MappedDevices
    {
        public string DeviceId { get; set; }
        public string? DeviceName { get; set; }
        public string? IpAddress { get; set; }
        public string? DeviceType { get; set; }
        public string? ZoneCameraId { get; set; }
        public DPosition position { get; set; }
        public double fovlength { get; set; }
        public string fovcolor { get; set; }
        public int[]? peopleLineIndex { get; set; }
        public int[]? vehicleLineIndex { get; set; }
        public List<Lines>? PeopleLines { get; set; }
        public List<Lines>? VehicleLines { get; set; }
        public bool isSphere { get; set; }
        public int Channel { get; set; }
    }

    public class DPosition
    {
        public double x { get; set; }
        public double y { get; set; }
        public double angle { get; set; }
    }
}
