import { SelectChangeEvent } from "@mui/material/Select";

export interface BottomchartDataType {
  MainTitle: string;
  Count: number;
  WidgetTitle1: string;
  WidgetColor1: string;
  WidgetTitle2: string;
  WidgetColor2: string;
}

export interface NewVisitorsDataTypes {
  timeInterval: string;
  newVisitors: number;
}

export interface NewVisitorsProps {
  newVisitorsData: NewVisitorsDataTypes[];
  Pwidth: number | null;
  Pheight: number | null;
}

export interface CapacityUtilizationDataTypes {
  value: number;
  name: string;
  maxCapacity: number;
}
export interface CapacityUtilizationPeopleDataTypes {
  utilization: number;
  percentage: number;
  // mostDayUtilization?: number | null;
  // leastDayUtilization?: number | null;
  utilizationMostLeastDay: UtilizationMostLeastDay;
  totalCapacity: number;
}
export interface UtilizationMostLeastDay {
  mostDayUtilization: number;
  mostDayUtilizationDay: string; // ISO date string
  leastDayUtilization: number;
  leastDayUtilizationDay: string; // ISO date string
}

export interface ZoneUtilizationData {
  zoneName: string;
  utilizationData: UtilizationEntry[];
}

export interface UtilizationEntry {
  dateTime: string; // ISO date string
  count: number;
}

export interface DateWiseUtilization {
  dateTime: string;
  totalCount: number;
}

export interface CapacityUtilizationAnanlysisProps {
  capacityUtilizationpPeopleData?: CapacityUtilizationPeopleDataTypes;
  DateWiseUtilization?: DateWiseUtilization[];
  customizedWidth?: number | string;
  customizedHeight?: number | string;
  startDate?: Date;
  endDate?: Date;
  displayName?: string;
  onZoomClick?: any;
  openZoomDialog?: boolean;
  floor?: string[];
  zones?: string[];
  setExportHandler?: (fn: (item: LayoutItem) => void) => void; // Now optional
  setIsDraggable?: (arg: boolean) => void;
}

// export interface CapacityUtilizationPeopleProps {
//   capacityUtilizationpPeopleData?: CapacityUtilizationPeopleDataTypes;
//   Pwidth?: number | string;
//   Pheight?: number | string;
//   size?: string;
//   expanded?: string;
//   floor?: string[];
//   zones?: string[];
//   selectedStartDate?: string;
//   selectedEndDate?: string;
//   displayName?: string;
//   onChangeWidgetName?: (widgetName: string) => void;
// }

export interface CapacityUtilizationProps {
  capacityUtilizationData: CapacityUtilizationDataTypes[];
  Pwidth: number | null;
  Pheight: number | null;
}

export interface slipAndfallDataTypes {
  Day: string;
  Count: number;
}

export interface slipAndfallProps {
  slipAndfallData: slipAndfallDataTypes[];
  Pwidth: number | null;
  Pheight: number | null;
}

export interface SafetyMeasureDataType {
  Count: number;
  Total: number;
  Type: string;
}

export interface SafetyMeasureProps {
  SafetyMeasureData: SafetyMeasureDataType[];
  Pwidth: number | null;
  Pheight: number | null;
}

export interface IdasboardDesignData {
  id: string | null;
  dashboardDesignjson: string;
}

export interface OccupancyDataType {
  time: string;
  occupancy: number[];
}

export interface OccupancyDataprops {
  OccupancyData: OccupancyDataType[];
  Pwidth: number | null;
  Pheight: number | null;
}

export interface CameraCountDataType {
  value: number;
  color: string;
  name: string;
  type?: string;
  maxCapacity: number;
  width?: number | string;
  height?: number | string;
}

export interface ProgressBarProps {
  label: string;
  percentage: number;
  count: number;
  total: number;
  color: string;
  Pwidth?: number;
  Pheight?: number;
}

export interface CameraCountDataprops {
  CameraCountData: CameraCountDataType[];
  Pwidth: number | null;
  Pheight: number | null;
}

export interface ICameraByFeature {
  objectdetection: number;
  pedestriandetection: number;
  queuemanagement: number;
  slipAndFallDetection: number;
  stoppedvehicledetection: number;
  trafficjamdetection: number;
  vehicleheatmap: number;
  vehiclequeuemanagement: number;
  vehiclespeeddetection: number;
  wrongwaydetection: number;
}

export interface IFeatureTypeData {
  featuresName: string;
  totalCount: number;
}

export interface IWidgetPayload {
  floorIds: string[];
  zoneIds?: string[];
  startDate: string;
  endDate: string;
  deviceId?: number | string;
  channel?: number;
  intervalMinute?: number;
}

