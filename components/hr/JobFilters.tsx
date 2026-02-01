import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { FilterState } from "../../hooks/useJobs";

interface JobFiltersProps {
  filters: FilterState;
  totalJobs: number;
  filteredCount: number;
  onFilterChange: (key: keyof FilterState, value: string) => void;
}

export function JobFilters({
  filters,
  totalJobs,
  filteredCount,
  onFilterChange,
}: JobFiltersProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="w-5 h-5" />
          Filters & Search
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="space-y-2">
            <Label>Search Jobs</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by title, description..."
                value={filters.search}
                onChange={(e) => onFilterChange("search", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label>Job Status</Label>
            <Select
              value={
                ["all", "active", "inactive"].includes(filters.status)
                  ? filters.status
                  : "all"
              }
              onValueChange={(value: "all" | "active" | "inactive") =>
                onFilterChange("status", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location Filter */}
          <div className="space-y-2">
            <Label>Location</Label>
            <Input
              placeholder="Filter by location..."
              value={filters.location}
              onChange={(e) => onFilterChange("location", e.target.value)}
            />
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <Label>Sort By</Label>
            <Select
              value={filters.sortBy}
              onValueChange={(value: "date" | "title" | "applications") =>
                onFilterChange("sortBy", value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Posted Date</SelectItem>
                <SelectItem value="title">Job Title</SelectItem>
                <SelectItem value="applications">Applications Count</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Order */}
          <div className="space-y-2">
            <Label>Sort Order</Label>
            <Select
              value={filters.sortOrder}
              onValueChange={(value: "asc" | "desc") =>
                onFilterChange("sortOrder", value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Descending</SelectItem>
                <SelectItem value="asc">Ascending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Counter */}
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600">
            Showing {filteredCount} of {totalJobs} jobs
            {filters.search && ` for "${filters.search}"`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
