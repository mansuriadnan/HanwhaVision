import apiUrls from "../constants/apiUrls";
import { apiGetService } from "../utils/apiGetService";

export const ValidateLicenseService = () =>
  apiGetService<boolean>({
    url: apiUrls.ValidateLicenseEndpoint,
  });
