"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

// Import modular components and hooks
import {
  JobCard,
  JobFilters,
  JobForm,
  JobsHeader,
  EmptyJobsState,
} from "../../../components/hr";
import { LoadingState, ServerPagination } from "../../../components/reusables";
import { useJobs, useDebounce } from "../../../hooks/hooks";
import {
  JobFormData,
  Job,
  FilterState,
  PaginationState,
} from "../../../hooks/useJobs";

export default function HRJobsPage() {
  const { user } = useAuth();
  const [companyId, setCompanyId] = useState<string | undefined>();

  // Pagination state
  const [paginationState, setPaginationState] = useState<PaginationState>({
    currentPage: 1,
    itemsPerPage: 10,
  });

  // Filters state – mirrors the UI immediately
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "all",
    location: "",
    sortBy: "date",
    sortOrder: "desc",
  });

  // Debounced text-input values so the API is only called 400 ms after the
  // user stops typing – select/dropdown changes still fire immediately.
  const debouncedSearch = useDebounce(filters.search, 400);
  const debouncedLocation = useDebounce(filters.location, 400);

  // Compose the filter object that is actually sent to the API.
  // Using useMemo to keep a stable object reference between renders so that
  // the hook's dependency array only fires when the values truly change.
  const apiFilters = useMemo<FilterState>(
    () => ({
      ...filters,
      search: debouncedSearch,
      location: debouncedLocation,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      debouncedSearch,
      debouncedLocation,
      filters.status,
      filters.sortBy,
      filters.sortOrder,
    ],
  );

  useEffect(() => {
    // Fetch HR profile to get company ID
    const fetchCompanyId = async () => {
      if (user?.id) {
        const response = await fetch(`/api/hr/profile/${user.id}`);
        const data = await response.json();
        if (data.success && data.profile?.companyId) {
          setCompanyId(data.profile.companyId);
        }
      }
    };
    fetchCompanyId();
  }, [user]);

  const {
    data,
    jobs,
    loading,
    creating,
    updating,
    fetchJobs,
    createJob,
    updateJob,
    toggleJobStatus,
  } = useJobs(companyId, paginationState, apiFilters);

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  // Form state
  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    description: "",
    location: "",
    requirements: "",
    responsibilities: "",
  });

  // Event handlers
  const handleFilterChange = useCallback(
    (key: keyof FilterState, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      // Text inputs (search, location) are debounced – page resets when the
      // debounced value fires (see useEffect below). Dropdowns reset immediately.
      if (key !== "search" && key !== "location") {
        setPaginationState((prev) => ({ ...prev, currentPage: 1 }));
      }
    },
    [],
  );

  // Reset to page 1 when the debounced text filters actually fire so we don't
  // double-fetch (once for the page reset and once for the new search term).
  useEffect(() => {
    setPaginationState((prev) => ({ ...prev, currentPage: 1 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, debouncedLocation]);

  const handleCreateJob = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const success = await createJob(formData, user?.id);
      if (success) {
        setShowCreateDialog(false);
        setFormData({
          title: "",
          description: "",
          location: "",
          requirements: "",
          responsibilities: "",
        });
      }
    },
    [createJob, formData, user?.id],
  );

  const handleEditJob = useCallback((job: Job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      description: job.description,
      location: job.location,
      requirements: job.requirements || "",
      responsibilities: job.responsibilities || "",
    });
    setShowEditDialog(true);
  }, []);

  const handleUpdateJob = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingJob) return;
      const success = await updateJob(editingJob.id, formData);
      if (success) {
        setShowEditDialog(false);
        setEditingJob(null);
        setFormData({
          title: "",
          description: "",
          location: "",
          requirements: "",
          responsibilities: "",
        });
      }
    },
    [updateJob, editingJob, formData],
  );

  const handleCancelCreate = useCallback(() => {
    setShowCreateDialog(false);
    setFormData({
      title: "",
      description: "",
      location: "",
      requirements: "",
      responsibilities: "",
    });
  }, []);

  const handleCancelEdit = useCallback(() => {
    setShowEditDialog(false);
    setEditingJob(null);
    setFormData({
      title: "",
      description: "",
      location: "",
      requirements: "",
      responsibilities: "",
    });
  }, []);

  // Stable pagination callbacks so ServerPagination doesn't re-render
  // unnecessarily if it is wrapped in React.memo.
  const handlePageChange = useCallback(
    (page: number) =>
      setPaginationState((prev) => ({ ...prev, currentPage: page })),
    [],
  );
  const handleLimitChange = useCallback(
    (limit: number) =>
      setPaginationState((prev) => ({
        ...prev,
        itemsPerPage: limit,
        currentPage: 1,
      })),
    [],
  );
  const handleOpenCreate = useCallback(() => setShowCreateDialog(true), []);
  const handleFormDataChange = useCallback(
    (data: Partial<JobFormData>) =>
      setFormData((prev) => ({ ...prev, ...data })),
    [],
  );
  const handleJobFilterChange = useCallback(
    (key: string, value: string) =>
      handleFilterChange(key as keyof FilterState, value),
    [handleFilterChange],
  );

  // Derived display values
  const totalJobs = useMemo(
    () => data?.pagination?.total || 0,
    [data?.pagination?.total],
  );
  const hasJobs = useMemo(() => totalJobs > 0, [totalJobs]);

  if (loading) {
    return (
      <div className="min-h-screen    flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  ">
      <div className="max-w-7xl mx-auto py-8">
        {/* Header */}
        <JobsHeader
          loading={loading}
          onRefresh={fetchJobs}
          onCreateNew={handleOpenCreate}
        />

        {/* Filters */}
        <JobFilters
          filters={filters}
          totalJobs={totalJobs}
          filteredCount={jobs.length}
          onFilterChange={handleJobFilterChange}
        />

        {/* Jobs Grid */}
        {jobs.length === 0 && !loading ? (
          <EmptyJobsState hasJobs={hasJobs} onCreateNew={handleOpenCreate} />
        ) : (
          <>
            <div className="grid lg:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  updating={updating}
                  onEdit={handleEditJob}
                  onToggleStatus={toggleJobStatus}
                />
              ))}
            </div>

            {/* Server-Side Pagination */}
            {data?.pagination && data.pagination.totalPages > 1 && (
              <Card className="mt-6">
                <CardContent className="p-4">
                  <ServerPagination
                    pagination={data.pagination}
                    onPageChange={handlePageChange}
                    onLimitChange={handleLimitChange}
                    loading={loading}
                    showFirstLast={true}
                  />
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Create Job Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <div className="hidden" />
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Job Posting</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new job posting.
              </DialogDescription>
            </DialogHeader>
            <JobForm
              formData={formData}
              loading={creating}
              onFormDataChange={handleFormDataChange}
              onSubmit={handleCreateJob}
              onCancel={handleCancelCreate}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Job Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Job Posting</DialogTitle>
              <DialogDescription>
                Edit the details of the job posting.
              </DialogDescription>
            </DialogHeader>
            <JobForm
              formData={formData}
              isEditing={true}
              loading={creating}
              onFormDataChange={handleFormDataChange}
              onSubmit={handleUpdateJob}
              onCancel={handleCancelEdit}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
