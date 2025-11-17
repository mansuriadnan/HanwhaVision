// src/services/roleService.ts
// import { Role } from "../../src/components/Reusable/SmartTable";
import apiUrls from "../constants/apiUrls";
import { ApiResponse } from "../interfaces/IApiResponse";
import { IRole } from "../interfaces/IRolePermission";
import {
  RolePermissionLastResponse,
  RoleScreenResponse,
  FloorZoneRes,
  ISaveFloorZonedata,
  WidgetListRes,
  ISaveWidgetData,
} from "../interfaces/IRolePermission";
import { apiDeleteService } from "../utils/apiDeleteService";
import {
  apiGetService,
  apiGetServiceFullResponse,
} from "../utils/apiGetService";
import {
  apiPostService,
  apiPostServiceNewReqRes,
} from "../utils/apiPostService";

export const GetAllRoleService = () =>
  apiGetService<ApiResponse<IRole[]>>({
    url: apiUrls.GetAllRole,
  });

// export const getAllRoles = async (): Promise<Role[]> => {
//   return apiGet<Role[]>(apiUrls.GetAllRole);
// };

export const UpdateRoleService = (
  roles: Omit<IRole, "CreatedOn" | "UpdatedOn">
) =>
  apiPostService<Omit<IRole, "CreatedOn" | "UpdatedOn">>({
    url: apiUrls.AddUpdateRole,
    data: roles,
  });

export const AddRoleService = (roles: Omit<IRole, "CreatedOn" | "UpdatedOn">) =>
  apiPostService<Omit<IRole, "CreatedOn" | "UpdatedOn">>({
    url: apiUrls.AddUpdateRole,
    data: roles,
  });

export const GetAllRolePermission = (id: string) =>
  apiGetServiceFullResponse<RoleScreenResponse>({
    url: apiUrls.GetRoleScreen,
    id: id,
  });

export const SaveRolePermissionService = (
  rolePermission: Omit<RolePermissionLastResponse, "CreatedOn" | "UpdatedOn">[]
) =>
  apiPostServiceNewReqRes<
    Omit<RolePermissionLastResponse, "CreatedOn" | "UpdatedOn">[],
    ApiResponse<{ success: boolean; message: string }> // Replace `void` with the actual response type if needed
  >({
    url: apiUrls.AddRolePermissionScreen,
    data: rolePermission,
  });

export const DeleteRole = (id: string) =>
  apiDeleteService({
    url: apiUrls.DeleteRole,
    id: id,
  });

export const GetFloorZonedataService = (id: string) =>
  apiGetServiceFullResponse<FloorZoneRes[]>({
    url: apiUrls.GetFloorZonedata,
    id: id,
  });

export const SaveFloorZonedataService = (data: ISaveFloorZonedata) =>
  apiPostService({
    url: apiUrls.SaveFloorZonedata,
    data: data,
  });

export const GetRoleScreenWidgetsService = (id: string) =>
  apiGetServiceFullResponse<WidgetListRes[]>({
    url: apiUrls.GetRoleScreenMappingWidgetData,
    id: id,
  });

export const SaveWidgetsDataService = (data: ISaveWidgetData) =>
  apiPostService({
    url: apiUrls.SaveWidgetsData,
    data: data,
  });
