import { showToast } from "../components";
import apiUrls from "../constants/apiUrls";
import { ApiResponse } from "../interfaces/IApiResponse";
import { apiPost } from "./api";

type ApiPostRequest<T> = {
  url: string;
  data: T;
  isFormData?: boolean;
};

export const apiPostService = async <T>({
  url,
  data,
  isFormData = false,
}: ApiPostRequest<T>): Promise<ApiResponse<T> | string> => {
  try {
    const result = await apiPost<T, T>(url, data, null, isFormData);
    if (result.isSuccess) {
      if (!url.includes(apiUrls.ChangePassword) && !url.includes(apiUrls.ForgotResetPassword)) {
        showToast(result.message, "success");
      }
      return result;
    } else {
      showToast(result.message, "error");
      return result.message || "An unknown error occurred";
    }
  } catch (error) {
    console.error("Error in API service:", error);
    showToast("Oops! Something went wrong", "error");
    throw error;
  }
};

export const apiPostServiceNewReqRes = async <Req, Res>({
  url,
  data,
}: ApiPostRequest<Req>): Promise<ApiResponse<Res> | string> => {
  try {
    const result = await apiPost<Req, Res>(url, data);
    if (result.isSuccess) {
      showToast(result.message, "success");
      return result;
    } else {
      showToast(result.message, "error");
      return result.message || "An unknown error occurred";
    }
  } catch (error) {
    console.error("Error in API service:", error);
    showToast("Oops! Something went wrong", "error");
    throw error;
  }
};
