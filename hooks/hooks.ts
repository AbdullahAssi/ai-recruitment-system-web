import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  JobApplicationsData,
  AIScoresData,
  EmailTemplate,
  Application,
  PaginationState,
} from "../types/application.types";

export function useJobApplications(
  jobId: string,
  paginationState: PaginationState
) {
  const [data, setData] = useState<JobApplicationsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchJobApplications = useCallback(async () => {
    setLoading(true);
    try {
      const searchParams = new URLSearchParams({
        page: paginationState.currentPage.toString(),
        limit: paginationState.itemsPerPage.toString(),
      });

      const response = await fetch(
        `/api/jobs/${jobId}/applications?${searchParams}`
      );
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        toast({
          title: "Failed to Load Applications",
          description: result.error || "Could not fetch job applications",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching job applications:", error);
      toast({
        title: "Failed to Load Applications",
        description: "An error occurred while loading applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [jobId, paginationState.currentPage, paginationState.itemsPerPage, toast]);

  useEffect(() => {
    fetchJobApplications();
  }, [fetchJobApplications]);

  const updateApplicationStatus = useCallback(
    async (applicationId: string, newStatus: string) => {
      try {
        const response = await fetch(`/api/jobs/${jobId}/applications`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            applicationId,
            status: newStatus,
          }),
        });

        const result = await response.json();

        if (result.success) {
          // Update the local state
          setData((prevData) => {
            if (!prevData) return prevData;

            const updatedApplications = prevData.applications.map((app) =>
              app.id === applicationId ? { ...app, status: newStatus } : app
            );

            // Recalculate stats
            const stats = {
              pending: updatedApplications.filter(
                (app) => app.status === "PENDING"
              ).length,
              reviewed: updatedApplications.filter(
                (app) => app.status === "REVIEWED"
              ).length,
              shortlisted: updatedApplications.filter(
                (app) => app.status === "SHORTLISTED"
              ).length,
              rejected: updatedApplications.filter(
                (app) => app.status === "REJECTED"
              ).length,
              averageScore:
                updatedApplications.reduce((sum, app) => {
                  const score = app.aiAnalysis?.overallScore || 0;
                  return sum + score;
                }, 0) / updatedApplications.length || 0,
              highPerformers: updatedApplications.filter(
                (app) => (app.aiAnalysis?.overallScore || 0) >= 80
              ).length,
            };

            return {
              ...prevData,
              applications: updatedApplications,
              stats,
            };
          });

          toast({
            title: "Status Updated",
            description: `Application status changed to ${newStatus}`,
          });
        } else {
          toast({
            title: "Update Failed",
            description: result.error || "Could not update application status",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error updating application status:", error);
        toast({
          title: "Update Failed",
          description: "An error occurred while updating the status",
          variant: "destructive",
        });
      }
    },
    [jobId, toast]
  );

  return {
    data,
    loading,
    fetchJobApplications,
    updateApplicationStatus,
  };
}

export function useAIScores() {
  const [aiScoresData, setAiScoresData] = useState<AIScoresData | null>(null);
  const [loadingScores, setLoadingScores] = useState(false);
  const { toast } = useToast();

  const fetchAiScores = useCallback(
    async (applicationId: string) => {
      setLoadingScores(true);
      try {
        const params = new URLSearchParams({
          applicationId: applicationId,
        });
        const response = await fetch(`/api/ai/scores?${params}`);
        const result = await response.json();

        console.log("AI Scores API Full Response:", result);

        // Handle different response structures
        let scoresData;
        if (Array.isArray(result) && result.length > 0) {
          scoresData = result[0];
        } else if (result.success && result.data) {
          scoresData = result.data;
        } else if (result.data) {
          scoresData = result.data;
        } else if (result.scores) {
          scoresData = result.scores;
        } else {
          scoresData = result;
        }

        console.log("Processed AI Scores Data:", scoresData);
        setAiScoresData(scoresData);

        toast({
          title: "AI Scores Loaded",
          description: "Detailed AI analysis has been loaded successfully.",
        });
      } catch (error) {
        console.error("Error fetching AI scores:", error);
        toast({
          title: "Failed to Load AI Scores",
          description: "Could not fetch detailed AI analysis",
          variant: "destructive",
        });
      } finally {
        setLoadingScores(false);
      }
    },
    [toast]
  );

  const resetAiScores = useCallback(() => {
    setAiScoresData(null);
  }, []);

  return {
    aiScoresData,
    loadingScores,
    fetchAiScores,
    resetAiScores,
  };
}

export function useEmailTemplates() {
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEmailTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/email/templates");
      const data = await response.json();
      if (data.success) {
        setEmailTemplates(data.templates);
      }
    } catch (error) {
      console.error("Error fetching email templates:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmailTemplates();
  }, [fetchEmailTemplates]);

  return {
    emailTemplates,
    loading,
    fetchEmailTemplates,
  };
}

export function useBulkEmail(
  jobId: string,
  applications: Application[],
  selectedApplicationIds: string[]
) {
  const [sendingEmail, setSendingEmail] = useState(false);
  const { toast } = useToast();

  const sendBulkEmail = useCallback(
    async (
      templateId?: string,
      customTemplate?: { subject: string; body: string; name: string }
    ) => {
      if (selectedApplicationIds.length === 0) {
        toast({
          title: "No Recipients Selected",
          description:
            "Please select at least one application to send emails to",
          variant: "destructive",
        });
        return false;
      }

      if (!templateId && !customTemplate) {
        toast({
          title: "Email Content Missing",
          description: "Please select a template or provide custom content",
          variant: "destructive",
        });
        return false;
      }

      setSendingEmail(true);

      try {
        const selectedApps = applications.filter((app) =>
          selectedApplicationIds.includes(app.id)
        );

        const candidateIds = selectedApps.map((app) => app.candidate.id);

        const emailData = {
          candidateIds,
          jobId,
          ...(templateId ? { templateId } : { customTemplate }),
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
          toast({
            title: "Emails Sent Successfully",
            description: `Sent ${result.sent} emails to selected candidates`,
          });
          return true;
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
        return false;
      } finally {
        setSendingEmail(false);
      }
    },
    [selectedApplicationIds, applications, jobId, toast]
  );

  return {
    sendBulkEmail,
    sendingEmail,
  };
}

// Re-export new modular hooks
export { useApi } from "./useApi";
export { useFilters } from "./useFilters";
export { usePagination } from "./usePagination";
export { useScores } from "./useScores";
export { useAnalytics } from "./useAnalytics";
