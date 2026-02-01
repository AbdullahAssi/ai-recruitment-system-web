import { useState, useMemo, useCallback } from "react";
import { Job, FilterState } from "./useJobs";

export function useJobFilters(jobs: Job[]) {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "all",
    location: "",
    sortBy: "date",
    sortOrder: "desc",
  });

  const filteredJobs = useMemo(() => {
    let filtered = [...jobs];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchTerm) ||
          job.description.toLowerCase().includes(searchTerm) ||
          job.location.toLowerCase().includes(searchTerm),
      );
    }

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter((job) =>
        filters.status === "active" ? job.isActive : !job.isActive,
      );
    }

    // Location filter
    if (filters.location) {
      const locationTerm = filters.location.toLowerCase();
      filtered = filtered.filter((job) =>
        job.location.toLowerCase().includes(locationTerm),
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (filters.sortBy) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "applications":
          aValue = a.applications.length;
          bValue = b.applications.length;
          break;
        case "date":
        default:
          aValue = new Date(a.postedDate).getTime();
          bValue = new Date(b.postedDate).getTime();
          break;
      }

      if (filters.sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [jobs, filters]);

  const updateFilter = useCallback((key: keyof FilterState, value: string) => {
    // Validate status values to prevent invalid values from being set
    if (key === "status" && !["all", "active", "inactive"].includes(value)) {
      console.warn(`Invalid status value: ${value}. Resetting to 'all'`);
      setFilters((prev) => ({ ...prev, status: "all" }));
      return;
    }
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: "",
      status: "all",
      location: "",
      sortBy: "date",
      sortOrder: "desc",
    });
  }, []);

  return {
    filters,
    filteredJobs,
    updateFilter,
    clearFilters,
    setFilters,
  };
}
