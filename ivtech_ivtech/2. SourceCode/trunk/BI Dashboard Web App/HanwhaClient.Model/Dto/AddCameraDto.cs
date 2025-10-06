namespace HanwhaClient.Model.Dto
{
    public class AddCameraDto
    {
        public UploadedFileDto UploadedFile { get; set; }
        public Dictionary<string, List<PolygonPointDto>> Polygons { get; set; }
        public List<CameraDto> Cameras { get; set; }
    }

    public class UploadedFileDto
    {
        public string Name { get; set; }
        public string Type { get; set; }
        public string Base64Data { get; set; }
    }

    public class PolygonPointDto
    {
        public double X { get; set; }
        public double Y { get; set; }
    }
}
