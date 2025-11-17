import apiUrls from "../constants/apiUrls";
import { INotificationReadPayload } from "../interfaces/Inotifications";
import { apiGetService } from "../utils/apiGetService";
import { apiPostService, apiPostServiceWithoutToast } from "../utils/apiPostService";


export const GetNotification = (suburl: string) =>
    apiGetService({
        url: apiUrls.GetNOtification + suburl,
    });

export const MarkReadUserNotificationService = (payload: INotificationReadPayload) =>
    apiPostServiceWithoutToast({
        url: apiUrls.MarkReadUserNotification,
        data: payload,
    });

export const GetUserNotificationCount = () =>
    apiGetService({
        url: apiUrls.UserNotificationCount,
    });