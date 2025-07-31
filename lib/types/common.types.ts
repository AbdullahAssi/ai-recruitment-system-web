// Common types used across the application

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface FilterParams {
  [key: string]: string | number | boolean | undefined;
}

export interface SortConfig {
  field: string;
  direction: "asc" | "desc";
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
  pagination?: PaginationData;
}

// UI Component Props
export interface BaseCardProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

// Filter and Search
export interface BaseFilters {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface DateRange {
  from?: Date;
  to?: Date;
}
