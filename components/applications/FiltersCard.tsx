import { SlidersHorizontal, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterState } from "../../types/application.types";

interface FiltersCardProps {
  filters: FilterState;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onSortByChange: (value: string) => void;
  onClearFilters: () => void;
}

export function FiltersCard({
  filters,
  onSearchChange,
  onStatusFilterChange,
  onSortByChange,
  onClearFilters,
}: FiltersCardProps) {
  const hasActiveFilters =
    filters.searchTerm !== "" ||
    filters.statusFilter !== "all" ||
    filters.sortBy !== "newest";

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-brand" />
          <span className="text-sm font-semibold text-foreground">Filters</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear all filters"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {/* Filter row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative sm:col-span-2 lg:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={filters.searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name or email..."
            className="h-9 pl-9 text-sm bg-muted border-border text-foreground placeholder:text-muted-foreground"
            aria-label="Search candidates by name or email"
          />
        </div>

        {/* Status */}
        <Select
          value={filters.statusFilter}
          onValueChange={onStatusFilterChange}
          aria-label="Filter by application status"
        >
          <SelectTrigger className="h-9 text-sm bg-muted border-border text-foreground">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="shortlisted">Shortlisted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="quiz_pending">Quiz Pending</SelectItem>
            <SelectItem value="quiz_completed">Quiz Completed</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort By */}
        <Select
          value={filters.sortBy}
          onValueChange={onSortByChange}
          aria-label="Sort applications by"
        >
          <SelectTrigger className="h-9 text-sm bg-muted border-border text-foreground">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="score-high">Highest Score</SelectItem>
            <SelectItem value="score-low">Lowest Score</SelectItem>
            <SelectItem value="name">Name (A-Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
