using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Model.Dto
{
    public class ReportDto
    {
        public ReportHeader? ReportHeader { get; set; }
        public KeyPerformanceMetrics? KeyPerformanceMetrics { get; set; }
        public List<PerformanceComparisonTable>? PerformanceComparisonTable { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public IEnumerable<string> ComperisionType { get; set; }
    }

    public class ReportHeader
    {
        public string ReportType { get; set; }
        public string ReportName { get; set; }
        public string Sites { get; set; }
        public string? Floors { get; set; }
        public string? Zones { get; set; }
        public DateTime? ReportStartDate { get; set; }
        public DateTime? ReportEndDate { get; set; }
    }

    public class KeyPerformanceMetrics
    {
        public int? TotalPeopleCount { get; set; }
        public int? AveragePeopleOccupancyRate { get; set; } // Storing as int for percentage
        public int? TotalVehicleCount { get; set; }
        public int? AverageVehicleOccupancyRate { get; set; } // Storing as int for percentage
    }

    public class PerformanceComparisonTable
    {
        public string SiteZoneName { get; set; }
        public int PeopleCount { get; set; }
        public double PeopleOccupancy { get; set; } // Storing as int for percentage
        public double PeopleUtilization { get; set; }
        public int VehicleCount { get; set; }
        public double VehicleOccupancy { get; set; } // Storing as int for percentage
        public double VehicleUtilization { get; set; }
    }
   
}
