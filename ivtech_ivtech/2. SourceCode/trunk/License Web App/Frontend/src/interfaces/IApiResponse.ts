import { iOptionModelResponse } from "./iOptionModelResponse";

// interfaces/ApiResponse.ts
export interface ApiResponse<T> {
  data: T | null;
  error: {
    code: string;
    message: string;
  } | null;
  isSuccess: boolean;
  responseMessage: string;
  statusCode: string;
  message: string;
  referenceData?: iOptionModelResponse;
}
