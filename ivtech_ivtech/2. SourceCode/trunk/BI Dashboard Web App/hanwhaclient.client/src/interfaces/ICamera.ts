export interface ICamera {
  id?: string;
  deviceType: string;
  deviceName: string;
  ipAddress: string;
  // noOfLines: number | null;
  userName: string;
  password: string;
  devicePort: string;
  isHttps: boolean;
  httpPort: string;
  location: string;
  // cameraType: string[];
  // AIcameraType:string;
  // direction: string[];
  // apiType: string;
  // description?: string; // Optional field
  status?: boolean;
  model?: string;
  serialNumber?: string;
  macAddress?: string;
  isOnline:boolean;
  zoneNames?:string;
  // channelNo:number | null;
}


export interface IDeviceCredentials {
  ipAddress: string;
  userName: string;
  password: string;
  isHttps:boolean;
}

export interface IChannel {
  channelNumber: number;
  isEnable: boolean;
}


export interface IEventlogsRequest {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: number;
  eventName?: string;
  fromDate?: string;  // ISO date string
  toDate?: string;    // ISO date string
  floorIds?: string[];
  zoneIds?: string[];
  status?: string;

}
export interface IGetAllDeviceRequest {
  id?:string;
  searchText?:string
  pageNo?: number;
  pageSize?: number;
  deviceIds?:string[] | null;
  sortBy ?: string;
  sortOrder ?: number;
}

