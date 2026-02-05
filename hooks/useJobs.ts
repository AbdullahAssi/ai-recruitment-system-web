import { useState, useEffect, useCallback } from "react";
import { useToast } from "./use-toast";

export interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  requirements: string;
  responsibilities: string;
  isActive: boolean;
  postedDate: string;
  applications: Array<{
    id: string;
    score: number;
    status: string;
    candidate: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

export interface FilterState {
  search: string;
  status: "all" | "active" | "inactive";
  location: string;
  sortBy: "date" | "title" | "applications";
  sortOrder: "asc" | "desc";
}

export interface JobFormData {
  title: string;
  description: string;
  location: string;
  requirements: string;
  responsibilities: string;
}

export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
}

export interface JobsData {
  jobs: Job[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useJobs(
  companyId?: string,
  paginationState?: PaginationState,
  filters?: FilterState,
) {
  const [data, setData] = useState<JobsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ includeInactive: "true" });

      if (companyId) {
        params.append("companyId", companyId);
      }

      // Add pagination params
      if (paginationState) {
        params.append("page", paginationState.currentPage.toString());
        params.append("limit", paginationState.itemsPerPage.toString());
      }

      // Add filter params
      if (filters) {
        if (filters.search) params.append("search", filters.search);
        if (filters.location) params.append("location", filters.location);
        if (filters.status) params.append("status", filters.status);
        if (filters.sortBy) params.append("sortBy", filters.sortBy);
        if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);
      }

      const response = await fetch(`/api/jobs?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setData({
          jobs: result.jobs,
          pagination: result.pagination || {
            page: 1,
            limit: result.jobs.length,
            total: result.jobs.length,
            totalPages: 1,
          },
        });
      } else {
        toast({
          title: "Failed to Load Jobs",
          description: result.error || "Could not fetch job listings",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast({
        title: "Failed to Load Jobs",
        description: "An error occurred while loading job listings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [
    toast,
    companyId,
    paginationState?.currentPage,
    paginationState?.itemsPerPage,
    filters,
  ]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const createJob = useCallback(
    async (formData: JobFormData, userId?: string) => {
      // Validation
      if (
        !formData.title.trim() ||
        !formData.description.trim() ||
        !formData.location.trim()
      ) {
        toast({
          title: "Missing Information",
          description:
            "Please fill in all required fields (Title, Description, Location)",
          variant: "destructive",
        });
        return false;
      }

      setCreating(true);

      try {
        const response = await fetch("/api/jobs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            userId,
          }),
        });

        const data = await response.json();
        if (data.success) {
          fetchJobs(); // Refresh the jobs list
          toast({
            title: "Job Created Successfully",
            description: "The job posting has been created and is now live",
          });
          return true;
        } else {
          toast({
            title: "Job Creation Failed",
            description: data.error || "Failed to create job",
            variant: "destructive",
          });
          return false;
        }
      } catch (error) {
        console.error("Error creating job:", error);
        toast({
          title: "Job Creation Failed",
          description: "An unexpected error occurred while creating the job",
          variant: "destructive",
        });
        return false;
      } finally {
        setCreating(false);
      }
    },
    [toast, fetchJobs],
  );

  const updateJob = useCallback(
    async (jobId: string, formData: JobFormData) => {
      // Validation
      if (
        !formData.title.trim() ||
        !formData.description.trim() ||
        !formData.location.trim()
      ) {
        toast({
          title: "Missing Information",
          description:
            "Please fill in all required fields (Title, Description, Location)",
          variant: "destructive",
        });
        return false;
      }

      setCreating(true);

      try {
        const response = await fetch(`/api/jobs/${jobId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        const data = await response.json();
        if (data.success) {
          fetchJobs(); // Refresh the jobs list
          toast({
            title: "Job Updated Successfully",
            description: "The job posting has been updated",
          });
          return true;
        } else {
          toast({
            title: "Job Update Failed",
            description: data.error || "Failed to update job",
            variant: "destructive",
          });
          return false;
        }
      } catch (error) {
        console.error("Error updating job:", error);
        toast({
          title: "Job Update Failed",
          description: "An unexpected error occurred while updating the job",
          variant: "destructive",
        });
        return false;
      } finally {
        setCreating(false);
      }
    },
    [toast, fetchJobs],
  );

  const toggleJobStatus = useCallback(
    async (jobId: string, currentStatus: boolean) => {
      setUpdating(jobId);
      try {
        const response = await fetch(`/api/jobs/${jobId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isActive: !currentStatus,
          }),
        });

        const data = await response.json();
        if (data.success) {
          fetchJobs(); // Refresh the jobs list
          toast({
            title: "Job Status Updated",
            description: `Job ${!currentStatus ? "activated" : "deactivated"} successfully`,
          });
          return true;
        } else {
          toast({
            title: "Update Failed",
            description: data.error || "Failed to update job status",
            variant: "destructive",
          });
          return false;
        }
      } catch (error) {
        console.error("Error updating job status:", error);
        toast({
          title: "Update Failed",
          description: "An unexpected error occurred while updating job status",
          variant: "destructive",
        });
        return false;
      } finally {
        setUpdating(null);
      }
    },
    [toast, fetchJobs],
  );

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return {
    data,
    jobs: data?.jobs || [],
    loading,
    creating,
    updating,
    fetchJobs,
    createJob,
    updateJob,
    toggleJobStatus,
  };
}
