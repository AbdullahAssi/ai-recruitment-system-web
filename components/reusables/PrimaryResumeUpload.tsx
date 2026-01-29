"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, CheckCircle2, Trash2 } from "lucide-react";

interface PrimaryResumeUploadProps {
  candidateId: string;
  userName: string;
  userEmail: string;
  experience?: number;
  primaryResume?: {
    id: string;
    fileName: string;
    uploadDate: string;
  } | null;
  onUploadSuccess?: () => void;
}

export function PrimaryResumeUpload({
  candidateId,
  userName,
  userEmail,
  experience = 0,
  primaryResume,
  onUploadSuccess,
}: PrimaryResumeUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("name", userName);
      formData.append("email", userEmail);
      formData.append("experience", experience.toString());
      formData.append("candidateId", candidateId);
      formData.append("isPrimary", "true"); // Mark as primary resume

      const response = await fetch("/api/upload/resume", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Primary resume uploaded successfully",
        });
        setFile(null);
        // Reset file input
        const fileInput = document.getElementById(
          "primary-resume-file",
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";

        if (onUploadSuccess) {
          onUploadSuccess();
        }
      } else {
        throw new Error(data.error || "Failed to upload resume");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload resume",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePrimary = async () => {
    if (!primaryResume?.id) return;

    setRemoving(true);
    try {
      const response = await fetch(
        `/api/candidates/${candidateId}/primary-resume`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Primary resume removed",
        });

        if (onUploadSuccess) {
          onUploadSuccess();
        }
      } else {
        throw new Error(data.error || "Failed to remove primary resume");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove primary resume",
        variant: "destructive",
      });
    } finally {
      setRemoving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Primary Resume
        </CardTitle>
        <p className="text-sm text-gray-500 mt-2">
          Upload your main resume to use for quick applications. You can
          override this for specific jobs.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Primary Resume */}
          {primaryResume && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {primaryResume.fileName}
                    </p>
                    <p className="text-sm text-gray-500">
                      Uploaded{" "}
                      {new Date(primaryResume.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemovePrimary}
                  disabled={removing}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Upload New Primary Resume */}
          <div>
            <Label htmlFor="primary-resume-file">
              {primaryResume
                ? "Replace Primary Resume"
                : "Upload Primary Resume"}
            </Label>
            <Input
              id="primary-resume-file"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: PDF, DOC, DOCX
            </p>
          </div>

          {file && (
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Upload className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-900">
                  {file.name}
                </span>
              </div>
              <Button onClick={handleUpload} disabled={uploading} size="sm">
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
