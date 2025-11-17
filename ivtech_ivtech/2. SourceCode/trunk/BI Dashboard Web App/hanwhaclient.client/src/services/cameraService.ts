import apiUrls from "../constants/apiUrls";
import { apiPostService, apiPostServiceWithoutToast } from "../utils/apiPostService";
import { ICamera, IDeviceCredentials, IEventlogsRequest, IGetAllDeviceRequest } from "../interfaces/ICamera";
import { apiGetServiceFullResponse } from "../utils/apiGetService";
import { apiDeleteService } from "../utils/apiDeleteService";
import { IRoleUser } from "../interfaces/IRolePermission";
import { Ipayload } from "../interfaces/Inotifications";


export const GetAllCameraListService = (request:IGetAllDeviceRequest) =>
  apiPostServiceWithoutToast({
    url: apiUrls.GetAllDeviceList,
    data: request
 });

export const UpdateCameraService = (
  camera: Omit<ICamera, "createdDateTime" | "lastUpdatedDateTime">
) =>
  apiPostService<Omit<ICamera, "createdDateTime" | "lastUpdatedDateTime">>({
    url: apiUrls.ManageAddDevice,
    data: camera,
  });

export const AddCameraService = (
  camera: Omit<ICamera, "createdDateTime" | "lastUpdatedDateTime">
) =>
  apiPostService<Omit<ICamera, "createdDateTime" | "lastUpdatedDateTime">>({
    url: apiUrls.ManageAddDevice,
    data: camera,
  });
  
  export const DeleteCameraService = (ids: string[]) =>
    apiPostService({
      url:apiUrls.DeleteDevices,
      data:ids
    });

    export const getChannelDataService = (data :IDeviceCredentials)=>
      apiPostService({
        url:apiUrls.GetAllChannels,
        data:data
      });
export const GetAllEventLogsListService = (data: IEventlogsRequest) =>
  apiPostServiceWithoutToast({
    url:apiUrls.GetAllEventLogsList,
    data:data
  });

export const UpdateEventLogsStatusService = (data:Ipayload) =>
  apiPostService({
    url: apiUrls.UpdateEventLogsStatus,
    data:data
  });

