export interface IFloorPlan {
  id: string;
  floorPlanName: string;
}

export interface IAddFloor {
  floorName: string;
}

export interface FloorAndZoneListProps {
  PfloorList: IFloorPlan[] | undefined;
}

export interface IBindSite {
  id: string;
  siteName: string;
}

export type IZoneFormData = {
  name: string;
  // maxOccupancy: string;
  peopleOccupancy: string;
  vehicleOccupancy: string;
  resetAt: string;
};

export type PolygonPoint = {
  x: number;
  y: number;
};

export interface ZoneDto {
  polygonId: string;
  name: string; // Name of the zone
  // maxOccupancy: number; // Maximum number of people/vehicles allowed
  peopleOccupancy: number; // Current number of people
  vehicleOccupancy: number; // Current number of vehicles
  resetAt: string; // Time when the zone resets, in HH:mm format
  siteId: string;
  floorId?: string;
  polygons?: PolygonPoint[];
}

export interface CameraDto {
  id: string; // Unique identifier
  position: CameraPosition; // Camera position (x, y)
  icon: HTMLImageElement | null; // Camera icon
  blurredIcon: HTMLImageElement | null;
  cameraName: string; // Camera name
  status: string; // Camera status
  ipAddress: string;
  focalDistance: number;
  focalAngle: number;
  CameraId?: string;
}



// Represents the main response DTO
export interface GetFloorPlanResponseDto {
  uploadedFile?: UploadedFloorFile | null;
  polygons?: PolygonPoint[] | null;
  zoneDto: ZoneList[];
  cameraDto: CameraDto[];
}

// Represents the uploaded floor file
export interface UploadedFloorFile {
  name: string;
  base64Data: string;
}

// Represents a point in a polygon
// export interface ZonePolygonPoint {
//   x: number;
//   y: number;
// }

// Represents the Zone DTO
export interface ZoneList {
  id?: string | null;
  polygonId?: string | null;
  siteId?: string | null;
  floorId?: string | null;
  name?: string | null;
  // maxOccupancy: number;
  peopleOccupancy: number;
  vehicleOccupancy: number;
  resetAt?: string | null;
  polygons?: Record<string, PolygonPoint[]> | null;
  polygonsNew?: XyPosition[] | null;
}

// Represents the XY position
export interface XyPosition {
  x: number;
  y: number;
}

export interface IZoneList {
  id?: string | null;
  floorId?: string | null;
  name?: string | null;
  peopleOccupancy: number | null;
  peopleDefaultOccupancy: number | null;
  vehicleOccupancy: number | null;
  vehicleDefaultOccupancy: number | null;
  resetAt?: string | null;
  zoneArea: XyPosition[] | null;
  mappedDevices: DeviceList[] | null;
}

// used in DeviceList withOut zone
export interface DeviceList {
  deviceId: string;
  deviceName: string;
  deviceType: string;
  model: string;
  ipAddress:string;
  peopleLines: LineList[] | null;
  vehicleLines: LineList[] | null;
  channelEvent: ChannelList[] | null;
  peopleLineIndex?: number[] | null;
  vehicleLineIndex?: number[] | null;
  position?: DevicePosition;
  fovlength?: number;
  fovcolor?: string;
  isSphere?: boolean;
  id:string;
}

export interface LineList {
  line: number;
  mode: string;
  name: string;
  enable: boolean;
  coordinates: XyPosition[] | null;
  isMapped?: boolean;
  zoneName?: string;
}

export interface ChannelList {
  id?: string;
  channel: number;
  connected: boolean;
  motionDetection: boolean;
  peopleLines: LineList[] | null;
  vehicleLines: LineList[] | null;
  peopleLineIndex?: number[] | null;
  vehicleLineIndex?: number[] | null;
  
}

// export interface SetStatusFunction {
//   (text: string): void;
//   last?: { time: number; text: string };
// }

export interface VectorString {
  push_back: (value: string) => void;
}

