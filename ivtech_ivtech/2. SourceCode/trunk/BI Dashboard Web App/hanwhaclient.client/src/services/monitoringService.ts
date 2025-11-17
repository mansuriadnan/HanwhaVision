import apiUrls from "../constants/apiUrls";
import { IMonitoringNamePayload } from "../interfaces/IChart";
import { AddUpdateGroupItemPayload, IGroupData, } from "../interfaces/IMonitoring";
import { apiDeleteService } from "../utils/apiDeleteService";
import { apiGetService } from "../utils/apiGetService";
import { apiPostService, apiPostServiceWithDataAndMessage } from "../utils/apiPostService";

export const GetMonitoringDesign = () =>
    apiGetService({
        url: apiUrls.GetMonitoringDesign,
    });

export const SaveMonitoringName = (payload: IMonitoringNamePayload) =>
    apiPostService({
        url: apiUrls.SaveMonitoringName,
        data: payload,
    });

export const AddMonitoringGroupService = (groupData: IGroupData) =>
    apiPostService<IGroupData>({
        url: apiUrls.AddUpdateGroup,
        data: groupData,
    });

export const GetGroupAndItemDataService = (monitoringId: string) =>
    apiGetService({
        url: `${apiUrls.GetGroupAndItemData}?monitoringId=${encodeURIComponent(monitoringId)}`,
    });

export const AddUpdateGroupItemService = (groupItemData: AddUpdateGroupItemPayload) =>
    apiPostServiceWithDataAndMessage({
        url: apiUrls.AddUpdateGroupItem,
        data: groupItemData,
    });

export const DeleteGroupService = (groupId: string, monitoringId: string) =>
    apiDeleteService({
        url: `${apiUrls.DeleteGroup}/${monitoringId}/groupId/${groupId}`,
        id: "",
    });

export const DeleteItemService = (itemId: string, groupId: string, monitoringId: string) =>
    apiDeleteService({
        url: `${apiUrls.DeleteGroup}/${monitoringId}/groupId/${groupId}/groupItemId/${itemId}`,
        id: "",
    });

export const DeleteMonitoringService = (id: string) =>
    apiDeleteService({
        url: apiUrls.DeleteMonitoring,
        id: id,
    });

