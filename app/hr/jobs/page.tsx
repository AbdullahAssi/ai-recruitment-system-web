"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-7xl mx-auto">
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
