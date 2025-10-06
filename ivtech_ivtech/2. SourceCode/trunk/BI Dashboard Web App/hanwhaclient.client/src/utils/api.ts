import { showToast } from "../components/Reusable/Toast";
import { ApiResponse } from "../interfaces/IApiResponse";
import { refreshAccessToken } from "../services/authService";
import { LoadingManager } from "./LoadingManager";

const apiKey: string = encodeURIComponent(
  import.meta.env.VITE_REACT_APP_API_KEY as string
);

const handleError = (error: any): string => {
  console.error("API Error:", error);
  return error.message || "An unknown error occurred";
};

export const apiHandleResponse = async <T>(
  response: Response
): Promise<ApiResponse<T>> => {
  const result: ApiResponse<T> = await response.json();
  return result;
};

// const createHeaders = (token: string | null, isFormData: boolean | undefined): HeadersInit => ({
//   "Content-Type": isFormData ? "multipart/form-data" : "application/json",
//   "X-API-Key": apiKey,
//   ...(token && { Authorization: `Bearer ${token}` }),
// });

const createHeaders = (
  token: string | null,
  isFormData: boolean | undefined
): HeadersInit => {
  const headers: HeadersInit = {
    "X-API-Key": apiKey,
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
};

const fetchWithToken = async (endpoint: string, token: string | null) => {
  return fetch(`${endpoint}`, {
    method: "GET",
    headers: createHeaders(token, false),
  });
};

// Modified GET request with loading state
export const apiGet = async <T>(
  endpoint: string,
  id?: number | string
): Promise<ApiResponse<T>> => {
  try {
    LoadingManager.showLoading();

    let token: string | null = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("You are unauthorized.");
    }

    const url = id ? `${endpoint}/${id}` : endpoint;
    let response = await fetchWithToken(url, token);
    let result = await apiHandleResponse<T>(response);
    if (response.status === 401) {
      if (result.error?.message.includes("API key")) {
        throw new Error(
          "Oops! It looks like your API key is invalid. Please double-check it and try again."
        );
      } else if (token) {
        token = await refreshAccessToken();
        response = await fetchWithToken(url, token);
        result = await apiHandleResponse<T>(response);
      }
    }

    return result; // Always return ApiResponse<T>
  } catch (error) {
    throw new Error(handleError(error));
  } finally {
    LoadingManager.hideLoading();
  }
};

// Modified POST request with loading state
export const apiPost = async <T, U>(
  endpoint: string,
  body: T,
  token?: string | null,
  isFormData?: boolean
): Promise<ApiResponse<U>> => {
  try {
    LoadingManager.showLoading(); // Show loading at the start

    if (endpoint.includes("ForgotPassword")) {
      token = null;
    } else {
      token = token || localStorage.getItem("accessToken");
    }
    const headers: HeadersInit = createHeaders(token, isFormData);
    const response = await fetch(endpoint, {
      method: "POST",
      headers: headers,
      body: isFormData ? (body as any) : JSON.stringify(body),
    });

    let result = await apiHandleResponse<U>(response);

    if (response.status === 401) {
      if (result.error?.message.includes("API key")) {
        throw new Error(
          "Oops! It looks like your API key is invalid. Please double-check it and try again."
        );
      } else {
        if(!endpoint.includes("Auth/refreshToken")){
          token = await refreshAccessToken();
          const retryResponse = await fetch(endpoint, {
            method: "POST",
            headers: createHeaders(token, isFormData),
            body: isFormData ? (body as any) : JSON.stringify(body),
          });
          result = await apiHandleResponse<U>(retryResponse);
        }else{
          window.location.href = "/login";
        }
        
      }
    }

    return result;
  } catch (error) {
    throw new Error(handleError(error));
  } finally {
    LoadingManager.hideLoading(); // Hide loading whether success or failure
  }
};

export const apiPostForWidget = async <T, U>(
  endpoint: string,
  body: T,
  token?: string | null,
  isFormData?: boolean
): Promise<ApiResponse<U>> => {
  try { 
    if (endpoint.includes("ForgotPassword")) {
      token = null;
    } else {
      token = token || localStorage.getItem("accessToken");
    }
    const headers: HeadersInit = createHeaders(token, isFormData);
    const response = await fetch(endpoint, {
      method: "POST",
      headers: headers,
      body: isFormData ? (body as any) : JSON.stringify(body),
    });

    let result = await apiHandleResponse<U>(response);

    if (response.status === 401) {
      if (result.error?.message.includes("API key")) {
        throw new Error(
          "Oops! It looks like your API key is invalid. Please double-check it and try again."
        );
      } else {
        token = await refreshAccessToken();
        const retryResponse = await fetch(endpoint, {
          method: "POST",
          headers: createHeaders(token, isFormData),
          body: isFormData ? (body as any) : JSON.stringify(body),
        });
        result = await apiHandleResponse<U>(retryResponse);
      }
    }

    return result;
  } catch (error) {
    throw new Error(handleError(error));
  } 
};

export const apiPostWithDataAndMessage = async <T, U>(
  url: string,
  body: T,
  isFormData: boolean = false
): Promise<U> => {
  try {
    const result = await apiPost<T, U>(url, body, null, isFormData);

    if (result.isSuccess) {
      showToast(result.message || "Operation successful", "success");
      return result.data as U;
    } else {
      showToast(result.message || "Something went wrong", "error");
      throw new Error(result.message || "API failed");
    }
  } catch (error: any) {
    console.error("apiPostWithMessage error:", error);
    showToast(error.message || "Oops! Something went wrong", "error");
    throw error;
  }
};

export const apiGetForWidget = async <T>(
  endpoint: string,
  id?: number | string
): Promise<ApiResponse<T>> => {
  try {
  
    let token: string | null = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("You are unauthorized.");
    }

    const url = id ? `${endpoint}/${id}` : endpoint;
    let response = await fetchWithToken(url, token);
    let result = await apiHandleResponse<T>(response);
    if (response.status === 401) {
      if (result.error?.message.includes("API key")) {
        throw new Error(
          "Oops! It looks like your API key is invalid. Please double-check it and try again."
        );
      } else if (token) {
        token = await refreshAccessToken();
        response = await fetchWithToken(url, token);
        result = await apiHandleResponse<T>(response);
      }
    }

    return result; // Always return ApiResponse<T>
  } catch (error) {
    throw new Error(handleError(error));
  } 
};

// Modified DELETE request with loading state
export const apiDelete = async <T>(
  endpoint: string,
  id?: number | string,
  token?: string | null
): Promise<T> => {
  try {
    LoadingManager.showLoading(); // Show loading at the start

    token = token || localStorage.getItem("accessToken");
    const response = await fetch(`${endpoint}/${id}`, {
      method: "DELETE",
      headers: createHeaders(token, false),
    });

    let result = await response.json();

    if (response.status === 401) {
      if (result.error?.message.includes("API key")) {
        throw new Error(
          "Oops! It looks like your API key is invalid. Please double-check it and try again."
        );
      } else {
        token = await refreshAccessToken();
        const retryResponse = await fetch(endpoint, {
          method: "DELETE",
          headers: createHeaders(token, false),
        });
        result = await apiHandleResponse<T>(retryResponse);
      }
    }

    return result;
  } catch (error) {
    throw new Error(handleError(error));
  } finally {
    LoadingManager.hideLoading(); // Hide loading whether success or failure
  }
};


