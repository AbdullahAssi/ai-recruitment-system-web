"use client";

import { useState, useEffect } from "react";
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
import { useJobs } from "../../../hooks/hooks";
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

  // Filters state
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "all",
    location: "",
    sortBy: "date",
    sortOrder: "desc",
  });

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
  } = useJobs(companyId, paginationState, filters);

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
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPaginationState((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleCreateJob = async (e: React.FormEvent) => {
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
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      description: job.description,
      location: job.location,
      requirements: job.requirements || "",
      responsibilities: job.responsibilities || "",
    });
    setShowEditDialog(true);
  };

  const handleUpdateJob = async (e: React.FormEvent) => {
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
  };

  const handleCancelCreate = () => {
    setShowCreateDialog(false);
    setFormData({
      title: "",
      description: "",
      location: "",
      requirements: "",
      responsibilities: "",
    });
  };

  const handleCancelEdit = () => {
    setShowEditDialog(false);
    setEditingJob(null);
    setFormData({
      title: "",
      description: "",
      location: "",
      requirements: "",
      responsibilities: "",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen    flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
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
          onCreateNew={() => setShowCreateDialog(true)}
        />

        {/* Filters */}
        <JobFilters
          filters={filters}
          totalJobs={data?.pagination?.total || 0}
          filteredCount={jobs.length}
          onFilterChange={(key, value) =>
            handleFilterChange(key as keyof FilterState, value)
          }
        />

        {/* Jobs Grid */}
        {jobs.length === 0 && !loading ? (
          <EmptyJobsState
            hasJobs={(data?.pagination?.total || 0) > 0}
            onCreateNew={() => setShowCreateDialog(true)}
          />
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
                    onPageChange={(page) =>
                      setPaginationState((prev) => ({
                        ...prev,
                        currentPage: page,
                      }))
                    }
                    onLimitChange={(limit) =>
                      setPaginationState((prev) => ({
                        ...prev,
                        itemsPerPage: limit,
                        currentPage: 1,
                      }))
                    }
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
              onFormDataChange={(data) =>
                setFormData((prev) => ({ ...prev, ...data }))
              }
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
              onFormDataChange={(data) =>
                setFormData((prev) => ({ ...prev, ...data }))
              }
              onSubmit={handleUpdateJob}
              onCancel={handleCancelEdit}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
