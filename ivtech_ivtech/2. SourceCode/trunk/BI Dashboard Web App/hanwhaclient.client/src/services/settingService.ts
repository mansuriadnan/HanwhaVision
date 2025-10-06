import apiUrls from "../constants/apiUrls";
import {
  ILicenseData,
  ILicenseDetailFullResponse,
  ILicenseHistory,
} from "../interfaces/ILicense";
import {
  IFTPSettings,
  IOnOffReportScheduler,
  IOperationalTimeZone,
  IReportSchedulerSettings,
  ISmtpSettings,
} from "../interfaces/ISettings";
import {
  apiGetService,
  apiGetServiceFullResponse,
} from "../utils/apiGetService";
import {
  apiPostService,
  apiPostServiceForWidgets,
  apiPostServiceWithoutToast,
  downloadFile,
} from "../utils/apiPostService";

export const saveSmtpSettings = (smtpSettings: ISmtpSettings) =>
  apiPostService<ISmtpSettings>({
    url: apiUrls.SaveSmtpSetting,
    data: smtpSettings,
  });

export const GetMachineIdService = () =>
  apiGetService<string>({
    url: apiUrls.GetHardwareIdEndpoint,
  });

export const uploadCustomerLogo = (formData: FormData) =>
  apiPostService<FormData>({
    url: apiUrls.UploadClientLogo,
    data: formData,
    isFormData: true,
  });

export const uploadClientLicenseKey = (formData: FormData) =>
  apiPostService<FormData>({
    url: apiUrls.UploadLicenseKey,
    data: formData,
    isFormData: true,
  });

export const uploadClientLicense = (formData: FormData) =>
  apiPostService<FormData>({
    url: apiUrls.UploadLicense,
    data: formData,
    isFormData: true,
  });

// export const GetCurrentLicenseDetailService = () =>
//   apiGetServiceFullResponse<ILicenseDetailFullResponse>({
//     url: apiUrls.GetcurrentLicenseDetail,
//   });

export const GetCurrentLicenseDetailService = () =>
  apiGetService<ILicenseData>({
    url: apiUrls.GetcurrentLicenseDetail,
  });

export const GetAllLicenseHistoryService = () =>
  apiGetServiceFullResponse<ILicenseHistory[]>({
    url: apiUrls.GetLicensehistory,
  });

export const saveOperationalTimeZoneSettings = (
  payload: IOperationalTimeZone
) =>
  apiPostService<IOperationalTimeZone>({
    url: apiUrls.SaveOperationalTimeZoneSetting,
    data: payload,
  });

export const GetClientSettingsData = () =>
  apiGetServiceFullResponse({
    url: apiUrls.GetClientSettings,
  });

export const GetTimeZoneDropdownData = () =>
  apiGetServiceFullResponse({
    url: apiUrls.GetTimeZoneDropdownData,
  });

export const saveTimeZoneSetting = (
  payload: Pick<IOperationalTimeZone, "timeZone">
) =>
  apiPostService({
    url: apiUrls.SaveTimeZoneSetting,
    data: payload,
  });

export const saveOperationTimeSetting = (
  payload: Pick<IOperationalTimeZone, "startTime" | "endTime">
) =>
  apiPostService({
    url: apiUrls.SaveOperationalTimeSetting,
    data: payload,
  });

export const saveGoogleMapApIKeySetting = (
  payload: Pick<IOperationalTimeZone, "timeZone">
) =>
  apiPostService({
    url: apiUrls.saveGoogleMapApIKeySetting,
    data: payload,
  });

export const databaseBackupService = () =>
  downloadFile({
    url: apiUrls.BackupDatabase,
    method: "GET",
    responseType: "application/octet-stream",
  });
export const uploadBackupFileService = (formData: FormData) =>
  apiPostService<FormData>({
    url: apiUrls.RestoreDatabase,
    data: formData,
    isFormData: true,
  });

export const restoreChunkFileService = (formData: FormData) =>
  apiPostServiceForWidgets<FormData>({
    url: apiUrls.RestoreChunkDatabase,
    data: formData,
    isFormData: true,
  });

export const restoreFinalFileService = (formData: any) =>
  apiPostService<any>({
    url: apiUrls.RestoreFinalDatabase,
    data: formData,
    isFormData: false,
  });

export const saveFTPSettings = (ftpSettings: IFTPSettings) =>
  apiPostService<IFTPSettings>({
    url: apiUrls.SaveFtpSetting,
    data: ftpSettings,
  });
export const uploadsslCertificateService = (formData: FormData) =>
  apiPostService<FormData>({
    url: apiUrls.SaveSSLCertificate,
    data: formData,
    isFormData: true,
  });
export const uploadFullLicense = (formData: FormData) =>
  apiPostServiceWithoutToast<FormData>({
    url: apiUrls.UploadFullLicense, // This should point to your single combined API
    data: formData,
    isFormData: true,
  });

export const GetVideoStream = (id: string) =>
  apiGetServiceFullResponse({
    url: apiUrls.StreamVideo,
    id: id,
  });
export const saveReportSchedulerSettings = (
  reportSettings: IReportSchedulerSettings
) =>
  apiPostService<IReportSchedulerSettings>({
    url: apiUrls.SaveReportSchedulerSetting,
    data: reportSettings,
  });
export const onOffReportSchedulerService = (payload: IOnOffReportScheduler) =>
  apiPostService<IOnOffReportScheduler>({
    url: apiUrls.TurnReportSchedule,
    data: payload,
  });
