"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
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
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ServerPagination } from "../../../components/reusables";

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
  CandidateFilters,
} from "../../../hooks/hooks";

// Import centralized download utility
import { createDownloadHandler } from "../../../lib/resumeDownload";

export default function CandidatesPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [companyId, setCompanyId] = useState<string | undefined>();

  // Pagination state
  const [paginationState, setPaginationState] = useState({
    currentPage: 1,
    itemsPerPage: 12,
  });

  // Filters state
  const [filters, setFilters] = useState<CandidateFilters>({
    searchTerm: "",
    experienceFilter: "",
  });

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
  const { data, candidates, loading, fetchCandidates } = useCandidates(
    companyId,
    paginationState,
    filters,
  );
  const { emailTemplates } = useEmailTemplates();

  // Bulk email state
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [customBody, setCustomBody] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  // Centralized download handler
  const downloadResume = useMemo(() => createDownloadHandler(toast), [toast]);

  const clearFilters = () => {
    setFilters({
      searchTerm: "",
      experienceFilter: "",
    });
    setPaginationState((prev) => ({ ...prev, currentPage: 1 }));
  };

  // Memoized event handlers
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        const allIds = candidates.map((candidate) => candidate.id);
        setSelectedCandidates(allIds);
      } else {
        setSelectedCandidates([]);
      }
    },
    [candidates],
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading candidates...</p>
        </div>
      </div>
    );
  }

  const hasActiveFilters = !!(filters.searchTerm || filters.experienceFilter);

  return (
    <div className="min-h-screen  p-4">
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
          totalCandidates={data?.pagination?.total || 0}
          filteredCount={candidates.length}
          onSearchChange={(value) => {
            setFilters((prev) => ({ ...prev, searchTerm: value }));
            setPaginationState((prev) => ({ ...prev, currentPage: 1 }));
          }}
          onExperienceFilterChange={(value) => {
            setFilters((prev) => ({ ...prev, experienceFilter: value }));
            setPaginationState((prev) => ({ ...prev, currentPage: 1 }));
          }}
          onClearFilters={clearFilters}
        />

        {/* Bulk Actions Toolbar */}
        <BulkActionsToolbar
          totalCandidates={candidates.length}
          selectedCount={selectedCandidates.length}
          onSelectAll={handleSelectAll}
          onOpenBulkEmail={() => setEmailDialogOpen(true)}
        />

        {/* Candidates Grid */}
        {candidates.length === 0 ? (
          <EmptyCandidatesState hasFilter={hasActiveFilters} />
        ) : (
          <>
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {candidates.map((candidate) => (
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

            {/* Server-Side Pagination */}
            {data?.pagination && data.pagination.totalPages > 1 && (
              <Card className="mt-6">
                <CardContent className="p-4">
                  <ServerPagination
                    pagination={data.pagination}
                    onPageChange={(page) =>
                      setPaginationState((prev) => ({ ...prev, currentPage: page }))
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
                      className="bg-blue-600 hover:bg-blue-700"
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