export interface CameraByFeatureProps {
  CameraByFeatureData?: IFeatureTypeData[];
  customizedWidth: number;
  customizedHeight: number;
  size?: string;
  expanded?: string;
  floor?: string[];
  zones?: string[];
  selectedStartDate?: string;
  selectedEndDate?: string;
  displayName?: string;
  onZoomClick?: any;
  openZoomDialog?: boolean;
  setIsDraggable?: (arg: boolean) => void;
}
// export interface CameraByFeatureProps {
//   CameraByFeatureData: ICameraByFeature,
//   Pwidth: number | null,
//   Pheight: number | null
// }

export interface IDashboardNamePayload {
  dashboardName: string;
}

export interface IMonitoringNamePayload {
  monitoringName: string;
}

export interface IOnlineOfflineCameraData {
  totalCameraCount: number | null;
  onlineCameraCount: number | null;
  oflineCameraCount: number | null;
}

export interface CameraOnlineOfflineProps {
  OnlineOfflineCameraData?: IOnlineOfflineCameraData;
  customizedWidth: number;
  customizedHeight: number;
  size?: string;
  expanded?: string;
  floor?: string[];
  zones?: string[];
  selectedStartDate?: string;
  selectedEndDate?: string;
  displayName?: string;
  onZoomClick?: any;
  openZoomDialog?: boolean;
  setIsDraggable?: (arg: boolean) => void;
}

export interface ISeriesData {
  seriesName: string;
  totalCount: number;
}

export interface ModalTypesProps {
  modalTypesData?: ISeriesData[];
  customizedWidth: number;
  customizedHeight: number;
  size?: string;
  expanded?: string;
  floor?: string[];
  zones?: string[];
  selectedStartDate?: string;
  selectedEndDate?: string;
  colorMap?: Record<string, string>;
  displayName?: string;
  onZoomClick?: any;
  openZoomDialog?: boolean;
  setIsDraggable?: (arg: boolean) => void;
}

export interface SeriesBadgeProps {
  label: string;
  value: number;
  gradientColors: string;
  Pwidth?: number | string;
  Pheight?: number | string;
}

export interface IDashboardProps {
  selectedFloors: string[];
  selectedZones: string[];
  layouts: any;
  setLayouts: any;
  selectedStartDate: any;
  selectedEndDate: any;
}

export interface IFloorZoneIds {
  selectedFloorIds: string[];
  selectedZonesIds: string[];
  selectedExport: string;
}

export interface LayoutItem {
  deivceListforHeatMap?: { deviceId: string; channelNo: number }[] | undefined;
  deivceListforPVCount?: { deviceId: string; channelNo: number }[] | undefined;
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  content: string;
  width: number;
  height: number;
  chartID: number;
  chartName: string;
  displayName: string;
  size: string;
  expanded: string;
  configurationData?: ISelectedFeaturesWiseWidget | null;
  floorConfigurationData?: {
    floorWiseData: ISelectedFloorFeaturesWiseWidget[];
  } | null;
  deviceIds?: ISelectedDevicesHeatmap[];
}

export interface ISelectedFloorFeaturesWiseWidget {
  floorId: string;
  floorName?: string;
  featureWiseMapping: {
    feature: string;
    devices: IFloorPlanData[];
  }[];
}

export interface IFloorPlanData {
  feature: string;
  deviceId: string;
  channelNo: number;
  position: any;
  floorId: string;
  widgetData?: any;
}

export interface ISelectedFeaturesWiseWidget {
  lat: number;
  lng: number;
  zoom: number;
  features: IMapPlanData[] | null;
  widgetData?: any;
}

export interface Layouts {
  lg: LayoutItem[] | null;
}

export interface IdeviceList {
  deviceId: string;
  channelNo: number;
}

export interface WidgetSetUpProps {
  item: LayoutItem;
  openSetup: boolean;
  onClose: () => void;
  onApply?: (
    size: string,
    expanded: string,
    deivceListforPVCount?: IdeviceList[],
    deivceListforHeatMap?: IdeviceList[]
  ) => void;
  OnMapApply?: (data: ISelectedFeaturesWiseWidget) => void;
  OnFloorApply?: (data: ISelectedFloorFeaturesWiseWidget[]) => void;
  initialDeviceIds?: { deviceId: string; channelNo: number }[]; // new
  floor?: string[];
  zones?: string[];
  selectedStartDate?: string;
  selectedEndDate?: string;
  floorWiseData?: ISelectedFloorFeaturesWiseWidget[];
  onChangeWidgetName?: (editableWidgetName: string) => void;
}

export interface VehicleQueueAnalyProps {
  pWidth?: number | string;
  pHeight?: number | string;
  size?: string;
  expanded?: string;
  floor?: string[];
  zones?: string[];
  selectedStartDate?: string;
  selectedEndDate?: string;
}

