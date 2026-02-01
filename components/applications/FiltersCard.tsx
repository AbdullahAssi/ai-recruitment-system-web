import { Filter, Search } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  return (
    <Card className="mb-6 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filters & Search
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Candidates
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={filters.searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search by name or email..."
                className="pl-10"
                aria-label="Search candidates by name or email"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <Select
              value={filters.statusFilter}
              onValueChange={onStatusFilterChange}
              aria-label="Filter by application status"
            >
              <SelectTrigger>
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
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <Select
              value={filters.sortBy}
              onValueChange={onSortByChange}
              aria-label="Sort applications by"
            >
              <SelectTrigger>
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
          <div className="flex items-end">
            <Button
              onClick={onClearFilters}
              variant="outline"
              className="w-full"
              aria-label="Clear all filters"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
