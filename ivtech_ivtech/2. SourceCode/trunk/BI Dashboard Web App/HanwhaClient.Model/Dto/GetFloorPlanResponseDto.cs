
using HanwhaClient.Model.DbEntities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Nodes;
using System.Threading.Tasks;

namespace HanwhaClient.Model.Dto
{

    public class GetFloorPlanResponseDto : BaseModel
    {
        public GetFloorPlanResponseDto()
        {
            Polygons = new List<ZonePolygonPoint>();
            ZoneDto = new List<ZoneDto>();
        }
        public UploadedFloorFile? UploadedFile { get; set; }
        public List<ZonePolygonPoint>? Polygons { get; set; }
        public List<ZoneDto> ZoneDto { get; set; }
        public List<ZoneCameraDto> CameraDto { get; set; }

    }

    public class UploadedFloorFile
    {
        public string Name { get; set; }
        public string Base64Data { get; set; }
    }

    public class ZonePolygonPoint
    {
        public double X { get; set; }
        public double Y { get; set; }
    }

    public class ZoneCameraDto
    {
        public string Id { get; set; }
        public CameraPositionDto Position { get; set; }
        public FieldOfViewDto? Fov { get; set; }
        public string CameraName { get; set; }
        public string Icon { get; set; }
        public string status { get; set; }
        public string IconBase64 { get; set; }
        public string CameraId { get; set; }
    }

    public class CameraPositionDto
    {
        public double X { get; set; }
        public double Y { get; set; }
        public double? Angle { get; set; }
    }

}