// interface ModuleType {
//   CadCore: new () => CadCore;
//   VectorString: new () => VectorString;
//   canvas: HTMLCanvasElement;
//   FS: any;
//   ASSETS_FOLDER: string;
//   FS_createDataFile: (
//     folder: string,
//     name: string,
//     data: Uint8Array,
//     isReadable: boolean,
//     isWritable: boolean,
//     canOwn: boolean
//   ) => void;
//   arguments: any[];
//   preRun: any[];
//   postRun: any[];
//   print: (text: string) => void;
//   printErr: (text: string) => void;
//   setStatus: SetStatusFunction;
//   totalDependencies: number;
//   monitorRunDependencies: (left: number) => void;
// }

// declare global {
//   export interface Window {
//     Module: ModuleType;
//     enableDragger: () => void;
//     StateMachine: any;
//     AppContext: any;
//     CircleDragger: any;
//     scriptsLoaded: boolean;
//     FS: any;
//   }
// }

// declare global {
//   interface Window {
//     // Module: any;
//     CadCore: any;
//     VectorString: any;
//     FS: any;
//     enableDragger: () => void;
//   }
// }

export interface IFloorAndZoneProps {
  showNoData :boolean
}

export interface FloorListProps {
  // PfloorList: IFloorPlan[] | undefined;
  onSelectFloor: (Id: string) => void;
  onDeleteFloor: () => void;
  OnDeleteAllFloor:()=>void;
}

export interface IZoneDetails {
  floorId: string;
  zoneId: string;
  zoneArea: PolygonPoint[];
  devices: IDeviceList[] | null;
}

export interface IDeviceList {
  deviceId: string;
  zoneCameraId?: string;
  position?: DevicePosition;
  fovlength?: number;
  fovcolor?: string;
  lineIndex?: number[] | null;
  isSphere?: boolean;
  // deviceName?: string;
  // ipAddress?:string
  // deviceType?: string;
  // model?: string;
  // lines?: LineList[] | null;
  // selectedLines?: number[] | null;
  // channelEvent?: ChannelList[] | null;
}

export interface DevicePosition {
  x: number;
  y: number;
  angle: number;
}

export interface ZoneListProps {
  selectedFloorId: string;
  onSelectZone: (
    Id: string,
    zoneArea: XyPosition[] | null,
    mappedDevices: DeviceList[] | null
  ) => void;
  reFreshZoneList: boolean;
  onDeleteZone: () => void;
  isFileUploaded: boolean;
}

export interface DeviceListProps {
  reFreshDeviceList: boolean;
}

export interface IMappedDevice {
  deviceId?: string;
  mappedDeviceid?: string;
  deviceType?: string;
  position?: DevicePosition;
  fovlength?: number;
  fovcolor?: string;
  isSphere?: boolean;
  IsActive?: boolean;
  peopleLines?: LineList[] | null;
  vehicleLines?: LineList[] | null;
  peopleLineIndex?: number[] | null;
  vehicleLineIndex?: number[] | null;
  zoneCameraId?: string | null;
  channel?: number;
  deviceName?:string;
  ipAddress?:string;
}

export interface Floor {
  id: string;
  floorPlanName: string;
  zones: Zone[];
}

export interface Zone {
  id: string;
  zoneName: string;
}

export interface IFloorZoneNamesRequest {
  floorIds: string[];
  zoneIds: string[];
}

export interface CameraPosition {
  x: number;
  y: number;
} ;

export interface IPolygonSubmissionPayload {
  floorId?: string;
  floorName?: string;
  uploadedFile: {
    name: string;
    // type: string;
    base64Data: string;
  };
  polygons: PolygonPoint[];
  cameras: {
    id: string; // Unique identifier
    position: CameraPosition | null; // Camera position (x, y)
    icon: HTMLImageElement | null; // Camera icon can be null or an image
    cameraName: string; // Camera name
    status: string; // Camera status
  }[];
  zoneDto: ZoneDto[];
}

export interface IImgDimensions{
  width:number,
  height:number
} 

export interface CameraStreamProps{
  selectedcamera :IMappedDevice | undefined;
}