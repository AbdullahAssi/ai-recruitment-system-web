import { useEffect, useCallback } from 'react';
import { useApi } from './useApi';
import { usePagination } from './usePagination';
import { useFilters } from './useFilters';
import { ScoringData, ScoreFilters, ApiResponse } from '@/lib/types';

const initialFilters: ScoreFilters = {
  applicationId: '',
  jobId: '',
  resumeId: '',
  candidateName: '',
  jobTitle: '',
  minScore: '',
  maxScore: '',
  recommendation: '',
  dateFrom: '',
  dateTo: '',
};

export function useScores() {
  const { data: scores = [], loading, error, executeRequest, setData } = useApi<ScoringData[]>({
    initialData: [],
  });
  
  const pagination = usePagination({ initialLimit: 10 });
  const filtersHook = useFilters({ initialFilters });

  const fetchScores = useCallback(async () => {
    const params = new URLSearchParams();
    params.append('page', pagination.pagination.page.toString());
    params.append('limit', pagination.pagination.limit.toString());
    
    if (filtersHook.filters.applicationId) {
      params.append('applicationId', filtersHook.filters.applicationId);
    }
    if (filtersHook.filters.jobId) {
      params.append('jobId', filtersHook.filters.jobId);
    }
    if (filtersHook.filters.resumeId) {
      params.append('resumeId', filtersHook.filters.resumeId);
    }

    const result = await executeRequest(async (): Promise<ApiResponse<ScoringData[]>> => {
      const response = await fetch(`/api/ai/scores?${params}`);
      return await response.json();
    });

    if (result) {
      // Apply client-side filtering for fields not supported by API
      let filteredScores = result;

      // Filter by candidate name
      if (filtersHook.filters.candidateName) {
        filteredScores = filteredScores.filter((score) =>
          score.candidate?.name
            ?.toLowerCase()
            .includes(filtersHook.filters.candidateName.toLowerCase())
        );
      }

      // Filter by job title
      if (filtersHook.filters.jobTitle) {
        filteredScores = filteredScores.filter((score) =>
          score.job?.title
            ?.toLowerCase()
            .includes(filtersHook.filters.jobTitle.toLowerCase())
        );
      }

      // Filter by score range
      if (filtersHook.filters.minScore) {
        const minScore = parseInt(filtersHook.filters.minScore);
        if (!isNaN(minScore)) {
          filteredScores = filteredScores.filter(
            (score) => (score.score || 0) >= minScore
          );
        }
      }

      if (filtersHook.filters.maxScore) {
        const maxScore = parseInt(filtersHook.filters.maxScore);
        if (!isNaN(maxScore)) {
          filteredScores = filteredScores.filter(
            (score) => (score.score || 0) <= maxScore
          );
        }
      }

      // Filter by recommendation
      if (filtersHook.filters.recommendation) {
        filteredScores = filteredScores.filter(
          (score) =>
            score.explanation?.recommendation === filtersHook.filters.recommendation
        );
      }

      // Filter by date range
      if (filtersHook.filters.dateFrom) {
        const fromDate = new Date(filtersHook.filters.dateFrom);
        if (!isNaN(fromDate.getTime())) {
          filteredScores = filteredScores.filter(
            (score) => new Date(score.scoredAt) >= fromDate
          );
        }
      }

      if (filtersHook.filters.dateTo) {
        const toDate = new Date(filtersHook.filters.dateTo);
        if (!isNaN(toDate.getTime())) {
          toDate.setHours(23, 59, 59, 999);
          filteredScores = filteredScores.filter(
            (score) => new Date(score.scoredAt) <= toDate
          );
        }
      }

      setData(filteredScores);
      pagination.updatePagination({
        total: filteredScores.length,
        totalPages: Math.ceil(filteredScores.length / pagination.pagination.limit),
      });
    }
  }, [
    pagination.pagination.page,
    pagination.pagination.limit,
    filtersHook.filters.applicationId,
    filtersHook.filters.jobId,
    filtersHook.filters.resumeId,
    filtersHook.filters.candidateName,
    filtersHook.filters.jobTitle,
    filtersHook.filters.minScore,
    filtersHook.filters.maxScore,
    filtersHook.filters.recommendation,
    filtersHook.filters.dateFrom,
    filtersHook.filters.dateTo,
    executeRequest,
    setData,
    pagination.updatePagination,
  ]);

  // Fetch scores when filters or pagination change
  useEffect(() => {
    fetchScores();
  }, [fetchScores]);

  const applyQuickFilter = useCallback((filter: Partial<ScoreFilters>) => {
    filtersHook.updateFilters(filter);
  }, [filtersHook]);

  return {
    scores,
    loading,
    error,
    pagination,
    filters: filtersHook,
    fetchScores,
    applyQuickFilter,
  };
}
