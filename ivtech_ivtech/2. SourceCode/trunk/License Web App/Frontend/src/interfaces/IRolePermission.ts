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