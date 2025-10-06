import apiUrls from "../constants/apiUrls";
import {
  IPdfReportRequest,
  IReport,
  ZoneDetailsRequest,
} from "../interfaces/IReport";
import { apiDeleteService } from "../utils/apiDeleteService";
import { apiGetServiceFullResponse } from "../utils/apiGetService";
import { apiPostService, apiPostServiceForWidgets, downloadFile } from "../utils/apiPostService";

export const GetReportList = () =>
  apiGetServiceFullResponse({
    url: apiUrls.GetAllReports,
  });
export const AddEditReportService = (data: IReport) =>
  apiPostService({
    url: apiUrls.AddEditReports,
    data: data,
  });

export const DeleteReportService = (id: string) =>
  apiDeleteService({
    url: apiUrls.DeleteReport,
    id: id,
  });

export const pdfReportService = (data: any) =>
  downloadFile({
    url: apiUrls.GenerateReportPDF,
    data: data.data,
    fileName: data.fileName,
    method: "POST",
    responseType: "application/pdf",
  });

export const GetReportDetailsbyId = (id: string) =>
  apiGetServiceFullResponse({
    url: apiUrls.GetReportDetailsbyId + "/" + id,
  });

export const GetFloorBySiteIdService = (id: string) =>
  apiGetServiceFullResponse({
    url: apiUrls.GetAllFloorBySiteId + "/" + id,
  });
export const GetAllZoneBySiteIdService = (data: ZoneDetailsRequest) =>
  apiPostServiceForWidgets({
    url: apiUrls.GetAllZoneBySiteId,
    data: data,
  });

export const csvWidgetService = (data: any, apiUrls: string) =>
  downloadFile({
    url: apiUrls,
    data: data.data,
    method: "POST",
    responseType: "text/csv",
  });
