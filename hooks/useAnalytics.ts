import { useEffect } from "react";
import { useApi } from "./useApi";

interface AnalyticsData {
  candidates: {
    total: number;
    thisMonth: number;
    withResumes: number;
    activeApplications: number;
  };
  jobs: {
    total: number;
    active: number;
    thisMonth: number;
    totalApplications: number;
  };
  applications: {
    total: number;
    pending: number;
    reviewed: number;
    shortlisted: number;
    rejected: number;
    thisWeek: number;
  };
  topPerformingJobs: Array<{
    id: string;
    title: string;
    location: string;
    applicationCount: number;
    averageScore: number;
  }>;
  recentActivity: Array<{
    type: "application" | "candidate" | "job";
    message: string;
    timestamp: string;
  }>;
  timeToHire: {
    average: number;
    median: number;
    trend: Array<{
      month: string;
      days: number;
    }>;
  };
  sourceTracking: Array<{
    source: string;
    count: number;
    percentage: number;
    conversionRate: number;
  }>;
  conversionFunnel: {
    applied: number;
    screened: number;
    interviewed: number;
    offered: number;
    hired: number;
  };
}

export function useAnalytics() {
  const {
    data: analytics,
    loading,
    error,
    executeRequest,
  } = useApi<AnalyticsData>();

  const fetchAnalytics = async () => {
    await executeRequest(async () => {
      const response = await fetch("/api/analytics");
      return await response.json();
    });
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics,
  };
}
