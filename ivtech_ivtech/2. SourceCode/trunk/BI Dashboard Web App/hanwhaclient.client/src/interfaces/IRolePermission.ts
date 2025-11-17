export interface IRolePermission {
  id: string;
  name: string;
}

export interface RolePermissionLastResponse {
  id: string;
  screenName?: string;
  order?: number;
  isParent?: boolean;
  accessAllowed: boolean;
  parentsScreenId?: string | null;
  screenId: string | null;
}

export interface RoleScreenResponse {
  isSuccess: boolean;
  data: any;
  referenceData?: {
    screensMapping: {
      value: string;
      label: boolean | null;
    }[];
  };
}

export interface FloorZoneRes {
  floorId: string;
  floorPlanName: string;
  accessAllowed: boolean;
  zones: zonesRes[];
}

export interface zonesRes {
  zoneId: string;
  zoneName: string;
  accessAllowed: boolean;
}

export interface ISaveFloorZonedata{
  roleId:string;
  dataAccessPermissions:[
    {
      floorId:string,
      zoneIds: string[]
    }
  ]
}

export interface WidgetListRes {
  id: string;
  categoryName: string;
  accessAllowed: boolean;
  widgets: widgetsRes[];
}

export interface widgetsRes {
  widgetId: string;
  widgetName: string;
  accessAllowed: boolean;
}

export interface ISaveWidgetData{
  roleId:string;
  widgetAccessPermissions:[
    {
      widgetCategoryId:string,
      widgetIds: string[]
    }
  ]
}


export interface IRole {
  id: string;
  roleName: string;
  description: string;
  createdOn: string | null;
  createdBy: string | null;
  updatedOn: string | null;
  updatedBy: string | null;
}


export interface IRoleUser {
  id: string;
  name: string;
}

