namespace HanwhaClient.Model.Dto
{
    public class AlexaRequest
    {
        public string? Dashboard { get; set; }
        public string? widget { get; set; }
    }

    public class AlexaCloseRequest
    {
        public string? CloseWidget { get; set; }
    }
}
