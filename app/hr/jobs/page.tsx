"use client";

import { useState } from "react";
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
import { LoadingState } from "../../../components/reusables";
import { useJobs, useJobFilters } from "../../../hooks/hooks";
import { JobFormData, Job } from "../../../hooks/useJobs";

export default function HRJobsPage() {
  const {
    jobs,
    loading,
    creating,
    updating,
    fetchJobs,
    createJob,
    updateJob,
    toggleJobStatus,
  } = useJobs();

  const { filters, filteredJobs, updateFilter } = useJobFilters(jobs);

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
  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await createJob(formData);
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
      <div className="min-h-screen bg-gradient-to-br  from-gray-50 to-blue-100  flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 ">
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
          totalJobs={jobs.length}
          filteredCount={filteredJobs.length}
          onFilterChange={updateFilter}
        />

        {/* Jobs Grid */}
        {filteredJobs.length === 0 && !loading ? (
          <EmptyJobsState
            hasJobs={jobs.length > 0}
            onCreateNew={() => setShowCreateDialog(true)}
          />
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                updating={updating}
                onEdit={handleEditJob}
                onToggleStatus={toggleJobStatus}
              />
            ))}
          </div>
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
