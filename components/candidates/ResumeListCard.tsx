import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FaFilePdf,
  FaDownload,
  FaTrash,
  FaStar,
  FaClock,
} from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";

interface Resume {
  id: string;
  fileName: string;
  uploadDate: string;
}

interface ResumeListCardProps {
  resumes: Resume[];
  primaryResumeId?: string | null;
  onDownload: (resumeId: string, fileName: string) => void;
  onDelete?: (resumeId: string) => void;
  onSetPrimary?: (resumeId: string) => void;
}

export function ResumeListCard({
  resumes,
  primaryResumeId,
  onDownload,
  onDelete,
  onSetPrimary,
}: ResumeListCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-red-50 dark:bg-red-900/20">
          <FaFilePdf className="text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            My Resumes
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {resumes.length} document{resumes.length !== 1 ? "s" : ""} on file
          </p>
        </div>
      </div>
      <div className="p-5">
        {resumes.length === 0 ? (
          <div className="text-center py-10 text-gray-400 dark:text-gray-500">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mx-auto mb-4">
              <FaFilePdf className="text-3xl opacity-40" />
            </div>
            <p className="font-medium text-gray-500 dark:text-gray-400">
              No resumes uploaded yet
            </p>
            <p className="text-sm mt-1">Upload your resume to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {resumes.map((resume) => {
              const isPrimary = resume.id === primaryResumeId;
              return (
                <div
                  key={resume.id}
                  className={`p-4 border rounded-lg transition-all duration-200 ${
                    isPrimary
                      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                      : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <FaFilePdf className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0" />
                        <h4 className="font-medium text-gray-900 dark:text-white truncate text-sm">
                          {resume.fileName}
                        </h4>
                        {isPrimary && (
                          <Badge className="bg-blue-600 dark:bg-blue-500 text-white border-0 shrink-0 text-xs">
                            <FaStar className="w-2.5 h-2.5 mr-1" />
                            Primary
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <FaClock className="w-3 h-3" />
                        <span>
                          Uploaded{" "}
                          {formatDistanceToNow(new Date(resume.uploadDate), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDownload(resume.id, resume.fileName)}
                        className="hover:bg-blue-50 dark:hover:bg-blue-900/20 border-gray-200 dark:border-gray-700 dark:text-gray-300"
                        aria-label={`Download ${resume.fileName}`}
                      >
                        <FaDownload className="w-3 h-3" />
                      </Button>
                      {!isPrimary && onSetPrimary && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onSetPrimary(resume.id)}
                          className="hover:bg-blue-50 dark:hover:bg-blue-900/20 border-gray-200 dark:border-gray-700 dark:text-gray-300"
                          aria-label={`Set ${resume.fileName} as primary`}
                        >
                          <FaStar className="w-3 h-3" />
                        </Button>
                      )}
                      {onDelete && !isPrimary && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onDelete(resume.id)}
                          className="hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 border-gray-200 dark:border-gray-700"
                          aria-label={`Delete ${resume.fileName}`}
                        >
                          <FaTrash className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
