"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

// Import our modular components and utilities
import {
  JobInfoCard,
  StatsCards,
  FiltersCard,
  ApplicationCard,
  AIAnalysisDialog,
} from "../../../../../components/applications";
import {
  useJobApplications,
  useAIScores,
  useEmailTemplates,
  useBulkEmail,
} from "../../../../../hooks/hooks";
import { filterAndSortApplications } from "../../../../../lib/applicationUtil";
import {
  Application,
  FilterState,
  PaginationState,
  BulkEmailState,
  AIAnalysisDialogState,
} from "@/types/application.types";

export default function JobApplicationsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { toast } = useToast();

  // State management with proper types
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: "",
    statusFilter: "all",
    sortBy: "newest",
  });

  const [paginationState, setPaginationState] = useState<PaginationState>({
    currentPage: 1,
    itemsPerPage: 10,
  });

  const [bulkEmailState, setBulkEmailState] = useState<BulkEmailState>({
    selectedApplications: [],
    emailTemplates: [],
    selectedTemplate: "",
    customSubject: "",
    customBody: "",
    emailDialogOpen: false,
    sendingEmail: false,
  });

  const [aiDialogState, setAiDialogState] = useState<AIAnalysisDialogState>({
    profileDialogOpen: false,
    selectedApplication: null,
    aiScoresData: null,
    loadingScores: false,
  });

  // Custom hooks for data management
  const { data, loading, updateApplicationStatus } = useJobApplications(
    params.id,
    paginationState
  );

  const { aiScoresData, loadingScores, fetchAiScores, resetAiScores } =
    useAIScores();

  const { emailTemplates } = useEmailTemplates();

  // Memoized filtered and sorted applications for performance
  const filteredAndSortedApplications = useMemo(() => {
    if (!data?.applications) return [];
    return filterAndSortApplications(data.applications, filters);
  }, [data?.applications, filters]);

  const { sendBulkEmail, sendingEmail } = useBulkEmail(
    params.id,
    filteredAndSortedApplications,
    bulkEmailState.selectedApplications
  );

  // Event handlers
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      searchTerm: "",
      statusFilter: "all",
      sortBy: "newest",
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = filteredAndSortedApplications.map((app) => app.id);
      setBulkEmailState((prev) => ({
        ...prev,
        selectedApplications: allIds,
      }));
    } else {
      setBulkEmailState((prev) => ({
        ...prev,
        selectedApplications: [],
      }));
    }
  };

  const handleSelectApplication = (applicationId: string, checked: boolean) => {
    setBulkEmailState((prev) => ({
      ...prev,
      selectedApplications: checked
        ? [...prev.selectedApplications, applicationId]
        : prev.selectedApplications.filter((id) => id !== applicationId),
    }));
  };

  const handleOpenProfileDialog = (application: Application) => {
    setAiDialogState({
      profileDialogOpen: true,
      selectedApplication: application,
      aiScoresData: null,
      loadingScores: false,
    });
    resetAiScores();
  };

  const handleFetchAiScores = async () => {
    if (aiDialogState.selectedApplication) {
      await fetchAiScores(aiDialogState.selectedApplication.id);
    }
  };

  const handleSendBulkEmail = async () => {
    const success = await sendBulkEmail(
      bulkEmailState.selectedTemplate !== "custom"
        ? bulkEmailState.selectedTemplate
        : undefined,
      bulkEmailState.selectedTemplate === "custom"
        ? {
            subject: bulkEmailState.customSubject,
            body: bulkEmailState.customBody,
            name: "Custom Email",
          }
        : undefined
    );

    if (success) {
      setBulkEmailState((prev) => ({
        ...prev,
        emailDialogOpen: false,
        selectedApplications: [],
        selectedTemplate: "",
        customSubject: "",
        customBody: "",
      }));
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Job Not Found
          </h3>
          <p className="text-gray-600 mb-4">
            The requested job could not be found
          </p>
          <Link href="/hr/jobs">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* AI Analysis Dialog */}
        <AIAnalysisDialog
          open={aiDialogState.profileDialogOpen}
          onOpenChange={(open) =>
            setAiDialogState((prev) => ({ ...prev, profileDialogOpen: open }))
          }
          application={aiDialogState.selectedApplication}
          aiScoresData={aiScoresData}
          loadingScores={loadingScores}
          onFetchScores={handleFetchAiScores}
        />

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/hr/jobs">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              {data.job.title} - Applications
            </h1>
            <p className="text-gray-600 mt-1">
              Manage applications for this job posting
            </p>
          </div>
        </div>

        {/* Job Info Card */}
        <JobInfoCard
          job={data.job}
          totalApplications={data.totalApplications}
        />

        {/* Stats Cards */}
        <StatsCards stats={data.stats} />

        {/* Filters */}
        <FiltersCard
          filters={filters}
          onSearchChange={(value) => handleFilterChange("searchTerm", value)}
          onStatusFilterChange={(value) =>
            handleFilterChange("statusFilter", value)
          }
          onSortByChange={(value) => handleFilterChange("sortBy", value)}
          onClearFilters={handleClearFilters}
        />

        {/* Applications List */}
        <div className="space-y-4">
          {/* Results Summary */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">
                      Applications ({filteredAndSortedApplications.length} of{" "}
                      {data.totalApplications})
                    </h3>
                    <p className="text-sm text-blue-700">
                      {data.pagination
                        ? `Page ${data.pagination.page} of ${data.pagination.totalPages}`
                        : "All results shown"}
                      {filters.searchTerm &&
                        ` • Filtered by: "${filters.searchTerm}"`}
                      {filters.statusFilter !== "all" &&
                        ` • Status: ${filters.statusFilter}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {data.pagination && (
                    <Badge variant="outline" className="bg-white">
                      {data.pagination.limit} per page
                    </Badge>
                  )}
                  {loading && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Actions Toolbar */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold">
                Applications ({filteredAndSortedApplications.length})
              </h3>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={
                    bulkEmailState.selectedApplications.length ===
                      filteredAndSortedApplications.length &&
                    filteredAndSortedApplications.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all applications"
                />
                <Label htmlFor="select-all" className="text-sm text-gray-600">
                  Select All ({bulkEmailState.selectedApplications.length}{" "}
                  selected)
                </Label>
              </div>
            </div>

            {bulkEmailState.selectedApplications.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="px-3 py-1">
                  {bulkEmailState.selectedApplications.length} selected
                </Badge>
                <Dialog
                  open={bulkEmailState.emailDialogOpen}
                  onOpenChange={(open) =>
                    setBulkEmailState((prev) => ({
                      ...prev,
                      emailDialogOpen: open,
                    }))
                  }
                >
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                      aria-label="Send bulk email to selected candidates"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Bulk Email
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        Send Bulk Email to Selected Candidates
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Sending email to{" "}
                        {bulkEmailState.selectedApplications.length} selected
                        candidates
                      </p>
                      {/* Email template selection and form would go here */}
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() =>
                            setBulkEmailState((prev) => ({
                              ...prev,
                              emailDialogOpen: false,
                            }))
                          }
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSendBulkEmail}
                          disabled={sendingEmail}
                        >
                          {sendingEmail ? "Sending..." : "Send Emails"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>

          {/* Application Cards */}
          {filteredAndSortedApplications.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Applications Found
              </h3>
              <p className="text-gray-600">
                {filters.searchTerm || filters.statusFilter !== "all"
                  ? "No applications match your current filters"
                  : "No applications have been submitted for this job yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedApplications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  isSelected={bulkEmailState.selectedApplications.includes(
                    application.id
                  )}
                  onSelect={(checked) =>
                    handleSelectApplication(application.id, checked)
                  }
                  onStatusUpdate={(newStatus) =>
                    updateApplicationStatus(application.id, newStatus)
                  }
                  onViewProfile={() => handleOpenProfileDialog(application)}
                />
              ))}
            </div>
          )}

          {/* Pagination would go here if needed */}
        </div>
      </div>
    </div>
  );
}
