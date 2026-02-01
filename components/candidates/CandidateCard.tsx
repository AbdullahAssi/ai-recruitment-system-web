import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  User,
  Mail,
  Calendar,
  FileText,
  Eye,
  Download,
  Briefcase,
} from "lucide-react";
import { format } from "date-fns";
import { Candidate } from "../../hooks/useCandidates";
import {
  getStatusColor,
  getScoreColor,
  getExperienceLabel,
} from "../../lib/candidateUtils";
import { formatStatusText } from "../../lib/applicationUtil";

interface CandidateCardProps {
  candidate: Candidate;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onDownloadResume?: (resumeId: string, fileName: string) => void;
}

export function CandidateCard({
  candidate,
  isSelected,
  onSelect,
  onDownloadResume,
}: CandidateCardProps) {
  const latestResume = candidate.resumes[0];
  const averageScore =
    candidate.applications.length > 0
      ? Math.round(
          candidate.applications.reduce((sum, app) => sum + app.score, 0) /
            candidate.applications.length,
        )
      : 0;

  return (
    <Card
      className={`shadow-lg hover:shadow-xl transition-all ${
        isSelected ? "ring-2 ring-purple-500 bg-purple-50" : ""
      }`}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
            />
            <div className="w-12 h-12 bg-gradient-to-br from-purple-300 to-blue-300 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{candidate.name}</h3>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {candidate.email}
              </p>
            </div>
          </div>
          {averageScore > 0 && (
            <div
              className={`px-2 py-1 rounded text-sm font-semibold ${getScoreColor(
                averageScore,
              )}`}
            >
              {averageScore}% avg
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Candidate Info */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Briefcase className="w-3 h-3" />
            {getExperienceLabel(candidate.experience)}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Joined {format(new Date(candidate.createdAt), "MMM yyyy")}
          </div>
        </div>

        {/* Resume Info */}
        {latestResume && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Latest Resume
                </p>
                <p className="text-xs text-gray-600">{latestResume.fileName}</p>
                <p className="text-xs text-gray-500">
                  {format(new Date(latestResume.uploadDate), "MMM dd, yyyy")}
                </p>
              </div>
              {onDownloadResume && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    onDownloadResume(latestResume.id, latestResume.fileName)
                  }
                  className="text-xs"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Applications Summary */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium text-gray-900">
              Applications ({candidate.applications.length})
            </h4>
          </div>
          {candidate.applications.length > 0 ? (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {candidate.applications.slice(0, 2).map((application) => (
                <div
                  key={application.id}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded"
                >
                  <div>
                    <p className="text-xs font-medium text-gray-900">
                      {application.job.title}
                    </p>
                    <p className="text-xs text-gray-600">
                      {format(new Date(application.appliedAt), "MMM dd")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={getStatusColor(application.status)}
                      variant="outline"
                    >
                      {formatStatusText(application.status)}
                    </Badge>
                    <span
                      className={`text-xs font-semibold ${getScoreColor(
                        application.score,
                      )}`}
                    >
                      {application.score}%
                    </span>
                  </div>
                </div>
              ))}
              {candidate.applications.length > 2 && (
                <p className="text-xs text-gray-500 text-center">
                  +{candidate.applications.length - 2} more applications
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-2">
              No applications yet
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Link href={`/hr/candidates/${candidate.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full text-xs">
              <Eye className="w-3 h-3 mr-1" />
              View Profile
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="text-xs">
            <FileText className="w-3 h-3 mr-1" />
            {candidate.resumes.length} Resume
            {candidate.resumes.length !== 1 ? "s" : ""}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
