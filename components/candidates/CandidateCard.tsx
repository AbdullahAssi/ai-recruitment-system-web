import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Calendar, Download, Eye, FileText, Briefcase } from "lucide-react";
import { HiSparkles } from "react-icons/hi";
import { BsTrophy } from "react-icons/bs";
import { format } from "date-fns";
import { Candidate } from "../../hooks/useCandidates";
import { getStatusColor, getScoreColor, getExperienceLabel } from "../../lib/candidateUtils";
import { formatStatusText } from "../../lib/applicationUtil";

interface CandidateCardProps {
  candidate: Candidate;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onDownloadResume?: (resumeId: string, fileName: string) => void;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
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
    <div
      className={`rounded-xl border bg-card flex flex-col transition-all duration-200 hover:shadow-md ${
        isSelected ? "ring-2 ring-primary border-primary" : "border-border"
      }`}
    >
      {/*  Header  */}
      <div className="p-4 flex items-start gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand/20 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-brand">
            {getInitials(candidate.name)}
          </span>
        </div>

        {/* Name / meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-foreground truncate leading-tight">
              {candidate.name}
            </h3>
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              className="flex-shrink-0 mt-0.5"
              aria-label={`Select ${candidate.name}`}
            />
          </div>
          <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 truncate">
              <Mail className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{candidate.email}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Briefcase className="w-3 h-3 flex-shrink-0" />
              <span>{getExperienceLabel(candidate.experience)}</span>
              <span className="mx-1 text-border"></span>
              <Calendar className="w-3 h-3 flex-shrink-0" />
              <span>Joined {format(new Date(candidate.createdAt), "MMM yyyy")}</span>
            </div>
          </div>
        </div>
      </div>

      {/*  Score / status badges  */}
      <div className="px-4 pb-3 flex flex-wrap gap-1.5">
        {averageScore > 0 && (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${getScoreColor(averageScore)}`}>
            <HiSparkles className="w-3 h-3" />
            {averageScore}% avg
          </span>
        )}
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border bg-muted text-muted-foreground border-border">
          <FileText className="w-3 h-3" />
          {candidate.resumes.length} Resume{candidate.resumes.length !== 1 ? "s" : ""}
        </span>
        {candidate.applications.length > 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border bg-brand-50 text-brand border-brand-200 dark:bg-brand/10 dark:border-brand/30">
            <BsTrophy className="w-3 h-3" />
            {candidate.applications.length} App{candidate.applications.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/*  Latest resume  */}
      {latestResume && (
        <div className="px-4 pb-3">
          <div className="rounded-lg border border-border bg-muted/50 p-2.5 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{latestResume.fileName}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {format(new Date(latestResume.uploadDate), "MMM dd, yyyy")}
              </p>
            </div>
            {onDownloadResume && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDownloadResume(latestResume.id, latestResume.fileName)}
                className="h-7 text-xs flex-shrink-0 border-border text-foreground hover:bg-muted"
              >
                <Download className="w-3 h-3 mr-1" />
                Download
              </Button>
            )}
          </div>
        </div>
      )}

      {/*  Applications list  */}
      {candidate.applications.length > 0 && (
        <div className="px-4 pb-3">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
            Applications
          </p>
          <div className="space-y-1.5">
            {candidate.applications.slice(0, 2).map((application) => (
              <div
                key={application.id}
                className="flex justify-between items-center px-2.5 py-1.5 rounded-lg bg-muted/50 border border-border"
              >
                <p className="text-xs font-medium text-foreground truncate flex-1 mr-2">
                  {application.job.title}
                </p>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusColor(application.status)}`}>
                    {formatStatusText(application.status)}
                  </span>
                  <span className={`text-[10px] font-bold ${getScoreColor(application.score)}`}>
                    {application.score}%
                  </span>
                </div>
              </div>
            ))}
            {candidate.applications.length > 2 && (
              <p className="text-[10px] text-muted-foreground text-center pt-0.5">
                +{candidate.applications.length - 2} more
              </p>
            )}
          </div>
        </div>
      )}

      {/*  Footer actions  */}
      <div className="mt-auto border-t border-border p-3">
        <Link href={`/hr/candidates/${candidate.id}`} className="block">
          <Button
            variant="outline"
            size="sm"
            className="w-full h-8 text-xs border-border text-foreground hover:bg-muted"
          >
            <Eye className="w-3.5 h-3.5 mr-1.5" />
            View Profile
          </Button>
        </Link>
      </div>
    </div>
  );
}
