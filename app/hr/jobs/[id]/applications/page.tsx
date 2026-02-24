"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, Send, SlidersHorizontal } from "lucide-react";
import { FaUsers } from "react-icons/fa";
import { LoadingState } from "@/components/reusables";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ServerPagination } from "@/components/reusables";

// Import our modular components and utilities
import {
  JobInfoCard,
  StatsCards,
  FiltersCard,
  ApplicationCard,
  AIAnalysisDialog,
} from "../../../../../components/applications";
import { DetailedAnalysisDialog } from "../../../../../components/scores";
import {
  useJobApplications,
  useAIScores,
  useEmailTemplates,
  useBulkEmail,
  useScores,
  useDebounce,
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
  // Local filter state – reflects the UI immediately
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: "",
    statusFilter: "all",
    sortBy: "newest",
  });

  // Debounce only the free-text search so typing does not trigger API calls
  // on every keystroke. Select/dropdown changes still take effect immediately.
  const debouncedSearchTerm = useDebounce(filters.searchTerm, 400);

  // Stable API filter object – avoid new object reference on every render
  const apiFilters = useMemo<FilterState>(
    () => ({
      ...filters,
      searchTerm: debouncedSearchTerm,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [debouncedSearchTerm, filters.statusFilter, filters.sortBy],
  );

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

  const [detailedAnalysisState, setDetailedAnalysisState] = useState({
    open: false,
    selectedApplication: null as Application | null,
    loadingScores: false,
    selectedScore: null as any,
  });

  // Custom hooks for data management
  const { data, loading, updateApplicationStatus } = useJobApplications(
    params.id,
    paginationState,
    apiFilters,
  );

  const { aiScoresData, loadingScores, fetchAiScores, resetAiScores } =
    useAIScores();

  const { emailTemplates } = useEmailTemplates();

  // Use the provided useScores hook for detailed analysis
  const { scores, fetchScores, applyQuickFilter } = useScores();

  // Update bulk email state when templates are loaded
  useEffect(() => {
    if (emailTemplates.length > 0) {
      setBulkEmailState((prev) => ({
        ...prev,
        emailTemplates: emailTemplates,
      }));
    }
  }, [emailTemplates]);

  useEffect(() => {
    // Early return if dialog is not open or no selected application
    if (
      !detailedAnalysisState.open ||
      !detailedAnalysisState.selectedApplication
    ) {
      return;
    }

    console.log("useEffect: scores changed", {
      scoresLength: scores.length,
      selectedApplication: detailedAnalysisState.selectedApplication?.id,
      loadingScores: detailedAnalysisState.loadingScores,
      open: detailedAnalysisState.open,
    });

    // Only process if we have scores available, still loading, and no score selected yet
    if (
      scores.length > 0 &&
      detailedAnalysisState.loadingScores &&
      !detailedAnalysisState.selectedScore
    ) {
      const scoreData = scores.find(
        (score) =>
          score.application?.id ===
          detailedAnalysisState.selectedApplication?.id,
      );

      console.log("Found score data in useEffect:", scoreData);

      if (scoreData) {
        setDetailedAnalysisState((prev) => ({
          ...prev,
          selectedScore: scoreData,
          loadingScores: false,
        }));
      } else {
        // No matching score found, stop loading after a timeout
        setTimeout(() => {
          // Double-check state before updating
          setDetailedAnalysisState((prev) => {
            if (prev.open && prev.loadingScores && !prev.selectedScore) {
              return {
                ...prev,
                loadingScores: false,
              };
            }
            return prev;
          });
        }, 3000);
      }
    }
  }, [
    scores,
    detailedAnalysisState.open,
    detailedAnalysisState.selectedApplication,
    detailedAnalysisState.loadingScores,
    detailedAnalysisState.selectedScore,
  ]);

  // Server-side filtering - use applications directly from data
  const applications = data?.applications || [];

  const { sendBulkEmail, sendingEmail } = useBulkEmail(
    params.id,
    applications,
    bulkEmailState.selectedApplications,
  );

  // Event handlers
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    // searchTerm is debounced – page resets when the debounced value fires.
    // Status and sort dropdowns reset the page immediately.
    if (key !== "searchTerm") {
      setPaginationState((prev) => ({ ...prev, currentPage: 1 }));
    }
  };

  // Reset to page 1 when the debounced search term fires so we avoid a
  // double-fetch (one for the page reset, one for the actual new term).
  useEffect(() => {
    setPaginationState((prev) => ({ ...prev, currentPage: 1 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm]);

  const handleClearFilters = () => {
    setFilters({
      searchTerm: "",
      statusFilter: "all",
      sortBy: "newest",
    });
    // Reset to page 1 when clearing filters
    setPaginationState((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = applications.map((app) => app.id);
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

  const handleOpenDetailedAnalysis = async (application: Application) => {
    console.log("=== handleOpenDetailedAnalysis called ===");
    console.log("Application:", application.id, application.candidate.name);

    setDetailedAnalysisState({
      open: true,
      selectedApplication: application,
      loadingScores: true,
      selectedScore: null,
    });

    console.log("State set - opening dialog with loading state");

    try {
      console.log(
        "Applying quick filter for application:",
        application.id,
        "job:",
        params.id,
      );

      // Apply filter and wait for fetch to complete, getting data directly
      const fetchedScores = await applyQuickFilter({
        applicationId: application.id,
        jobId: params.id,
      });

      console.log("Quick filter applied and scores fetched:", fetchedScores);

      // Find the score data for this specific application from the fetched data
      const scoreData = fetchedScores.find(
        (score) => score.application?.id === application.id,
      );

      console.log("Found score data:", scoreData);

      // Update state with the found score data - only open dialog if we have data
      if (scoreData) {
        console.log("Setting selectedScore and stopping loading");
        setDetailedAnalysisState((prev) => ({
          ...prev,
          selectedScore: scoreData,
          loadingScores: false,
        }));
      } else {
        console.log(
          "No API score data found, checking for fallback aiAnalysis",
        );
        // No score data found - check if we have fallback data
        if (application.aiAnalysis) {
          console.log("Found aiAnalysis fallback data, using that instead");
          setDetailedAnalysisState((prev) => ({
            ...prev,
            selectedScore: null, // Will use fallback aiAnalysis data
            loadingScores: false,
          }));
        } else {
          console.log("No aiAnalysis data available either");
          // No data available at all
          setDetailedAnalysisState((prev) => ({
            ...prev,
            loadingScores: false,
          }));
          toast({
            title: "No Analysis Available",
            description:
              "No AI analysis data is available for this application",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching detailed analysis:", error);
      setDetailedAnalysisState((prev) => ({
        ...prev,
        loadingScores: false,
      }));
      toast({
        title: "Error",
        description: "Failed to load detailed AI analysis",
        variant: "destructive",
      });
    }
  };

  const handleSendBulkEmail = async () => {
    // Validation
    if (!bulkEmailState.selectedTemplate) {
      toast({
        title: "Email Content Missing",
        description: "Please select a template or provide custom content",
        variant: "destructive",
      });
      return;
    }

    if (bulkEmailState.selectedTemplate === "custom") {
      if (
        !bulkEmailState.customSubject.trim() ||
        !bulkEmailState.customBody.trim()
      ) {
        toast({
          title: "Custom Email Incomplete",
          description: "Please provide both subject and body for custom email",
          variant: "destructive",
        });
        return;
      }
    }

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
        : undefined,
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
    return <LoadingState variant="page" message="Loading applications..." />;
  }

  // Error state
  if (!data) {
    return (
      <div className="flex items-center justify-center py-24">
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
    <div>
      <div className="max-w-7xl mx-auto space-y-6">
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm flex-shrink-0">
              <FaUsers className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground leading-tight">
                {data.job.title}
              </h1>
              <p className="text-sm text-muted-foreground">Applications</p>
            </div>
          </div>
          <Link href="/hr/jobs">
            <Button variant="outline" size="sm" className="border-border text-muted-foreground hover:bg-muted">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
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
          <div className="rounded-xl border border-border bg-brand-50 dark:bg-brand-100/10 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-brand" />
              <span className="text-sm font-semibold text-foreground">
                {data.filteredCount || 0} of {data.totalApplications} applications
              </span>
              {(filters.searchTerm || filters.statusFilter !== "all") && (
                <span className="text-xs text-muted-foreground">
                  {filters.searchTerm && `• "${filters.searchTerm}"`}{" "}
                  {filters.statusFilter !== "all" && `• ${filters.statusFilter}`}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {data.pagination && (
                <span className="text-xs text-muted-foreground bg-card border border-border px-2 py-0.5 rounded-full">
                  Page {data.pagination.page}/{data.pagination.totalPages}
                </span>
              )}
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              )}
            </div>
          </div>

          {/* Bulk Actions Toolbar */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h3 className="text-sm font-semibold text-foreground">
                Applications
                <span className="ml-1.5 bg-brand-50 text-brand text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {applications.length}
                </span>
              </h3>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={
                    bulkEmailState.selectedApplications.length ===
                      applications.length && applications.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all applications"
                />
                <Label htmlFor="select-all" className="text-sm text-muted-foreground">
                  Select All ({bulkEmailState.selectedApplications.length}{" "}
                  selected)
                </Label>
              </div>
            </div>

            {bulkEmailState.selectedApplications.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium bg-brand-50 text-brand px-3 py-1 rounded-full border border-brand-200">
                  {bulkEmailState.selectedApplications.length} selected
                </span>
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
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
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

                      {/* Template Selection */}
                      <div className="space-y-2">
                        <Label htmlFor="template-select">Email Template</Label>
                        <Select
                          value={bulkEmailState.selectedTemplate}
                          onValueChange={(value) =>
                            setBulkEmailState((prev) => ({
                              ...prev,
                              selectedTemplate: value,
                              // Reset custom fields when selecting a template
                              customSubject:
                                value !== "custom" ? "" : prev.customSubject,
                              customBody:
                                value !== "custom" ? "" : prev.customBody,
                            }))
                          }
                        >
                          <SelectTrigger id="template-select">
                            <SelectValue placeholder="Select an email template" />
                          </SelectTrigger>
                          <SelectContent>
                            {bulkEmailState.emailTemplates.map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.name}
                              </SelectItem>
                            ))}
                            <SelectItem value="custom">
                              Custom Template
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Custom Template Fields */}
                      {bulkEmailState.selectedTemplate === "custom" && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="custom-subject">Subject</Label>
                            <Input
                              id="custom-subject"
                              value={bulkEmailState.customSubject}
                              onChange={(e) =>
                                setBulkEmailState((prev) => ({
                                  ...prev,
                                  customSubject: e.target.value,
                                }))
                              }
                              placeholder="Enter email subject"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="custom-body">Email Body</Label>
                            <Textarea
                              id="custom-body"
                              value={bulkEmailState.customBody}
                              onChange={(e) =>
                                setBulkEmailState((prev) => ({
                                  ...prev,
                                  customBody: e.target.value,
                                }))
                              }
                              placeholder="Enter email content"
                              rows={6}
                            />
                          </div>
                        </>
                      )}

                      {/* Template Preview */}
                      {bulkEmailState.selectedTemplate &&
                        bulkEmailState.selectedTemplate !== "custom" && (
                          <div className="bg-gray-50 p-3 rounded-lg border">
                            <Label className="text-sm font-medium">
                              Template Preview:
                            </Label>
                            {(() => {
                              const template =
                                bulkEmailState.emailTemplates.find(
                                  (t) =>
                                    t.id === bulkEmailState.selectedTemplate,
                                );
                              return template ? (
                                <div className="mt-2 text-sm">
                                  <p>
                                    <strong>Subject:</strong> {template.subject}
                                  </p>
                                  <p className="mt-1 text-gray-600">
                                    <strong>Body:</strong>{" "}
                                    {template.body
                                      .replace(/<[^>]*>/g, "")
                                      .substring(0, 100)}
                                    ...
                                  </p>
                                </div>
                              ) : null;
                            })()}
                          </div>
                        )}

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
                          disabled={
                            sendingEmail ||
                            !bulkEmailState.selectedTemplate ||
                            (bulkEmailState.selectedTemplate === "custom" &&
                              (!bulkEmailState.customSubject.trim() ||
                                !bulkEmailState.customBody.trim()))
                          }
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
          {applications.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card text-center py-16 px-6">
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center">
                  <Users className="w-6 h-6 text-brand" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-foreground">No Applications Found</h3>
                  <p className="text-sm text-muted-foreground">
                    {filters.searchTerm || filters.statusFilter !== "all"
                      ? "No applications match your current filters"
                      : "No applications have been submitted for this job yet"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {applications.map((application) => (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    isSelected={bulkEmailState.selectedApplications.includes(
                      application.id,
                    )}
                    onSelect={(checked) =>
                      handleSelectApplication(application.id, checked)
                    }
                    onStatusUpdate={(newStatus) =>
                      updateApplicationStatus(application.id, newStatus)
                    }
                    onViewAIAnalysis={() =>
                      handleOpenDetailedAnalysis(application)
                    }
                  />
                ))}
              </div>

              {/* Server-Side Pagination */}
              {data.pagination && (
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
              )}
            </>
          )}
        </div>

        {/* Detailed Analysis Dialog */}
        {detailedAnalysisState.open && (
          <>
            {detailedAnalysisState.loadingScores ? (
              <Dialog
                open={detailedAnalysisState.open}
                onOpenChange={(open) => {
                  console.log("Loading dialog onOpenChange:", open);
                  if (!open) {
                    // Dialog is closing - clear all state
                    setDetailedAnalysisState((prev) => ({
                      ...prev,
                      open: false,
                      selectedScore: null,
                      selectedApplication: null,
                      loadingScores: false,
                    }));
                  } else {
                    // Dialog is opening - just update open state
                    setDetailedAnalysisState((prev) => ({
                      ...prev,
                      open: true,
                    }));
                  }
                }}
              >
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Loading AI Analysis</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                    <p className="text-gray-600">
                      Fetching detailed AI analysis...
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            ) : detailedAnalysisState.selectedScore ||
              detailedAnalysisState.selectedApplication?.aiAnalysis ? (
              <DetailedAnalysisDialog
                scoreData={
                  detailedAnalysisState.selectedScore
                    ? {
                        // Use fetched score data but ensure candidate is populated
                        ...detailedAnalysisState.selectedScore,
                        candidate: detailedAnalysisState.selectedScore
                          .candidate || {
                          name:
                            detailedAnalysisState.selectedApplication?.candidate
                              .name || "",
                          filename:
                            detailedAnalysisState.selectedApplication?.candidate
                              .resumes[0]?.fileName || "",
                          email:
                            detailedAnalysisState.selectedApplication?.candidate
                              .email || "",
                          phone: "",
                          skills:
                            detailedAnalysisState.selectedScore.skillsMatch
                              ?.matchedSkills ||
                            detailedAnalysisState.selectedApplication
                              ?.aiAnalysis?.skillsMatch.matchedSkills ||
                            [],
                          experience: [],
                        },
                        application: detailedAnalysisState.selectedScore
                          .application || {
                          id:
                            detailedAnalysisState.selectedApplication?.id || "",
                          appliedAt:
                            detailedAnalysisState.selectedApplication
                              ?.appliedAt || new Date().toISOString(),
                        },
                        job: detailedAnalysisState.selectedScore.job || {
                          title: data?.job?.title || "Job Title",
                          description: data?.job?.description || "",
                          requirements: data?.job?.requirements || "",
                          location: data?.job?.location || "",
                          company: "Company",
                        },
                      }
                    : {
                        // Fallback: Create scoreData from existing application aiAnalysis
                        id: detailedAnalysisState.selectedApplication!.id,
                        score:
                          detailedAnalysisState.selectedApplication!.aiAnalysis!
                            .overallScore,
                        scoredAt:
                          detailedAnalysisState.selectedApplication!.appliedAt,
                        explanation: {
                          summary: "",
                          recommendation:
                            detailedAnalysisState.selectedApplication!
                              .aiAnalysis!.recommendation,
                          strengths:
                            detailedAnalysisState.selectedApplication!
                              .aiAnalysis!.strengths,
                          weaknesses:
                            detailedAnalysisState.selectedApplication!
                              .aiAnalysis!.weaknesses,
                          keySkillsMatch:
                            detailedAnalysisState.selectedApplication!
                              .aiAnalysis!.keyMatches,
                          missingSkills:
                            detailedAnalysisState.selectedApplication!
                              .aiAnalysis!.skillsMatch.missingSkills,
                          skills:
                            detailedAnalysisState.selectedApplication!
                              .aiAnalysis!.scores.skills,
                          experience:
                            detailedAnalysisState.selectedApplication!
                              .aiAnalysis!.scores.experience,
                          education:
                            detailedAnalysisState.selectedApplication!
                              .aiAnalysis!.scores.education,
                          fit: detailedAnalysisState.selectedApplication!
                            .aiAnalysis!.scores.fit,
                        },
                        skillsMatch:
                          detailedAnalysisState.selectedApplication!.aiAnalysis!
                            .skillsMatch,
                        requirements: {},
                        candidate: {
                          name: detailedAnalysisState.selectedApplication!
                            .candidate.name,
                          filename:
                            detailedAnalysisState.selectedApplication!.candidate
                              .resumes[0]?.fileName || "",
                          email:
                            detailedAnalysisState.selectedApplication!.candidate
                              .email,
                          phone: "",
                          skills:
                            detailedAnalysisState.selectedApplication!
                              .aiAnalysis!.skillsMatch.matchedSkills || [],
                          experience: [],
                        },
                        job: {
                          title: data?.job?.title || "Job Title",
                          description: data?.job?.description || "",
                          requirements: data?.job?.requirements || "",
                          location: data?.job?.location || "",
                          company: "Company", // Static value as not available in job data
                        },
                        application: {
                          id: detailedAnalysisState.selectedApplication!.id,
                          appliedAt:
                            detailedAnalysisState.selectedApplication!
                              .appliedAt,
                        },
                      }
                }
                open={detailedAnalysisState.open}
                onOpenChange={(open) => {
                  console.log("DetailedAnalysisDialog onOpenChange:", open);
                  if (!open) {
                    // Dialog is closing - clear all state
                    setDetailedAnalysisState((prev) => ({
                      ...prev,
                      open: false,
                      selectedScore: null,
                      selectedApplication: null,
                      loadingScores: false,
                    }));
                  } else {
                    // Dialog is opening - just update open state
                    setDetailedAnalysisState((prev) => ({
                      ...prev,
                      open: true,
                    }));
                  }
                }}
              />
            ) : (
              <Dialog
                open={detailedAnalysisState.open}
                onOpenChange={(open) => {
                  console.log("No Analysis dialog onOpenChange:", open);
                  if (!open) {
                    // Dialog is closing - clear all state
                    setDetailedAnalysisState((prev) => ({
                      ...prev,
                      open: false,
                      selectedScore: null,
                      selectedApplication: null,
                      loadingScores: false,
                    }));
                  } else {
                    // Dialog is opening - just update open state
                    setDetailedAnalysisState((prev) => ({
                      ...prev,
                      open: true,
                    }));
                  }
                }}
              >
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>No AI Analysis Available</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col items-center justify-center py-8">
                    <p className="text-gray-600 text-center">
                      No detailed AI analysis is available for this application
                      yet.
                      <br />
                      <br />
                      The analysis may not have been generated or may be
                      processing.
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </>
        )}
      </div>
    </div>
  );
}
