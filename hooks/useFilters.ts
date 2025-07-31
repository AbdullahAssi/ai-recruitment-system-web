import { useState, useCallback, useMemo } from "react";
import { FilterParams, SortConfig } from "@/lib/types";

interface UseFiltersProps<T extends FilterParams> {
  initialFilters: T;
  initialSort?: SortConfig;
}

export function useFilters<T extends FilterParams>({
  initialFilters,
  initialSort = { field: "createdAt", direction: "desc" },
}: UseFiltersProps<T>) {
  const [filters, setFilters] = useState<T>(initialFilters);
  const [sortConfig, setSortConfig] = useState<SortConfig>(initialSort);

  const updateFilter = useCallback((key: keyof T, value: T[keyof T]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateFilters = useCallback((newFilters: Partial<T>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const updateSort = useCallback((field: string) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(
      (value) => value !== "" && value !== null && value !== undefined
    );
  }, [filters]);

  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter(
      (value) => value !== "" && value !== null && value !== undefined
    ).length;
  }, [filters]);

  return {
    filters,
    sortConfig,
    updateFilter,
    updateFilters,
    resetFilters,
    updateSort,
    hasActiveFilters,
    activeFilterCount,
  };
}
