import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Filter, X, Search } from 'lucide-react';
import { ScoreFilters as ScoreFiltersType } from '@/lib/types';

interface ScoreFiltersProps {
  filters: ScoreFiltersType;
  showFilters: boolean;
  activeFilterCount: number;
  onFilterChange: (key: keyof ScoreFiltersType, value: string) => void;
  onToggleFilters: () => void;
  onClearFilters: () => void;
  onApplyQuickFilter: (filter: Partial<ScoreFiltersType>) => void;
  className?: string;
}

export function ScoreFilters({
  filters,
  showFilters,
  activeFilterCount,
  onFilterChange,
  onToggleFilters,
  onClearFilters,
  onApplyQuickFilter,
  className = '',
}: ScoreFiltersProps) {
  return (
    <div className={className}>
      {/* Filter Toggle and Quick Filters */}
      <div className="flex flex-wrap gap-4 items-center mb-6">
        <Button
          variant="outline"
          onClick={onToggleFilters}
          className="relative"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-red-600 hover:text-red-700"
          >
            <X className="w-4 h-4 mr-1" />
            Clear all
          </Button>
        )}

        {/* Quick Filter Shortcuts */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600 mr-2">Quick filters:</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onApplyQuickFilter({ minScore: "80", maxScore: "" })
            }
            className="text-green-600 hover:text-green-700"
          >
            High Performers (80+)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onApplyQuickFilter({ recommendation: "HIGHLY_RECOMMENDED" })
            }
            className="text-blue-600 hover:text-blue-700"
          >
            Highly Recommended
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onApplyQuickFilter({ recommendation: "NOT_RECOMMENDED" })
            }
            className="text-red-600 hover:text-red-700"
          >
            Needs Review
          </Button>
        </div>
      </div>

      {/* Detailed Filters */}
      {showFilters && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="w-5 h-5" />
              Advanced Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Search Fields */}
              <div>
                <Label htmlFor="candidateName">Candidate Name</Label>
                <Input
                  id="candidateName"
                  placeholder="Search by candidate name..."
                  value={filters.candidateName}
                  onChange={(e) => onFilterChange('candidateName', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  placeholder="Search by job title..."
                  value={filters.jobTitle}
                  onChange={(e) => onFilterChange('jobTitle', e.target.value)}
                />
              </div>

              {/* Score Range */}
              <div>
                <Label htmlFor="minScore">Min Score</Label>
                <Input
                  id="minScore"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={filters.minScore}
                  onChange={(e) => onFilterChange('minScore', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="maxScore">Max Score</Label>
                <Input
                  id="maxScore"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="100"
                  value={filters.maxScore}
                  onChange={(e) => onFilterChange('maxScore', e.target.value)}
                />
              </div>

              {/* Recommendation */}
              <div>
                <Label htmlFor="recommendation">Recommendation</Label>
                <Select
                  value={filters.recommendation}
                  onValueChange={(value) => onFilterChange('recommendation', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All recommendations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All recommendations</SelectItem>
                    <SelectItem value="HIGHLY_RECOMMENDED">Highly Recommended</SelectItem>
                    <SelectItem value="RECOMMENDED">Recommended</SelectItem>
                    <SelectItem value="CONSIDER">Consider</SelectItem>
                    <SelectItem value="NOT_RECOMMENDED">Not Recommended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div>
                <Label htmlFor="dateFrom">Date From</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => onFilterChange('dateFrom', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="dateTo">Date To</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => onFilterChange('dateTo', e.target.value)}
                />
              </div>

              {/* IDs (for advanced users) */}
              <div>
                <Label htmlFor="applicationId">Application ID</Label>
                <Input
                  id="applicationId"
                  placeholder="Application ID..."
                  value={filters.applicationId}
                  onChange={(e) => onFilterChange('applicationId', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="jobId">Job ID</Label>
                <Input
                  id="jobId"
                  placeholder="Job ID..."
                  value={filters.jobId}
                  onChange={(e) => onFilterChange('jobId', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
