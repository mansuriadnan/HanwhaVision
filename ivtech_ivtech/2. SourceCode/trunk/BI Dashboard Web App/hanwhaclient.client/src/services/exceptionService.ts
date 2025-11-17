import apiUrls from "../constants/apiUrls";
import { IExceptionlog } from "../interfaces/IExceptionlogs";
import { apiPostServiceWithoutToast } from "../utils/apiPostService";

export const GetAllExceptionLogsListService = (data: IExceptionlog) =>
  apiPostServiceWithoutToast({
    url: apiUrls.GetAllExceptionLogsList,
    data: data
  });