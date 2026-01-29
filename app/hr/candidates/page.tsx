"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Import modular components and hooks
import {
  CandidatesHeader,
  CandidateFiltersCard,
  CandidateCard,
  BulkActionsToolbar,
  EmptyCandidatesState,
} from "../../../components/candidates";
import {
  useCandidates,
  useCandidateFilters,
  useEmailTemplates,
} from "../../../hooks/hooks";

import type { CandidateFilters } from "../../../hooks/hooks";

// Import centralized download utility
import { createDownloadHandler } from "../../../lib/resumeDownload";

// Pagination component
const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
  onPrevious,
  onNext,
  startIndex,
  endIndex,
  totalItems,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  startIndex: number;
  endIndex: number;
  totalItems: number;
}) => {
  const getVisiblePages = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-8 px-4">
      <div className="text-sm text-gray-600">
        Showing {startIndex} to {endIndex} of {totalItems} candidates
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="flex gap-1">
          {getVisiblePages().map((page, index) => (
            <Button
              key={index}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => typeof page === "number" && onPageChange(page)}
              disabled={page === "..."}
              className="w-10"
            >
              {page}
            </Button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={currentPage === totalPages}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default function CandidatesPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [companyId, setCompanyId] = useState<string | undefined>();

  // Fetch HR profile to get company ID
  useEffect(() => {
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

  // Core data hooks
  const { candidates, loading, fetchCandidates } = useCandidates(companyId);
  const { filters, filteredCandidates, updateFilter, clearFilters } =
    useCandidateFilters(candidates);
  const { emailTemplates } = useEmailTemplates();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9); // 12 candidates per page (4x3 grid)

  // Bulk email state
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [customBody, setCustomBody] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  // Centralized download handler
  const downloadResume = useMemo(() => createDownloadHandler(toast), [toast]);

  // Memoized pagination calculations
  const paginationData = useMemo(() => {
    const totalItems = filteredCandidates.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentCandidates = filteredCandidates.slice(startIndex, endIndex);

    return {
      totalItems,
      totalPages,
      currentCandidates,
      startIndex: startIndex + 1,
      endIndex: Math.min(endIndex, totalItems),
    };
  }, [filteredCandidates, currentPage, itemsPerPage]);

  // Reset page when filters change
  const handleFilterChange = useCallback(
    (filterType: keyof CandidateFilters, value: string) => {
      updateFilter(filterType, value);
      setCurrentPage(1); // Reset to first page when filter changes
    },
    [updateFilter],
  );

  // Reset page when clearing filters
  const handleClearFilters = useCallback(() => {
    clearFilters();
    setCurrentPage(1);
  }, [clearFilters]);

  // Memoized event handlers
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        const allIds = paginationData.currentCandidates.map(
          (candidate) => candidate.id,
        );
        setSelectedCandidates(allIds);
      } else {
        setSelectedCandidates([]);
      }
    },
    [paginationData.currentCandidates],
  );

  const handleSelectCandidate = useCallback(
    (candidateId: string, checked: boolean) => {
      if (checked) {
        setSelectedCandidates((prev) => [...prev, candidateId]);
      } else {
        setSelectedCandidates((prev) =>
          prev.filter((id) => id !== candidateId),
        );
      }
    },
    [],
  );

  // Memoized bulk email handler
  const sendBulkEmail = useCallback(async () => {
    if (selectedCandidates.length === 0) {
      toast({
        title: "No Recipients Selected",
        description: "Please select at least one candidate to send emails to",
        variant: "destructive",
      });
      return;
    }

    if (
      !selectedTemplate ||
      (selectedTemplate === "custom" && (!customSubject || !customBody))
    ) {
      toast({
        title: "Email Content Missing",
        description:
          "Please select a template or provide custom subject and body",
        variant: "destructive",
      });
      return;
    }

    setSendingEmail(true);

    try {
      const emailData = {
        candidateIds: selectedCandidates,
        ...(selectedTemplate && selectedTemplate !== "custom"
          ? { templateId: selectedTemplate }
          : {
              customTemplate: {
                subject: customSubject,
                body: customBody,
                name: "Custom Email",
              },
            }),
      };

      const response = await fetch("/api/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      });

      const result = await response.json();

      if (result.success) {
        const sentCount =
          result.results?.successCount ||
          result.sent ||
          selectedCandidates.length;
        toast({
          title: "Emails Sent Successfully",
          description: `Sent ${sentCount} emails to selected candidates`,
        });
        setEmailDialogOpen(false);
        setSelectedCandidates([]);
        setSelectedTemplate("");
        setCustomSubject("");
        setCustomBody("");
      } else {
        throw new Error(result.error || "Failed to send emails");
      }
    } catch (error) {
      console.error("Error sending bulk emails:", error);
      toast({
        title: "Email Send Failed",
        description: "An error occurred while sending emails",
        variant: "destructive",
      });
    } finally {
      setSendingEmail(false);
    }
  }, [selectedCandidates, selectedTemplate, customSubject, customBody, toast]);

  // Pagination handlers
  const handlePreviousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, paginationData.totalPages));
  }, [paginationData.totalPages]);

  const handlePageClick = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading candidates...</p>
        </div>
      </div>
    );
  }

  const hasActiveFilters = !!(filters.searchTerm || filters.experienceFilter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <CandidatesHeader
          totalCandidates={candidates.length}
          loading={loading}
          onRefresh={fetchCandidates}
        />

        {/* Filters */}
        <CandidateFiltersCard
          filters={filters}
          totalCandidates={candidates.length}
          filteredCount={filteredCandidates.length}
          onSearchChange={(value) => handleFilterChange("searchTerm", value)}
          onExperienceFilterChange={(value) =>
            handleFilterChange("experienceFilter", value)
          }
          onClearFilters={handleClearFilters}
        />

        {/* Bulk Actions Toolbar */}
        <BulkActionsToolbar
          totalCandidates={paginationData.currentCandidates.length}
          selectedCount={selectedCandidates.length}
          onSelectAll={handleSelectAll}
          onOpenBulkEmail={() => setEmailDialogOpen(true)}
        />

        {/* Candidates Grid */}
        {paginationData.currentCandidates.length === 0 ? (
          <EmptyCandidatesState hasFilter={hasActiveFilters} />
        ) : (
          <>
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginationData.currentCandidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  isSelected={selectedCandidates.includes(candidate.id)}
                  onSelect={(checked) =>
                    handleSelectCandidate(candidate.id, checked)
                  }
                  onDownloadResume={downloadResume}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            <PaginationControls
              currentPage={currentPage}
              totalPages={paginationData.totalPages}
              onPageChange={handlePageClick}
              onPrevious={handlePreviousPage}
              onNext={handleNextPage}
              startIndex={paginationData.startIndex}
              endIndex={paginationData.endIndex}
              totalItems={paginationData.totalItems}
            />
          </>
        )}

        {/* Bulk Email Dialog */}
        {selectedCandidates.length > 0 && (
          <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
            <DialogTrigger asChild>
              <div className="hidden" />
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  Send Bulk Email to Selected Candidates
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Recipients</Label>
                  <p className="text-sm text-gray-600">
                    Sending to {selectedCandidates.length} selected candidates
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="template-select">Email Template</Label>
                    <Select
                      value={selectedTemplate}
                      onValueChange={setSelectedTemplate}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a template or create custom" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="custom">Custom Email</SelectItem>
                        {emailTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedTemplate === "custom" && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="custom-subject">Email Subject</Label>
                        <Input
                          id="custom-subject"
                          value={customSubject}
                          onChange={(e) => setCustomSubject(e.target.value)}
                          placeholder="Enter email subject..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="custom-body">Email Body</Label>
                        <Textarea
                          id="custom-body"
                          value={customBody}
                          onChange={(e) => setCustomBody(e.target.value)}
                          placeholder="Enter email content... You can use variables like {{candidateName}}, {{jobTitle}}, etc."
                          rows={8}
                        />
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">
                      Available Variables:
                    </h4>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>
                        <code>{"{{candidateName}}"}</code> - Candidate's name
                      </p>
                      <p>
                        <code>{"{{candidateEmail}}"}</code> - Candidate's email
                      </p>
                      <p>
                        <code>{"{{companyName}}"}</code> - Your company name
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setEmailDialogOpen(false)}
                      disabled={sendingEmail}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={sendBulkEmail}
                      disabled={
                        sendingEmail ||
                        !selectedTemplate ||
                        (selectedTemplate === "custom" &&
                          (!customSubject || !customBody))
                      }
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {sendingEmail ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Email
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
