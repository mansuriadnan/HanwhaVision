import { useState, useCallback } from "react";
import { ApiResponse } from "../interfaces/IApiResponse";

export const UseApiHandler = <T, U>() => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const handleApiCall = useCallback(
    async (
      apiFunction: (input: U) => Promise<ApiResponse<T> | string>,
      payload: U
    ) => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiFunction(payload);
        if (typeof result === "string") {
          setError(result);
        } else if (result.isSuccess) {
          setData(result.data);
        } else {
          setError(result.error?.message || "An unknown error occurred");
        }
        return result;
      } catch (err: any) {
        setError(err.message || "An error occurred");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { data, loading, error, handleApiCall };
};
