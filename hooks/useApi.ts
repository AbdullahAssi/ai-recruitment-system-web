import { useState, useCallback } from "react";
import { LoadingState, ApiResponse } from "@/lib/types";

interface UseApiProps<T> {
  initialData?: T;
}

export function useApi<T>({ initialData }: UseApiProps<T> = {}) {
  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState<LoadingState>({
    isLoading: false,
    error: null,
  });

  const executeRequest = useCallback(
    async (requestFn: () => Promise<ApiResponse<T>>): Promise<T | null> => {
      try {
        setLoading({ isLoading: true, error: null });

        const response = await requestFn();

        if (response.success) {
          setData(response.data);
          setLoading({ isLoading: false, error: null });
          return response.data;
        } else {
          const error = response.error || "Request failed";
          setLoading({ isLoading: false, error });
          return null;
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        setLoading({ isLoading: false, error: errorMessage });
        return null;
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setLoading((prev) => ({ ...prev, error: null }));
  }, []);

  const reset = useCallback(() => {
    setData(initialData);
    setLoading({ isLoading: false, error: null });
  }, [initialData]);

  return {
    data,
    loading: loading.isLoading,
    error: loading.error,
    executeRequest,
    clearError,
    reset,
    setData,
  };
}
