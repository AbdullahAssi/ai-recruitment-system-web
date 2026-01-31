"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { FileText, Upload, CheckCircle2 } from "lucide-react";

interface JobApplicationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
  candidateId: string;
  userName: string;
  userEmail: string;
  userExperience: number;
  primaryResume?: {
    id: string;
    fileName: string;
    uploadDate: string;
  } | null;
  onApplicationSuccess: () => void;
}

export function JobApplicationDialog({
  isOpen,
  onClose,
  jobId,
  jobTitle,
  candidateId,
  userName,
  userEmail,
  userExperience,
  primaryResume,
  onApplicationSuccess,
}: JobApplicationDialogProps) {
  const [resumeOption, setResumeOption] = useState<"primary" | "custom">(
    "primary",
  );
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setResumeOption(primaryResume ? "primary" : "custom");
      setCustomFile(null);
    }
  }, [isOpen, primaryResume]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCustomFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (resumeOption === "custom" && !customFile) {
      toast({
        title: "Error",
        description: "Please select a resume file",
        variant: "destructive",
      });
      return;
    }

    if (resumeOption === "primary" && !primaryResume) {
      toast({
        title: "Error",
        description:
          "No primary resume found. Please upload one in your profile.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      let resumeId = null;

      // If custom resume selected, upload it first
      if (resumeOption === "custom" && customFile) {
        const formData = new FormData();
        formData.append("resume", customFile);
        formData.append("name", userName);
        formData.append("email", userEmail);
        formData.append("experience", userExperience.toString());
        formData.append("candidateId", candidateId);
        formData.append("jobId", jobId);
        formData.append("isJobSpecific", "true");

        const uploadResponse = await fetch("/api/upload/resume", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadResponse.json();

        if (!uploadData.success) {
          throw new Error(uploadData.error || "Failed to upload resume");
        }

        resumeId = uploadData.resumeId;
      } else {
        // Use primary resume
        resumeId = primaryResume?.id;
      }

      // Submit application with resume ID
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          candidateId,
          resumeId,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit application");
      }

      toast({
        title: "Application Submitted!",
        description:
          "Your application has been successfully submitted and is being processed by AI",
      });

      onApplicationSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Apply for {jobTitle}</DialogTitle>
          <DialogDescription>
            Choose which resume to use for this application
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <RadioGroup
            value={resumeOption}
            onValueChange={(value) =>
              setResumeOption(value as "primary" | "custom")
            }
          >
            {/* Option 1: Use Primary Resume */}
            <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <RadioGroupItem
                value="primary"
                id="primary"
                disabled={!primaryResume}
                className="mt-1"
              />
              <Label htmlFor="primary" className="flex-1 cursor-pointer">
                <div className="font-medium mb-1">Use my profile resume</div>
                {primaryResume ? (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <FileText className="w-4 h-4" />
                    <span>{primaryResume.fileName}</span>
                    <Badge variant="secondary" className="ml-2">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Primary
                    </Badge>
                  </div>
                ) : (
                  <p className="text-sm text-red-500">
                    No primary resume uploaded. Please upload one in your
                    profile.
                  </p>
                )}
              </Label>
            </div>

            {/* Option 2: Upload Job-Specific Resume */}
            <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <RadioGroupItem value="custom" id="custom" className="mt-1" />
              <Label htmlFor="custom" className="flex-1 cursor-pointer">
                <div className="font-medium mb-1">
                  Upload a different resume
                </div>
                <p className="text-sm text-gray-600">
                  Upload a tailored resume for this specific position
                </p>
              </Label>
            </div>
          </RadioGroup>

          {/* Custom File Upload */}
          {resumeOption === "custom" && (
            <div className="space-y-3 pl-4 border-l-2 border-blue-500">
              <Label htmlFor="custom-resume-file">
                Select Resume for This Job
              </Label>
              <Input
                id="custom-resume-file"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
              />
              <p className="text-xs text-gray-500">
                Supported formats: PDF, DOC, DOCX
              </p>
              {customFile && (
                <div className="flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">{customFile.name}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              submitting ||
              (resumeOption === "primary" && !primaryResume) ||
              (resumeOption === "custom" && !customFile)
            }
          >
            {submitting ? "Submitting..." : "Submit Application"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