export interface CommonWidgetProps {
  pWidth?: number | string;
  pHeight?: number | string;
  size?: string;
  expanded?: string;
  floor?: string[];
  zones?: string[];
  selectedStartDate: any;
  selectedEndDate: any;
  item?: LayoutItem | {};
  setLayouts?: any;
  onDeleteWidget?: () => void; // only for map pane and floor plan
  onSaveWidgetSetUpData?: (data: ISelectedFeaturesWiseWidget) => void;
  onSavefloorWidgetSetUpData?: (data: ISelectedFloorFeaturesWiseWidget) => void;
  onZoomClick?: any;
  zoomedWidget?: any;
  //setExportHandler: (fn: (item: LayoutItem) => void) => void; // Now optional
  setExportHandler?: (handler: (item: LayoutItem) => void) => void;

  setIsDraggable?: (arg: boolean) => void;
  onChangeWidgetName?: (editableWidgetName: string) => void;
  onLoadComplete?: any;
}

export interface IVQAData {
  dateTime: string;
  queueCount: number;
}

export interface IVQAProps {
  customizedWidth?: number | string;
  customizedHeight?: number | string;
  startDate?: Date;
  endDate?: Date;
  VQAData?: IVQAData[] | null;
  displayName?: string;
  onZoomClick?: any;
  // zoomedWidget?: any;
  openZoomDialog?: boolean;
  floor?: string[];
  zones?: string[];
  setIsDraggable?: (arg: boolean) => void;
  setExportHandler?: (fn: (item: LayoutItem) => void) => void; // Now optional
  animate?: boolean;
  setAnimate?: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface IVehicleByTypeCountData {
  truckInCount: number;
  motorCycleInCount: number;
  busInCount: number;
  bicycleInCount: number;
  carInCount: number;
  totalInVehicleCount?: number;
  dateTime?: string;
}

// export interface VehicleByTypeWidgetProps {
//   vehicleByTypeCountData?: IVehicleByTypeCountData;
//   pWidth?: number | string;
//   pHeight?: number | string;
//   size?: string;
//   expanded?: string;
//   floor?: string[];
//   zones?: string[];
//   selectedStartDate?: string;
//   selectedEndDate?: string;
//   item?: LayoutItem | {};
//   onChangeWidgetName?: (widgetName: string) => void;
//   onZoomClick?: any;
//   zoomedWidget?: any;
// }
export interface VehicleByTypeProps {
  vehicleByTypeCountData?: IVehicleByTypeCountData;
  vehicleDataWithTime?: IVehicleByTypeCountData[] | null;
  customizedWidth?: number | string;
  customizedHeight?: number | string;
  displayName?: string;
  startDate?: Date;
  endDate?: Date;
  onZoomClick?: any;
  openZoomDialog?: boolean;
  floor?: string[];
  zones?: string[];
  setExportHandler?: (fn: (item: LayoutItem) => void) => void; // Now optional
  setIsDraggable?: (arg: boolean) => void;
}
// export interface NewVsTotalVisitorWidgetProps {
//   newVsTotalVisitorCountData?: INewVsTotalVisitorCountData;
//   pWidth?: number | string;
//   pHeight?: number | string;
//   size?: string;
//   expanded?: string;
//   floor?: string[];
//   zones?: string[];
//   selectedStartDate?: string;
//   selectedEndDate?: string;
//   item?: LayoutItem | {};
//   onChangeWidgetName?: (widgetName: string) => void;
//   onZoomClick?: any;
//   zoomedWidget?: any;
// }
export interface INewVsTotalVisitorCountData {
  newVisitorsCount: number;
  totalVisitorsCount: number;
}
export interface NewVsTotalVisitorProps {
  newVsTotalVisitorCountData?: INewVsTotalVisitorCountData;
  customizedWidth?: number | string;
  customizedHeight?: number | string;
  displayName?: string;
  onZoomClick?: any;
  openZoomDialog?: boolean;
  newVsTotalVisitorsChartData?: INewVsTotalVisitorsChartData[];
  startDate?: Date;
  endDate?: Date;
  floor?: string[];
  zones?: string[];
  setExportHandler?: (fn: (item: LayoutItem) => void) => void; // Now optional
  setIsDraggable?: (arg: boolean) => void;
}
export interface AveragePeopleCountProps {
  APCData?: IAveragePeopleCountData | null;
  customizedWidth?: number | string;
  customizedHeight?: number | string;
  size?: string;
  expanded?: string;
  floor?: string[];
  zones?: string[];
  item?: LayoutItem | {};
  displayName?: string;
  onZoomClick?: any;
  openZoomDialog?: boolean;
  averagePeopleCountChartData?: IAveragePeopleCountChartData2[] | null;
  startDate?: Date;
  endDate?: Date;
  setExportHandler?: (fn: (item: LayoutItem) => void) => void; // Now optional
  setIsDraggable?: (arg: boolean) => void;
}
export interface IAveragePeopleCountData {
  minInCount: number | null;
  minInDate: Date | null;
  maxInCount: number | null;
  maxInDate: Date | null;
  minOutCount: number | null;
  minOutDate: Date | null;
  maxOutCount: number | null;
  maxOutDate: Date | null;
  averageInCount: number | null;
  averageOutCount: number | null;
  totalInPeople: number | null;
}

export interface PeopleVehicleInOutProps {
  customizedWidth?: number | string;
  pHeight?: number | string;
  size?: string;
  expanded?: string;
  floor?: string[];
  zones?: string[];
  selectedStartDate?: string;
  selectedEndDate?: string;
  inOutValue?: PVInOutData; // Callback for parent
  item?: LayoutItem | {};
}

export interface ExtendedPeopleVehicleProps extends PeopleVehicleInOutProps {
  initialValue?: "In" | "Out"; // Optional prop to set default
  onChange?: (value: "In" | "Out") => void; // Callback for parent
  onZoomClick?: any;
  openZoomDialog?: boolean;
  displayName?: string;
  setIsDraggable?: (arg: boolean) => void;
}

export interface PVInOutData {
  totalInCount: number;
  totalOutCount: number;
}

export interface IPInOutData {
  dateTime: string;
  inCount: number;
  outCount: number;
  dateTimeCsv?: string;
  hour?: number;
}

export interface PVInOutProps {
  customizedWidth?: number | string;
  customizedHeight?: number | string;
  initialValue?: "In" | "Out";
  floor?: string[];
  zones?: string[];
  selectedStartDate: Date;
  selectedEndDate: Date;
  pInOutData?: IPInOutData[] | null;
  filetredDevices: ISelectedDevicesHeatmap[] | null;
  OnDeviceChange: (event: SelectChangeEvent) => void;
  selectedCamera: string;
  vInOutData?: IPInOutData[] | null;
  setExportHandler?: (fn: (item: LayoutItem) => void) => void; // Now optional
}

export interface IWidgetReqForChartPayload {
  floorIds: string[];
  zoneIds?: string[];
  startDate: string;
  endDate: string;
  inOutType: string;
  intervalMinutes: number;
  fromSummary: string;
  deviceId?: string;
  addMinutes: number;
}

export interface TimeLineChartPeopleVehicleCount {
  time: string;
  dateTime: string;
  date: string;
  count: number;
  hour: string;
  value: number;
}

export interface TimeLineBubbleChart {
  time: string;
  count: number;
  hour: string;
}
export interface GenderProps {
  customizedWidth?: number | string;
  customizedHeight?: number | string;
  genderData?: IGenderData[] | null;
  genderDataWithTime?: IGenderDataWithTime[] | null;
  displayName?: string;
  startDate?: Date;
  endDate?: Date;
  onZoomClick?: any;
  openZoomDialog?: boolean;
  floor?: string[];
  zones?: string[];
  setExportHandler?: (fn: (item: LayoutItem) => void) => void; // Now optional
  setIsDraggable?: (arg: boolean) => void;
  groupbyDateData?: IGenderDataWithTime[] | null;
}

export interface IGenderData {
  gender: string;
  count: number;
  minCount: number;
  minDate: string;
  maxCount: number;
  maxDate: string;
}

export interface IGenderDataWithTime {
  dateTime: string;
  maleCount: number;
  femaleCount: number;
  undefinedCount: number;
}

// export interface AveragePeopleCount2_1Props {
//   averagePeopleCountChartData: IAveragePeopleCountChartData2[] | null;
//   pWidth?: number | string;
//   pHeight?: number | string;
//   startDate?: Date;
//   endDate?: Date;
// }
export interface DataPoint {
  date: Date;
  y: number;
}

export interface DataItem {
  name: string;
  values: DataPoint[];
}

export interface IAveragePeopleCountChartData {
  data: DataItem[];
}

export interface IAveragePeopleCountChartData2 {
  // name: string;
  // values: { date: string; y: number }[];
  dateTime: string;
  inCount: number;
  outCount: number;
  hour?: number | null;
}

export interface IZoneWiseCapacityUtilizationProps {
  customizedWidth: number;
  customizedHeight: number;
  ZoneWiseCUData?: IZoneWiseCUData[] | null;
  displayName?: string;
  onZoomClick?: any;
  openZoomDialog?: boolean;
  setIsDraggable?: (arg: boolean) => void;
}

export interface IZoneWiseCUData {
  zoneName: string;
  maxCapacity: number;
  utilization: number;
  percentage: number;
}
export interface INewVsTotalVisitorsChartData {
  // name: string;
  // values: { date: Date; y: number }[];

