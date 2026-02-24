import React from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterState } from "../../hooks/useJobs";

interface JobFiltersProps {
  filters: FilterState;
  totalJobs: number;
  filteredCount: number;
  onFilterChange: (key: string, value: string) => void;
}

export function JobFilters({
  filters,
  totalJobs,
  filteredCount,
  onFilterChange,
}: JobFiltersProps) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Filters
          </span>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {filteredCount} of {totalJobs} {totalJobs === 1 ? "job" : "jobs"}
        </span>
      </div>

      {/* Filter grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search  spans 2 cols on large */}
        <div className="relative sm:col-span-2 lg:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search jobs..."
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
            className="h-9 pl-9 text-sm bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-500"
          />
        </div>

        {/* Status */}
        <Select
          value={filters.status}
          onValueChange={(v) => onFilterChange("status", v)}
        >
          <SelectTrigger className="h-9 text-sm bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 dark:text-gray-200">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort By */}
        <Select
          value={filters.sortBy}
          onValueChange={(v) => onFilterChange("sortBy", v)}
        >
          <SelectTrigger className="h-9 text-sm bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 dark:text-gray-200">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date Posted</SelectItem>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="applications">Applications</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Order */}
        <Select
          value={filters.sortOrder}
          onValueChange={(v) => onFilterChange("sortOrder", v)}
        >
          <SelectTrigger className="h-9 text-sm bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 dark:text-gray-200">
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Newest First</SelectItem>
            <SelectItem value="asc">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
