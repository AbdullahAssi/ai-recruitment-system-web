"use client";

import { useState, useRef, ChangeEvent } from "react";
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ResumeUploadProps {
  onUploadSuccess?: (data: any) => void;
}

export function ResumeUpload({ onUploadSuccess }: ResumeUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    if (selectedFile.type !== "application/pdf") {
      toast.error("Invalid file type", {
        description: "Please upload a PDF file.",
      });
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      // 5MB limit
      toast.error("File too large", {
        description: "Please upload a file smaller than 5MB.",
      });
      return;
    }
    setFile(selectedFile);
  };

  const removeFile = () => {
    setFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(10); // Start progress

    try {
      const formData = new FormData();
      formData.append("file", file);

      // simulate progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const response = await fetch("/api/v1/resumes/process", {
        method: "POST",
        body: formData,
      });

      clearInterval(interval);

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      setUploadProgress(100);
      const data = await response.json();

      toast.success("Resume uploaded successfully!", {
        description: "Your resume has been processed.",
      });

      if (onUploadSuccess) {
        onUploadSuccess(data);
      }

      // Optional: Clear file after success or keep it to show "Uploaded" state
      // setFile(null);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed", {
        description:
          "There was an error processing your resume. Please try again.",
      });
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-slate-200 hover:border-primary/50",
            file ? "border-green-500/50 bg-green-50/30" : "",
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !file && fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf"
            onChange={handleFileSelect}
          />

          {!file ? (
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                <Upload className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <p className="text-lg font-medium">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-slate-500">PDF up to 5MB</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-red-500" />
                </div>
                <div className="text-left">
                  <p className="font-medium truncate max-w-[200px]">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              {!isUploading && uploadProgress !== 100 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                >
                  <X className="w-5 h-5 text-slate-500" />
                </Button>
              )}

              {uploadProgress === 100 && (
                <CheckCircle className="w-6 h-6 text-green-500" />
              )}
            </div>
          )}
        </div>

        {file && (
          <div className="mt-6 space-y-4">
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {!isUploading && uploadProgress !== 100 && (
              <Button onClick={handleUpload} className="w-full" size="lg">
                Upload and Analyze Resume
              </Button>
            )}

            {uploadProgress === 100 && (
              <div className="text-center text-green-600 font-medium flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" /> Analysis Complete
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
