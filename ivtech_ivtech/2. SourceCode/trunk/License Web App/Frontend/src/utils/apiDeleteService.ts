import { showToast } from "../components";
import { ApiResponse } from "../interfaces/IApiResponse";
import { apiDelete } from "./api";

type ApiDeleteRequest = {
  url: string;
};

export const apiDeleteService = async <T>({
  url,
  id,
}: ApiDeleteRequest & { id?: number | string }): Promise<ApiResponse<T>> => {
  try {
    const result = await apiDelete<ApiResponse<T>>(url, id);
    if (result.isSuccess) {
      showToast(result.message, "success");
      return result;
    } else {
      showToast(result.message, "error");
      return result;
    }
  } catch (error) {
    console.error("Error in API DELETE service:", error);
    showToast("Oops! Something went wrong", "error");
    throw error;
  }
};
