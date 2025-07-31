import { useState, useCallback, useMemo } from "react";
import { PaginationData } from "@/lib/types";

interface UsePaginationProps {
  initialPage?: number;
  initialLimit?: number;
}

export function usePagination({
  initialPage = 1,
  initialLimit = 10,
}: UsePaginationProps = {}) {
  const [pagination, setPagination] = useState<PaginationData>({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
  });

  const goToPage = useCallback((page: number) => {
    setPagination((prev) => ({
      ...prev,
      page: Math.max(1, Math.min(page, prev.totalPages)),
    }));
  }, []);

  const goToNextPage = useCallback(() => {
    goToPage(pagination.page + 1);
  }, [pagination.page, goToPage]);

  const goToPreviousPage = useCallback(() => {
    goToPage(pagination.page - 1);
  }, [pagination.page, goToPage]);

  const setLimit = useCallback((limit: number) => {
    setPagination((prev) => ({
      ...prev,
      limit,
      page: 1, // Reset to first page when changing limit
    }));
  }, []);

  const updatePagination = useCallback(
    (newPagination: Partial<PaginationData>) => {
      setPagination((prev) => ({ ...prev, ...newPagination }));
    },
    []
  );

  const hasNextPage = useMemo(
    () => pagination.page < pagination.totalPages,
    [pagination.page, pagination.totalPages]
  );

  const hasPreviousPage = useMemo(() => pagination.page > 1, [pagination.page]);

  return {
    pagination,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    setLimit,
    updatePagination,
    hasNextPage,
    hasPreviousPage,
  };
}
