import { useState } from "react";

interface ServiceResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export const UseService = <T, P = any>(
  serviceFunction: (params: P) => Promise<T>
) => {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const handleServiceCall = async (params: P) => {
    setLoading(true);
    setError(null); // Reset error state before a new request
    try {
      const result = await serviceFunction(params);
      setData(result);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, handleServiceCall };
};
