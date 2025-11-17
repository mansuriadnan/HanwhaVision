import apiUrls from "../constants/apiUrls";
import User from "../interfaces/ICreateUser";
import { ApiResponse } from "../interfaces/IApiResponse";
import { apiPostService } from "../utils/apiPostService";
import { apiGetService ,apiGetServiceFullResponse} from "../utils/apiGetService";
import { apiDeleteService } from "../utils/apiDeleteService";
import { IClient, IDashBoardOverview } from "../interfaces/IGetAllClients";
import { ITopLicenseDue } from "../interfaces/ILicense";

export const GetAllClientsService = () =>
  apiGetServiceFullResponse<ApiResponse<IClient[]>>({
    url: apiUrls.GetAllCustomer,
  });

export const UpdateClientService = (
  client: Omit<IClient, "createdDateTime" | "lastUpdatedDateTime">
) =>
  apiPostService<Omit<IClient, "createdDateTime" | "lastUpdatedDateTime">>({
    url: apiUrls.UpdateCustomer,
    data: client,
  });

export const AddClientService = (
  client: Omit<IClient, "createdDateTime" | "lastUpdatedDateTime">
) =>
  apiPostService<Omit<IClient, "createdDateTime" | "lastUpdatedDateTime">>({
    url: apiUrls.AddCustomer,
    data: client,
  });

export const DeleteClientService = (id: string) =>
  apiDeleteService({
    url: apiUrls.DeleteCustomer,
    id: id,
  });

export const GetTopClientsService = () =>
  apiGetService<IClient[]>({
    url: apiUrls.GetTopCustomer,
  });

export const GetOverviewDataService = (startDate: string, endDate: string) =>
  apiGetService<IDashBoardOverview>({
    url: `${apiUrls.DashboardOverview}?startDate=${startDate}&endDate=${endDate}`,
  });

export const GetTopLicenseService = () =>
  apiGetService<ITopLicenseDue[]>({
    url: apiUrls.TopLicenseDue,
  });
