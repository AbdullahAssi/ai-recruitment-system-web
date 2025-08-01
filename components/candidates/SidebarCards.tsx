import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Clock, FileText, Download } from "lucide-react";
import { format } from "date-fns";
import { CandidateProfile, CandidateResume } from "../../hooks/useCandidates";
import { parseJsonField } from "../../lib/candidateUtils";
import { getStatusColor, getScoreColor } from "../../lib/candidateUtils";

interface SidebarCardsProps {
  candidate: CandidateProfile;
  latestResume: CandidateResume | null;
  onDownloadResume?: (resumeId: string, fileName: string) => void;
}

export function SidebarCards({ candidate, latestResume, onDownloadResume }: SidebarCardsProps) {
  const certifications = parseJsonField(latestResume?.certifications_json);

  return (
    <div className="space-y-6">
      {/* Certifications */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            Certifications ({certifications.length} found)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {certifications.length > 0 ? (
            certifications
              .filter((cert: string) => cert && cert.trim() !== "")
              .map((cert: string, index: number) => {
                const dashIndex = cert.lastIndexOf(" - ");
                const name = dashIndex > 0 ? cert.substring(0, dashIndex).trim() : cert.trim();
                const issuer = dashIndex > 0 ? cert.substring(dashIndex + 3).trim() : "";

                return (
                  <div key={index} className="border-b border-gray-200 pb-3 last:border-b-0">
                    <h4 className="font-medium text-gray-900">{name}</h4>
                    {issuer && <p className="text-sm text-purple-600">{issuer}</p>}
                  </div>
                );
              })
          ) : (
            <p className="text-gray-500 italic">No certifications extracted from resume.</p>
          )}
        </CardContent>
      </Card>

      {/* Application History */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            Application History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {candidate.applications.length > 0 ? (
            candidate.applications.map((application) => (
              <div key={application.id} className="border p-3 rounded-lg bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">{application.job.title}</h4>
                    <p className="text-sm text-gray-600">{application.job.company || "Company"}</p>
                  </div>
                  <div className="text-right">
                    <div className={`px-2 py-1 rounded text-sm font-semibold ${getScoreColor(application.score)}`}>
                      {application.score}%
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <Badge className={getStatusColor(application.status)}>
                    {application.status}
                  </Badge>
                  <span className="text-xs text-gray-600">
                    {format(new Date(application.appliedAt), "MMM dd, yyyy")}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No applications yet</p>
          )}
        </CardContent>
      </Card>

      {/* Resume Files */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            Resume Files
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {candidate.resumes.map((resume) => (
            <div key={resume.id} className="flex justify-between items-center p-3 border rounded-lg bg-gray-50">
              <div>
                <h4 className="font-medium text-gray-900 text-sm">{resume.fileName}</h4>
                <p className="text-xs text-gray-600">
                  {format(new Date(resume.uploadDate), "MMM dd, yyyy")}
                </p>
              </div>
              {onDownloadResume && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDownloadResume(resume.id, resume.fileName)}
                >
                  <Download className="w-3 h-3" />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
