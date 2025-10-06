import { showToast } from "../components/Reusable/Toast";
import { ApiResponse } from "../interfaces/IApiResponse";
import { apiPost, apiPostForWidget, apiPostWithDataAndMessage } from "./api";
import { LoadingManager } from "./LoadingManager";

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

export const apiPostServiceNewReqRes = async <Req, Res>({
  url,
  data,
}: ApiPostRequest<Req>): Promise<ApiResponse<Res> | string> => {
  try {
    const result = await apiPost<Req, Res>(url, data);
    if (result.isSuccess) {
      return result;
    } else {
      return result.message || "An unknown error occurred";
    }
  } catch (error) {
    console.error("Error in API service:", error);
    throw error;
  }
};

export const apiPostServiceForWidgets = async <T>({
  url,
  data,
  isFormData = false,
}: ApiPostRequest<T>): Promise<ApiResponse<T> | string> => {
  try {
    const result = await apiPostForWidget<T, T>(url, data, null, isFormData);
    if (result.isSuccess) {
      return result;
    } else {
      return result.message || "An unknown error occurred";
    }
  } catch (error) {
    console.error("Error in API service:", error);
    showToast("Oops! Something went wrong", "error");
    throw error;
  }
};

export const apiPostServiceWithoutToast = async <T>({
  url,
  data,
  isFormData = false,
}: ApiPostRequest<T>): Promise<ApiResponse<T> | string> => {
  try {
    const result = await apiPost<T, T>(url, data, null, isFormData);
    if (result.isSuccess) {
      return result;
    } else {
      return result.message || "An unknown error occurred";
    }
  } catch (error) {
    console.error("Error in API service:", error);
    showToast("Oops! Something went wrong", "error");
    throw error;
  }
};

type DownloadOptions<T> = {
  url: string;
  data?: T;
  fileName?: string;
  isFormData?: boolean;
  contentType?: string; // Optional override for content-type
  method?: "POST" | "GET"; // Optional method override, default is POST
};

// export const downloadFile = async <T>({
//   url,
//   data,
//   fileName = "download.pdf",
//   isFormData = false,
//   contentType = "application/json",
// }: DownloadOptions<T>): Promise<void> => {
//   try {
    
//   LoadingManager.showLoading();
//     let token = localStorage.getItem("accessToken");
//     const headers: HeadersInit = {
//       Authorization: token ? `Bearer ${token}` : "",
//     };

//     if (!isFormData) {
//       headers["Content-Type"] = contentType;
//     }

//     const response = await fetch(url, {
//       method: "POST",
//       headers,
//       body: isFormData ? (data as any) : JSON.stringify(data),
//     });



//     if (!response.ok) {
//       throw new Error(`File download failed: ${response.statusText}`);
//     }
    
//     const blob = await response.blob();
//     if (blob) {
//       LoadingManager.hideLoading();
//     }
//     const blobUrl = window.URL.createObjectURL(blob);

//     const link = document.createElement("a");
//     link.href = blobUrl;
//     link.download = fileName;
//     document.body.appendChild(link);
//     link.click();
//     link.remove();
//     window.URL.revokeObjectURL(blobUrl);
    
//   } catch (error) {
//     console.error("Download failed:", error);
//     showToast("Failed to download file.", "error");
//     throw error
//   } finally {
    
//   }
// };
export const downloadFile = async <T>({
  url,
  data,
  fileName = "download.pdf",
  isFormData = false,
  contentType = "application/json",
  method = "POST",
  responseType = "application/octet-stream", // 🔹 NEW param
}: DownloadOptions<T> & { responseType?: string }): Promise<void> => {
  try {
    LoadingManager.showLoading();

    const token = localStorage.getItem("accessToken");
    const headers: HeadersInit = {
      Authorization: token ? `Bearer ${token}` : "",
      Accept: responseType ?? "application/octet-stream",
    };

    if (!isFormData && method === "POST") {
      headers["Content-Type"] = contentType;
    }

    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    if (method === "POST") {
      fetchOptions.body = isFormData ? (data as any) : JSON.stringify(data);
    }

    let requestUrl = url;
    if (method === "GET" && data) {
      const query = new URLSearchParams(data as Record<string, string>).toString();
      requestUrl += `?${query}`;
    }

    const response = await fetch(requestUrl, fetchOptions);

    if (!response.ok) {
      throw new Error(`File download failed: ${response.statusText}`);
    }

    const disposition = response.headers.get("Content-Disposition");
    let suggestedFileName = fileName;
    if (disposition) {
  // 1. Prefer filename*= (RFC 5987)
  const filenameStarMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (filenameStarMatch?.[1]) {
    try {
      suggestedFileName = decodeURIComponent(filenameStarMatch[1].replace(/['"]/g, "").trim());
    } catch (e) {
      console.warn("Failed to decode filename*:", e);
    }
  } else {
    // 2. Fallback to regular filename=
    const filenameMatch = disposition.match(/filename=([^;]+)/i);
    if (filenameMatch?.[1]) {
      suggestedFileName = decodeURIComponent(filenameMatch[1].replace(/['"]/g, "").trim());
    }
  }
}

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = suggestedFileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);

  } catch (error) {
    console.error("Download failed:", error);
    showToast("Failed to download file.", "error");
    throw error;
  } finally {
     LoadingManager.hideLoading();
  }
};


export const apiPostServiceWithDataAndMessage = async <T, U>({
  url,
  data,
  isFormData = false,
}: ApiPostRequest<T>): Promise<U> => {
  return await apiPostWithDataAndMessage<T, U>(url, data, isFormData);
};