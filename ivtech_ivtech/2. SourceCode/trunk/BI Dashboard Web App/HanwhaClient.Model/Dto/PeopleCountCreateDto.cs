namespace HanwhaClient.Model.Dto
{
    public class PeopleCountCreateDto
    {
        public string? CameraId { get; set; }
        public string? CameraIP { get; set; }
        public List<LineDto> Lines { get; set; }
    }
}
