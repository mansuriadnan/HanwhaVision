using HanwhaClient.Model.DbEntities;
using MongoDB.Bson;
using System.ComponentModel;

namespace HanwhaClient.Model.Dto
{
    public class CameraDto
    {
        public string? Id { get; set; }
        public string? FloorId { get; set; }
        public string? ZoneId { get; set; }
        public string? CameraName { get; set; }
        public string? IconBase64 { get; set; }
        public PositionDto? Position { get; set; }
        public FieldOfViewDto? Fov { get; set; }
        public int[] LineIndex { get; set; } = [];
    }

    public class PositionDto
    {
        public double X { get; set; }
        public double Y { get; set; }
        public double? Angle { get; set; }
    }

    public class FieldOfViewDto
    {
        public double? Length { get; set; }
        public double? Width { get; set; }
        public string? Color { get; set; }
    }

    public class DeviceRequest
    {
        public string? Id { get; set; }
        public string? SearchText { get; set; }
        public int? PageSize { get; set; } = 10;
        public int? PageNo { get; set; } = 1;
        public List<string>? DeviceIds { get; set; }
        public string? SortBy { get; set; }
        public int? SortOrder { get; set; }
        public List<string>? ZonesDeviceIds { get; set; }
    }

    public class DeviceResponse
    {
        public int TotalCount { get; set; }
        public List<DeviceResponseDetail> DeviceDetails { get; set; }
    }

    public class DeviceResponseDetail
    {
        public string Id { get; set; }
        public string? DeviceName { get; set; }
        public string? Model { get; set; }
        public int ChannelNo { get; set; }
        public string? Location { get; set; }
        public string? SerialNumber { get; set; }
        public string? MacAddress { get; set; }
        public string?  DeviceType { get; set; }
        public string? IpAddress { get; set; }
        public string? UserName { get; set; }
        public string?  Password { get; set; }
        public string? DevicePort { get; set; }
        public bool? IsHttps { get; set; }
        public bool IsOnline { get; set; }
        public string ZoneNames { get; set; }
    }
}
