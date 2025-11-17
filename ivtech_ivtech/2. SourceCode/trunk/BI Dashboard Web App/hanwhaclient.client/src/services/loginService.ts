import { apiPost } from "../utils/api";
import apiUrls from "../constants/apiUrls";
import { ApiResponse } from "../interfaces/IApiResponse";

// Type definition for login request and response
interface LoginRequest {
  userName: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

// export const login = async (
//   loginData: LoginRequest
// ): Promise<LoginResponse> => {
//   try {
//     const response = await axios.post<LoginResponse>(API_URL, loginData);
//     return response.data;
//   } catch (error) {
//     throw new Error("Failed to login");
//   }
// };

export const login = async (
  userName: string,
  password: string
): Promise<ApiResponse<LoginResponse>> => {
  const endpoint = `${apiUrls.UserLogin}`;

  const loginModel = {
    userName: userName,
    password: password,
  };

  // Call apiPost and return the result directly
  return await apiPost<LoginRequest, LoginResponse>(endpoint, loginModel);
};