  dateTime: string;
  newVisitor: number;
  totalVisitor: number;
}

export interface IPedestrainProps {
  customizedWidth?: number | string;
  customizedHeight?: number | string;
  pDData?: IVQAData[] | null;
  displayName?: string;
  startDate?: Date;
  endDate?: Date;
  onZoomClick?: any;
  openZoomDialog?: boolean;
  floor?: string[];
  zones?: string[];
  setExportHandler?: (fn: (item: LayoutItem) => void) => void; // Now optional
  setIsDraggable?: (arg: boolean) => void;
  animate?: boolean;
  setAnimate?: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface IZoneWiseCapacityUtilizationAnalysisProps {
  customizedWidth?: number | string;
  customizedHeight?: number | string;
  ZoneWiseCUAnalysisData?: ZoneUtilizationData[] | null;
  startDate?: Date;
  endDate?: Date;
  floor?: string[];
  zones?: string[];
  setExportHandler?: (fn: (item: LayoutItem) => void) => void; // Now optional
}

export interface ICapacityUtilizationforVehicleProps {
  customizedWidth?: number | string;
  customizedHeight?: number | string;
  CUForVehicleData?: CapacityUtilizationPeopleDataTypes;
  DateWiseUtilization?: DateWiseUtilization[];
  displayName?: string;
  onZoomClick?: any;
  openZoomDialog?: boolean;
  setIsDraggable?: (arg: boolean) => void;
}

export interface IVehicleCapacityUtilizationAnanlysisProps {
  DateWiseUtilization: DateWiseUtilization[];
  customizedWidth?: number | string;
  customizedHeight?: number | string;
  startDate?: Date;
  endDate?: Date;
  CUForVehicleData?: CapacityUtilizationPeopleDataTypes;
}

export interface ISlipAndFallProps {
  customizedWidth?: number | string;
  customizedHeight?: number | string;
  slipAndFallData?: IVQAData[] | null;
  displayName?: string;
  startDate?: Date;
  endDate?: Date;
  onZoomClick?: any;
  openZoomDialog?: boolean;
  floor?: string[];
  zones?: string[];
  setExportHandler?: (fn: (item: LayoutItem) => void) => void; // Now optional
  setIsDraggable?: (arg: boolean) => void;
  animate?: boolean;
  setAnimate?: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface IVehicleInWrongDirectionProps {
  customizedWidth?: number | string;
  customizedHeight?: number | string;
  vWrongDirectionData?: IVQAData[] | null;
  displayName?: string;
  startDate?: Date;
  endDate?: Date;
  onZoomClick?: any;
  openZoomDialog?: boolean;
  floor?: string[];
  zones?: string[];
  setExportHandler?: (fn: (item: LayoutItem) => void) => void; // Now optional
  setIsDraggable?: (arg: boolean) => void;
  animate?: boolean;
  setAnimate?: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface IVehicleUTurnProps {
  customizedWidth?: number | string;
  customizedHeight?: number | string;
  vUTurnData?: IVQAData[] | null;
  displayName?: string;
  startDate?: Date;
  endDate?: Date;
  onZoomClick?: any;
  openZoomDialog?: boolean;
  floor?: string[];
  zones?: string[];
  setExportHandler?: (fn: (item: LayoutItem) => void) => void; // Now optional
  setIsDraggable?: (arg: boolean) => void;
}
export interface IWidgetRequestProps {
  pWidth?: number | string;
  pHeight?: number | string;
  size?: string;
  expanded?: string;
  floor?: string[];
  zones?: string[];
  selectedStartDate?: string;
  selectedEndDate?: string;
  item?: LayoutItem | {};
  onZoomClick?: any;
  zoomedWidget?: any;
  setIsDraggable?: (arg: boolean) => void;
}
export interface IAverageVehicleCountData {
  minInCount: number | null;
  minInDate: Date | null;
  maxInCount: number | null;
  maxInDate: Date | null;
  minOutCount: number | null;
  minOutDate: Date | null;
  maxOutCount: number | null;
  maxOutDate: Date | null;
  averageInCount: number | null;
  averageOutCount: number | null;
  totalInVehicle: number | null;
}
export interface AverageVehicleCountProps {
  averageVehicleCountChartData?: IAverageVehicleCountChartData[];
  AVCData?: IAverageVehicleCountData;
  customizedWidth?: number | string;
  customizedHeight?: number | string;
  displayName?: string;
  onZoomClick?: any;
  openZoomDialog?: boolean;
  startDate?: Date;
  endDate?: Date;
  floor?: string[];
  zones?: string[];
  setExportHandler?: (fn: (item: LayoutItem) => void) => void; // Now optional
  setIsDraggable?: (arg: boolean) => void;
}
export interface IAverageVehicleCountChartData {
  // name: string;
  // values: { date: Date; y: number }[];
  dateTime: string;
  inCount: number;
  outCount: number;
  hour?: number | null;
}
// export interface IAverageVehicleCountProps2_1 {
//   averageVehicleCountChartData?: IAverageVehicleCountChartData[];
//   pWidth?: number | string;
//   pHeight?: number | string;
//   startDate?: Date;
//   endDate?: Date;
// }

export interface IDeviceListData {
  deviceId: string;
  cameraName: string;
}

export interface PVFilterProps {
  customizedWidth?: number | string;
  customizedHeight?: number | string;
  pWidth?: number | string;
  pHeight?: number | string;
  floor?: string[];
  zones?: string[];
  selectedStartDate?: string;
  selectedEndDate?: string;
  size?: string;
  expanded?: string;
}

// export interface CumulativeTotalProps {
//   cumulativeTotal: number | string;
// }

export interface CumulativeTotalProps {
  cumulativePeopleChart?: LineDataInOut[];
  cumulativePeopleCount?: number | string;
  customizedWidth?: number | string;
  customizedHeight?: number | string;
  startDate?: Date;
  endDate?: Date;
  displayName?: string;
  onZoomClick?: any;
  openZoomDialog?: boolean;
  floor?: string[];
  zones?: string[];
  setExportHandler?: (fn: (item: LayoutItem) => void) => void; // Now optional
  setIsDraggable?: (arg: boolean) => void;
}

// export interface ExtendedCumulativeChartProps {
//   cumulativePeopleChart: LineDataInOut[];
//   pWidth?: number | string;
//   pHeight?: number | string;
// }

export interface DataPointInOut {
  date: string;
  y: number;
}

export interface LineDataInOut {
  inCount: any;
  dateTime: string | number | Date;
  name: string;
  values: DataPointInOut[];
}

export interface IVTurningMovmentProps {
  customizedWidth?: number | string;
  customizedHeight?: number | string;
  vTurningMovementData?: IVTurningMovmentData[] | null;
  vTMBubbleChartData?: IVTurningMovmentData | null;
  displayName?: string;
  startDate?: Date;
  endDate?: Date;
  onZoomClick?: any;
  openZoomDialog?: boolean;
  floor?: string[];
  zones?: string[];
  setExportHandler?: (fn: (item: LayoutItem) => void) => void; // Now optional
  setIsDraggable?: (arg: boolean) => void;
}

export interface IVTurningMovmentData {
  dateTime?: string;
  left?: number;
  right?: number;
  straight?: number;
}

export interface IShopptingQueueEventProps {
  customizedWidth?: number | string;
  customizedHeight?: number | string;
  shoppingQueueEventsData?: IVQAData[] | null;
  displayName?: string;
  startDate?: Date;
  endDate?: Date;
  onZoomClick?: any;
  openZoomDialog?: boolean;
  floor?: string[];
  zones?: string[];
  setExportHandler?: (fn: (item: LayoutItem) => void) => void; // Now optional
  setIsDraggable?: (arg: boolean) => void;
  animate?: boolean;
  setAnimate?: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface IZWPeopleCount {
  customizedWidth?: number | string;
  customizedHeight?: number | string;
  zoneWisePeopleCountingData?: IZoneWisePeopleData[] | null;
  displayName?: string;
  onZoomClick?: any;
  openZoomDialog?: boolean;
  setIsDraggable?: (arg: boolean) => void;
}
export interface IZoneWisePeopleData {
  zoneName: string;
  peopleInCount: number;
  peopleOutCount: number;
}

export interface ISpeedViolationByVehicleProps {
  customizedWidth?: number | string;
  customizedHeight?: number | string;
  SVbyVehicleData?: ISVbyVehicleData[] | null;
  displayName?: string;
  startDate?: Date;
  endDate?: Date;
  onZoomClick?: any;
  openZoomDialog?: boolean;
  floor?: string[];
  zones?: string[];
  setExportHandler?: (fn: (item: LayoutItem) => void) => void; // Now optional
  setIsDraggable?: (arg: boolean) => void;
  animate?: boolean;
  setAnimate?: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface ISVbyVehicleData {
  dateTime: string;
  queueCount: number;
}

export interface ITrafficJamByDayProps {
  customizedWidth?: number | string;
  customizedHeight?: number | string;
  TrafficJamData?: ISVbyVehicleData[] | null;
  displayName?: string;
  startDate?: Date;
  endDate?: Date;
  onZoomClick?: any;
  openZoomDialog?: boolean;
  floor?: string[];
  zones?: string[];
  setExportHandler?: (fn: (item: LayoutItem) => void) => void; // Now optional
  setIsDraggable?: (arg: boolean) => void;
  animate?: boolean;
  setAnimate?: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface IBlockedExitDetectionChartData {
  dateTime: string;
  queueCount: number;
}
export interface IBlockedExitDetectionChartProp {
  blockedExitDetectionChartData?: IBlockedExitDetectionChartData[];
  customizedWidth?: number | string;
  customizedHeight?: number | string;
  displayName?: string;
  onZoomClick?: any;
  openZoomDialog?: boolean;
  startDate?: Date;
  endDate?: Date;
  floor?: string[];
  zones?: string[];
  setExportHandler?: (fn: (item: LayoutItem) => void) => void; // Now optional
  setIsDraggable?: (arg: boolean) => void;
  animate?: boolean;
  setAnimate?: React.Dispatch<React.SetStateAction<boolean>>;
  chartName?: string;
}
export interface IWidgetPayloadForDevice {
  floorIds: string[];
  zoneIds?: string[];
}

export interface IForkliftQueueEventProps {
  customizedWidth?: number | string;
  customizedHeight?: number | string;
  forkliftQueueEventsData?: IVQAData[] | null;
  displayName?: string;
  startDate?: Date;
  endDate?: Date;
  onZoomClick?: any;
  openZoomDialog?: boolean;
  floor?: string[];
  zones?: string[];
  setExportHandler?: (fn: (item: LayoutItem) => void) => void; // Now optional
  setIsDraggable?: (arg: boolean) => void;
  animate?: boolean;
  setAnimate?: React.Dispatch<React.SetStateAction<boolean>>;
}
export interface DataItem {
  name: string;
  value: number;
}

export interface IEditableWidgetNameProps {
  displayName?: string;
  onChangeWidgetName?: (widgetName: string) => void;
}
export interface IStoppedVehicleCountByTypeData {
  dateTime: string;
  car: number;
  bus: number;
  truck: number;
  motorcycle: number;
  cycle: number;
}
export interface IStoppedVehicleCountByTypeProps {
  stoppedVehicleCountByTypeData?: IStoppedVehicleCountByTypeData;
  stoppedVehicleCountByTypeChartData?: IStoppedVehicleCountByTypeData[];
  customizedWidth?: number | string;
  customizedHeight?: number | string;
  displayName?: string;
  startDate?: Date;
  endDate?: Date;
  onZoomClick?: any;
  openZoomDialog?: boolean;
  floor?: string[];
  zones?: string[];
  setExportHandler?: (fn: (item: LayoutItem) => void) => void; // Now optional
  setIsDraggable?: (arg: boolean) => void;
  animate?: boolean;
  setAnimate?: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface IForkliftDataProps {
  customizedWidth?: number | string;
  customizedHeight?: number | string;
  ForkliftData?: ISVbyVehicleData[] | null;
  displayName?: string;
  startDate?: Date;
  endDate?: Date;
  onZoomClick?: any;
  openZoomDialog?: boolean;
  floor?: string[];
  zones?: string[];
  setExportHandler?: (fn: (item: LayoutItem) => void) => void; // Now optional
  setIsDraggable?: (arg: boolean) => void;
}
export interface IPeopleQueueEventsData {
  dateTime: string;
  queueCount: number;
}
export interface IPeopleQueueEventsProps {
  peopleQueueEventsData?: IPeopleQueueEventsData[];
  peopleQueueEventsCount?: number;
  customizedWidth?: number | string;
  customizedHeight?: number | string;
  displayName?: string;
  startDate?: Date;
  endDate?: Date;
  onZoomClick?: any;
  openZoomDialog?: boolean;
  floor?: string[];
  zones?: string[];
  setExportHandler?: (fn: (item: LayoutItem) => void) => void; // Now optional
  setIsDraggable?: (arg: boolean) => void;
  animate?: boolean;
  setAnimate?: React.Dispatch<React.SetStateAction<boolean>>;
}
export interface IPeopleQueueEventsData {
  dateTime: string;
  queueCount: number;
}
export interface IDetectForklifts {
  dateTime: string;
  queueCount: number;
}
export interface IDetectForkliftsProps {
  forkliftsData?: IDetectForklifts[];
  proxomityForkliftsData?: IDetectForklifts[];
  customizedWidth?: number | string;
  customizedHeight?: number | string;
  displayName?: string;
  startDate?: Date;
  endDate?: Date;
  detectForkliftsCharts?: IDetectForkliftsCharts[];
  onZoomClick?: any;
  openZoomDialog?: boolean;
  floor?: string[];
  zones?: string[];
  setExportHandler?: (fn: (item: LayoutItem) => void) => void; // Now optional
  setIsDraggable?: (arg: boolean) => void;
  animate?: boolean;
  setAnimate?: React.Dispatch<React.SetStateAction<boolean>>;
}
export interface IDetectForkliftsCharts {
  dateTime: string;
  forkliftsCount: number;
  proximityForkliftsCount: number;
}
// export interface IDetectForkliftsChartsProps {
//   detectForkliftsCharts?: IDetectForkliftsCharts[];
//   pWidth?: number | string;
//   pHeight?: number | string;
// }
export interface ISafetyMeasuresData {
  dateTime: string;
  withMask: number;
  withoutMask: number;
  withHelmet: number;
  withoutHelmet: number;
  withSafetyJacket: number;
  withoutSafetyJacket: number;
}
export interface ISafetyMeasuresDataProps {
  safetyMeasuresData?: ISafetyMeasuresData;
  safetyMeasuresChartData?: ISafetyMeasuresData[];
  customizedWidth?: number | string;
  customizedHeight?: number | string;
  displayName?: string;
  startDate?: Date;
  endDate?: Date;
  onZoomClick?: any;
  openZoomDialog?: boolean;
  floor?: string[];
  zones?: string[];
  setExportHandler?: (fn: (item: LayoutItem) => void) => void; // Now optional
  setIsDraggable?: (arg: boolean) => void;
}

export interface IMapPlanData {
  feature: string;
  deviceId: number | string;
  channelNo: number;
  position: [lat: number, lng: number];
  widgetData?: any;
}

export interface IFeatureWiseCameraList {
  cameraName: string;
  deviceId: number | string;
  channelNo: number;
}
export interface IAllDevices {
  deviceId: string;
  channelNo: number;
  cameraName: string;
  deviceType?: string;
}
export interface ISelectedDevicesHeatmap {
  deviceId: string;
  channelNo: number;
  cameraName?: string;
  deviceType?: string;
}
// export interface IHeatmapWidgetRequestProps extends IWidgetRequestProps {
//   selectedDevicesHeatmap: ISelectedDevicesHeatmap[] | null | undefined;
// }
export interface IHeatmapData {
  resolutionHeight: number;
  resolutionWidth: number;
  heatMapData: number[];
  heatmapImage: string;
}
export interface IHeatmapProps {
  heatmapData?: IHeatmapData;
  customizedWidth?: number | string;
  customizedHeight?: number | string;
  displayName?: string;
  onZoomClick?: any;
  openZoomDialog?: boolean;
  onSelectChange?: (event: SelectChangeEvent) => void;
  filetredDevices: ISelectedDevicesHeatmap[];
  selectedDeviceDD: string;
  setIsDraggable?: (arg: boolean) => void;
}

export interface IHeatmapPayload {
  deviceId: string;
  channelNo: number;
  heatmapType: string;
  startDate: string;
  endDate: string;
}

export interface IGoogleMapProps {
  IsSetUpView: boolean;
  mappedCameras: IMapPlanData[] | null;
  initialZoom?: number;
  initialCenter?: { lat: number; lng: number } | null;
  changeMapCenter?: (newCenter: { lat: number; lng: number }) => void;
  changeZoomLevel?: (zoom: number) => void;
  ondeleteWidget?: (deviceId: number, feature: string) => void;
  floor?: string[];
  zones?: string[];
  selectedStartDate?: string;
  selectedEndDate?: string;
  handleChangeMapCamera?: (data: any) => void;
}

export interface CustomMapWidgetProps {
  IsSetUpView: boolean;
  deleteWidget?: () => void;
  // widgetData: any;
  cam: IMapPlanData | null;
}

export interface IAnalysisData {
  dateTime: string;
  queueCount: number;
}

export interface IForkliftSpeedDetectionProps {
  customizedWidth?: number | string;
  customizedHeight?: number | string;
  speedDetectionData?: IAnalysisData[] | null;
  displayName?: string;
  startDate?: Date;
  endDate?: Date;
  onZoomClick?: any;
  openZoomDialog?: boolean;
  floor?: string[];
  zones?: string[];
  setIsDraggable?: (arg: boolean) => void;
  animate?: boolean;
  setAnimate?: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface IShoppingCartCountingProps {
  customizedWidth?: number | string;
  customizedHeight?: number | string;
  ShoppingCartData?: IAnalysisData[] | null;
  displayName?: string;
  onZoomClick?: any;
  openZoomDialog?: boolean;
  startDate?: Date;
  endDate?: Date;
  floor?: string[];
  zones?: string[];
  setExportHandler?: (fn: (item: LayoutItem) => void) => void; // Now optional
  setIsDraggable?: (arg: boolean) => void;
}

export interface ParsedDataFormat {
  date: Date;
  value: number;
}

export interface IParsedDataWithCategory {
  [key: string]: ParsedDataFormat[];
}

export interface IntervalData {
  intervalName: string;
  tickInterval: number;
}

export interface IChartTicksSelectorPros {
  startDate: Date;
  endDate: Date;
  parsedDataWithCategory: IParsedDataWithCategory;
  operation: "sum" | "max" | "avg";
  onChartDataChange: (data: IParsedDataWithCategory) => void;
  chartTicksChange: (value: IntervalData) => void;
}

export interface IPVInOutProps {
  time: Date;
  in: number;
  out: number;
}


export interface FloorZoneState {
  finlafloorList: string[];
  finalzoneList: string[];
}