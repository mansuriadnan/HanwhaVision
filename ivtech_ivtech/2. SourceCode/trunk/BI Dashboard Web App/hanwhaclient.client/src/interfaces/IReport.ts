export interface IReport {
  id?: string;
  reportType: string;
  siteReport?: ISiteReport | null;
  zoneReport?: IZoneReport | null;
  createdOn?: string; // ISO date string
  updatedOn?: string; // ISO date string
  comperisionType?: string[]; // e.g., ["people", "vehicle"]
}

export interface ISiteReport {
  reportName: string;
  sitesIds: string[];
  startDate: string; // ISO date string
  endDate: string;   // ISO date string
}

export interface IZoneReport {
  reportName: string;
  siteId: string;
  floorIds: string[];
  zoneIds: string[];
  startDate: string; // ISO date string
  endDate: string;   // ISO date string
}

// types/ReportInterfaces.ts

export interface ReportHeader {
  reportType: string;
  reportName: string;
  sites: string;
  floors? : string;
  zones? : string;
  reportStartDate: string;
  reportEndDate: string;
}

export interface KeyPerformanceMetrics {
  totalPeopleCount: number;
  averagePeopleOccupancyRate: number;
  totalVehicleCount: number;
  averageVehicleOccupancyRate: number;
}

export interface PerformanceComparisonItem {
  siteZoneName: string;
  peopleCount: number;
  peopleOccupancy: number;
  peopleUtilization: number;
  vehicleCount: number;
  vehicleOccupancy: number;
  vehicleUtilization: number;
}

export interface PerformanceReport {
  reportHeader: ReportHeader;
  keyPerformanceMetrics: KeyPerformanceMetrics;
  performanceComparisonTable: PerformanceComparisonItem[];
  createdBy: string;
  createdOn: string;
}

export interface IPdfReportRequest {
  reportId?:string;
  svgData:{
      widgetName: string,
      svgData: string
    }[]
}
export interface PeopleVehicleChartRef {
    getSvgElement: () => SVGSVGElement | null;
}
export interface OccupancyChartRef {
    getSvgElement: () => SVGSVGElement | null;
}
export interface TrafficCompositionChartRef {
    getSvgElement: () => SVGSVGElement | null;
}

export interface ZoneDetailsRequest {
    siteId?:string;
    floorIds:string[]
}

