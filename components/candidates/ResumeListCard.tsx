import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FaFilePdf className="w-5 h-5 text-red-600" />
          My Resumes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {resumes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FaFilePdf className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No resumes uploaded yet</p>
            <p className="text-sm mt-1">Upload your resume to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {resumes.map((resume) => {
              const isPrimary = resume.id === primaryResumeId;
              return (
                <div
                  key={resume.id}
                  className={`p-4 border rounded-lg transition-all ${
                    isPrimary
                      ? "bg-purple-50 border-purple-300"
                      : "bg-gray-50 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <FaFilePdf className="w-4 h-4 text-red-600 shrink-0" />
                        <h4 className="font-medium text-gray-900 truncate">
                          {resume.fileName}
                        </h4>
                        {isPrimary && (
                          <Badge className="bg-purple-600 text-white shrink-0">
                            <FaStar className="w-3 h-3 mr-1" />
                            Primary
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
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
                        className="hover:bg-blue-50"
                        aria-label={`Download ${resume.fileName}`}
                      >
                        <FaDownload className="w-3 h-3" />
                      </Button>
                      {!isPrimary && onSetPrimary && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onSetPrimary(resume.id)}
                          className="hover:bg-purple-50"
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
                          className="hover:bg-red-50 text-red-600"
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
      </CardContent>
    </Card>
  );
}
