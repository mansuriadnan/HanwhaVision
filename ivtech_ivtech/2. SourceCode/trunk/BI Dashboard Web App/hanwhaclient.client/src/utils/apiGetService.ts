import { ApiResponse } from "../interfaces/IApiResponse";
import { apiGet, apiGetForWidget } from "./api";

type ApiGetRequest = {
  url: string;
};

// export const apiGetService = async <T>({
//   url,
//   id,
// }: ApiGetRequest & { id?: number | string }): Promise<T> => {
//   try {

//     const result = await apiGet<T>(url, id); // Pass the id to the apiGet method
//     if (result.isSuccess && result.data !== null) {
//       return result.data;
//     }
//     else if(!result.isSuccess && result.data !== null){
//       return result.data;
//     }
//     else {
//       throw new Error("Failed to fetch data or result is empty.");
//     }
//   } catch (error) {
//     console.error("Error in API GET service:", error);
//     throw error;
//   }
// };

export const apiGetService = async <T>({
  url,
  id,
}: ApiGetRequest & { id?: number | string }): Promise<T> => {
  try {
    const result = await apiGet<T>(url, id);

    if (result.data !== null) {
      return result.data;
    } else if (result.data == null) {
      return (Array.isArray([] as T) ? [] : {}) as T;
    } else result.isSuccess === false;
    {
      throw new Error("Failed to fetch data.");
    }
    // throw new Error(
    //   result.isSuccess ? "Data is empty." : "Failed to fetch data."
    // );
  } catch (error) {
    console.error("Error in API GET service:", error);
    throw error;
  }
};


export const apiGetServiceForWidget = async <T>({
  url,
  id,
}: ApiGetRequest & { id?: number | string }): Promise<T> => {
  try {
    const result = await apiGetForWidget<T>(url, id);

    if (result.data !== null) {
      return result.data;
    } else if (result.data == null) {
      return (Array.isArray([] as T) ? [] : {}) as T;
    } else result.isSuccess === false;
    {
      throw new Error("Failed to fetch data.");
    }
    // throw new Error(
    //   result.isSuccess ? "Data is empty." : "Failed to fetch data."
    // );
  } catch (error) {
    console.error("Error in API GET service:", error);
    throw error;
  }
};

export const apiGetServiceFullResponse = async <T>({
  url,
  id,
}: ApiGetRequest & { id?: number | string }): Promise<ApiResponse<T> | T> => {
  try {
    const response = await apiGet<T>(url, id); // Now always returns ApiResponse<T>

    if (response.isSuccess) {
      if (response.data && response.referenceData == null) {
        // Return both `data` and `referenceData` as an object (referenceData is optional)
        return response.data;
      } else if (response.referenceData != null) {
        return response;
      } else {
        throw new Error("Data is null in the API response.");
      }
    } else {
      throw new Error(response.error?.message || "Failed to fetch data.");
    }
  } catch (error) {
    console.error("Error in API GET service:", error);
    throw error;
  }
};
