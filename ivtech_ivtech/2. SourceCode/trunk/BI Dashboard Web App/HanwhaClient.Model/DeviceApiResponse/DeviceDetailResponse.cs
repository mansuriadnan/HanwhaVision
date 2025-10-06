
namespace HanwhaClient.Model.DeviceApiResponse
{
    public class DeviceDetailResponse
    {
        public string Id { get; set; }
        public string IpAddress { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public string ApiModel { get; set; }
        public bool IsHttps { get; set; }
        public IEnumerable<PeopleWiseApiChannel> ChannelIndexList { get; set; }
    }

    public class PeopleWiseApiChannel
    {
        public int Channel { get; set; }
        public string IndexName { get; set; }
        public int LineIndex { get; set; }
        public int ChannelDataIndex { get; set; }
    }
}
