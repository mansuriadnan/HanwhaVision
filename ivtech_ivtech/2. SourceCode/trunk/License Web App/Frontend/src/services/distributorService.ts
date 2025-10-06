import apiUrls from "../constants/apiUrls";
import { ApiResponse } from "../interfaces/IApiResponse";
import { apiPostService } from "../utils/apiPostService";
import {
  apiGetService,
  apiGetServiceFullResponse,
} from "../utils/apiGetService";
import { apiDeleteService } from "../utils/apiDeleteService";
import { Idistributor, IAdddistributor } from "../interfaces/IDistributor";

export const GetAllDistributorService = () =>
  apiGetServiceFullResponse<ApiResponse<Idistributor[]>>({
    url: apiUrls.GetAllDistributor,
  });

export const AddUpdateDistributorService = (
  distributor: Omit<IAdddistributor, "createdDateTime" | "lastUpdatedDateTime">
) =>
  apiPostService<
    Omit<IAdddistributor, "createdDateTime" | "lastUpdatedDateTime">
  >({
    url: apiUrls.AddUpdateDistributor,
    data: distributor,
  });

export const DeleteDistributorService = (id: string) =>
  apiDeleteService({
    url: apiUrls.DeleteDistributor,
    id: id,
  });
