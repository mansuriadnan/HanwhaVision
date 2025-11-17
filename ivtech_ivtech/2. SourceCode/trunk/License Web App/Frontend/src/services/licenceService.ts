import apiUrls from "../constants/apiUrls";
import { apiPostService } from "../utils/apiPostService";
import { apiGetService, apiGetServiceFullResponse } from "../utils/apiGetService";
import { IApiResponse, ILicence, IResendLicensePayload } from "../interfaces/ILicense";


export const GetAllLicenceService = () =>
  apiGetServiceFullResponse<IApiResponse>({
    url: apiUrls.GetAllLicence,
  });


export const UpdateLicenseService = (
  license: Omit<ILicence, "createdDateTime" | "lastUpdatedDateTime">
) =>
  apiPostService<Omit<ILicence, "createdDateTime" | "lastUpdatedDateTime">>({
    url: apiUrls.UpdateLicence,
    data: license,
  });

export const AddLicenseService = (
  license: Omit<ILicence, "createdDateTime" | "lastUpdatedDateTime">
) =>
  apiPostService<Omit<ILicence, "createdDateTime" | "lastUpdatedDateTime">>({
    url: apiUrls.AddLicence,
    data: license,
  });


export const GenerateLicenseService = (
  license: Omit<ILicence, "createdDateTime" | "lastUpdatedDateTime">
) =>
  apiPostService<Omit<ILicence, "createdDateTime" | "lastUpdatedDateTime">>({
    url: apiUrls.GenerateLicense,
    data: license,
  });


export const GetLicenceByClientIDService = (id: string) =>
  apiGetServiceFullResponse<IApiResponse>({
    url: apiUrls.GetLicenceByID,
    id: id
  });

export const resendLicenseService = (data: IResendLicensePayload) =>
  apiPostService({
    url: apiUrls.ResendLicense,
    data:data
  });

  export const GetDownloadLicense = (id : string) =>
    apiGetServiceFullResponse<IApiResponse>({
      url: apiUrls.DownloadLicense,
      id: id
    });