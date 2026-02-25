import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { CandidateFilters } from "../../hooks/useCandidates";

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
  const hasFilters = !!(filters.searchTerm || filters.experienceFilter);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Filters</span>
          <span className="text-xs text-muted-foreground">
            {filteredCount} of {totalCandidates} candidates
          </span>
        </div>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-7 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="w-3 h-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
          <Input
            placeholder="Search by name or email..."
            value={filters.searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9 bg-muted border-transparent focus:border-border text-sm"
          />
        </div>

        <Select
          value={filters.experienceFilter || "all"}
          onValueChange={(v) => onExperienceFilterChange(v === "all" ? "" : v)}
        >
          <SelectTrigger className="h-9 bg-muted border-transparent focus:border-border text-sm">
            <SelectValue placeholder="All Experience" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Experience</SelectItem>
            <SelectItem value="0-2">0–2 yrs (Junior)</SelectItem>
            <SelectItem value="3-5">3–5 yrs (Mid-level)</SelectItem>
            <SelectItem value="6-10">6–10 yrs (Senior)</SelectItem>
            <SelectItem value="10">10+ yrs (Expert)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
