import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { CandidateFilters } from "../../hooks/useCandidates";
import { formatExperienceFilter } from "../../lib/candidateUtils";

interface CandidateFiltersCardProps {
  filters: CandidateFilters;
  totalCandidates: number;
  filteredCount: number;
  onSearchChange: (value: string) => void;
  onExperienceFilterChange: (value: string) => void;
  onClearFilters: () => void;
}

export function CandidateFiltersCard({
  filters,
  totalCandidates,
  filteredCount,
  onSearchChange,
  onExperienceFilterChange,
  onClearFilters,
}: CandidateFiltersCardProps) {
  return (
    <Card className="mb-6 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Filter Candidates
          </h3>
          <span className="text-sm text-gray-500">
            ({filteredCount} of {totalCandidates} candidates)
          </span>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name or email..."
                value={filters.searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <select
              value={filters.experienceFilter}
              onChange={(e) => onExperienceFilterChange(e.target.value)}
              className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Experience Levels</option>
              <option value="0-2">0-2 years (Junior)</option>
              <option value="3-5">3-5 years (Mid-level)</option>
              <option value="6-10">6-10 years (Senior)</option>
              <option value="10">10+ years (Expert)</option>
            </select>
          </div>

          <div>
            <Button
              onClick={onClearFilters}
              variant="outline"
              className="w-full"
              disabled={!filters.searchTerm && !filters.experienceFilter}
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {(filters.searchTerm || filters.experienceFilter) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {filters.searchTerm && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Search: "{filters.searchTerm}"
              </span>
            )}
            {filters.experienceFilter && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Experience: {formatExperienceFilter(filters.experienceFilter)}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
