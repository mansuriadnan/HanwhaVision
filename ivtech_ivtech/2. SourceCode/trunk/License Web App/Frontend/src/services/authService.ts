import { apiPost } from "../utils/api";
import apiUrls from "../constants/apiUrls";

export const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) throw new Error("No refresh token found");

  try {
    const endpoint = `${apiUrls.RefreshToken}`;
    const response = await apiPost<
      { refreshToken: string },
      { accessToken: string }
    >(endpoint, { refreshToken: refreshToken }, refreshToken);

    if (response.isSuccess) {
      if (response.data != null) {
        localStorage.setItem("accessToken", response.data.accessToken);
        return response.data.accessToken;
      } else {
        return null; 
      }
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error refreshing token:", error);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    return null;
  }
};
