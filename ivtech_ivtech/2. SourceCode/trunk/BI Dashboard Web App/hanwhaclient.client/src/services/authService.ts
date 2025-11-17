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

      // Store new access token
      if (response.data != null) {
        localStorage.setItem("accessToken", response.data.accessToken);
        return response.data.accessToken;
      } else {
        return null; // Explicitly return null if data is null
      }
    } else {
      return null; // Explicitly return null if response is not successful
    }
  } catch (error) {
    console.error("Error refreshing token:", error);
    // Handle logout or token invalidation
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    return null; // Explicitly return null on error
  }
};
