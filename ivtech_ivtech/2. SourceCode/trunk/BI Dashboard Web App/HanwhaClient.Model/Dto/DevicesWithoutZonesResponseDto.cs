using HanwhaClient.Model.DbEntities;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Model.Dto
{
    public class DevicesWithoutZonesResponseDto
    {
        public string? Id { get; set; }
        public string? DeviceName { get; set; }
        public string? DeviceType { get; set; }
        public string? Model { get; set; }
        public string IpAddress { get; set; }
        public List<ChannelLineDto>? PeopleLines { get; set; }
        public List<ChannelLineDto>? VehicleLines { get; set; }
        public IEnumerable<ChannelEventDto>? ChannelEvent { get; set; }
    }

    public class ChannelEventDto
    {
        public int Channel { get; set; }
        public bool Connected { get; set; }
        public bool MotionDetection { get; set; }
        public List<ChannelLineDto>? PeopleLines { get; set; }
        public List<ChannelLineDto>? VehicleLines { get; set; }
    }
    public class ChannelLineDto
    {
        public int line { get; set; }
        public int Index { get; set; }
        public string Mode { get; set; }
        public string Name { get; set; }
        public bool Enable { get; set; }
        public List<Coordinate> Coordinates { get; set; }
        public bool? IsMapped { get; set; }
        public string? ZoneName { get; set; }
    }

    public class DeviceInfo
    {
        public string Model { get; set; }
        public string SerialNumber { get; set; }
        public string FirmwareVersion { get; set; }
        public string BuildDate { get; set; }
        public string WebURL { get; set; }
        public string DeviceType { get; set; }
        public string ConnectedMACAddress { get; set; }
        public string ISPVersion { get; set; }
        public string CGIVersion { get; set; }
        public string ONVIFVersion { get; set; }
        public string DeviceName { get; set; }
        public string DeviceLocation { get; set; }
        public string DeviceDescription { get; set; }
        public string Memo { get; set; }
        public string Language { get; set; }
        public string PasswordStrength { get; set; }
        public string FirmwareGroup { get; set; }
        public string AIModelDetectionVersion { get; set; }
    }
}
