"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useScores } from "@/hooks/useScores";
import { ScoringData } from "@/lib/types";
import {
  ScoreCard,
  ScoreFilters,
  DetailedAnalysisDialog,
} from "@/components/scores";
import {
  PaginationControls,
  LoadingState,
  ErrorState,
  EmptyState,
} from "@/components/reusables";

export default function ScoresDashboard() {
  const { scores, loading, error, pagination, filters, applyQuickFilter } =
    useScores();

  const [showFilters, setShowFilters] = useState(false);
  const [selectedScore, setSelectedScore] = useState<ScoringData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleViewDetails = (scoreData: ScoringData) => {
    setSelectedScore(scoreData);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center w-full">
        <LoadingState message="Loading AI scores..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to Load Scores"
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Scores Dashboard
          </h1>
          <p className="text-gray-600">
            View and analyze AI-powered candidate scoring results
          </p>
        </div>

        {/* Statistics Card */}
        {scores.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Score Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {scores.length}
                  </div>
                  <div className="text-sm text-blue-700">Total Scores</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {scores.filter((s) => (s.score || 0) >= 80).length}
                  </div>
                  <div className="text-sm text-green-700">High Performers</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(
                      scores.reduce((acc, s) => acc + (s.score || 0), 0) /
                        scores.length
                    ) || 0}
                  </div>
                  <div className="text-sm text-purple-700">Average Score</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {
                      scores.filter(
                        (s) =>
                          s.explanation?.recommendation === "HIGHLY_RECOMMENDED"
                      ).length
                    }
                  </div>
                  <div className="text-sm text-orange-700">
                    Highly Recommended
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <ScoreFilters
          filters={filters.filters}
          showFilters={showFilters}
          activeFilterCount={filters.activeFilterCount}
          onFilterChange={filters.updateFilter}
          onToggleFilters={() => setShowFilters(!showFilters)}
          onClearFilters={filters.resetFilters}
          onApplyQuickFilter={applyQuickFilter}
        />

        {/* Results */}
        {scores.length === 0 ? (
          <EmptyState
            title="No scores found"
            message="No AI scores match your current filters. Try adjusting your search criteria."
            actionLabel="Clear Filters"
            onAction={filters.resetFilters}
          />
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {scores.map((scoreData) => (
                <ScoreCard
                  key={scoreData.id}
                  scoreData={scoreData}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>

            {/* Pagination */}
            <PaginationControls
              pagination={pagination.pagination}
              onPageChange={pagination.goToPage}
              onLimitChange={pagination.setLimit}
            />
          </>
        )}

        {/* Detailed Analysis Dialog */}
        {selectedScore && (
          <DetailedAnalysisDialog
            scoreData={selectedScore}
            open={dialogOpen}
            onOpenChange={setDialogOpen}
          />
        )}
      </div>
    </div>
  );
}
