// import { ScreenMaster } from "./ScreenMaster";

export interface IRoleScreenMapping {
  id: string;
  roleId: string;
  screenId: string;
  accessAllowed: boolean;
  // screen_Master: ScreenMaster;
}


export interface RoleScreenMapping {
  id: string;
  roleId: string;
  screenId: string;
  accessAllowed: boolean;
}

export interface RoleScreenMappingRequest {
  RoleScreenMapping: RoleScreenMapping[];
}
