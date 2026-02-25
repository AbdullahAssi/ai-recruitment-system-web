"use client";

import { format } from "date-fns";
import {
  FiMail,
  FiBriefcase,
  FiCalendar,
  FiDownload,
  FiTrendingUp,
} from "react-icons/fi";
import { BsTrophy, BsCheckCircle } from "react-icons/bs";
import { HiSparkles } from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Application } from "../../types/application.types";
import {
  getStatusColor,
  getScoreColor,
  downloadResume,
  formatStatusText,
} from "../../lib/applicationUtil";
import { useToast } from "@/hooks/use-toast";

interface ApplicationCardProps {
  application: Application;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onStatusUpdate: (newStatus: string) => void;
  onViewAIAnalysis?: () => void;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function getRecommendationColor(score: number) {
  if (score >= 80)
    return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800";
  if (score >= 60)
    return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800";
  if (score >= 40)
    return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800";
  return "bg-destructive/5 text-destructive border-destructive/20";
}

export function ApplicationCard({
  application,
  isSelected,
  onSelect,
  onStatusUpdate,
  onViewAIAnalysis,
}: ApplicationCardProps) {
  const { toast } = useToast();

  const handleDownloadResume = async () => {
    if (application.candidate.resumes.length > 0) {
      const resume = application.candidate.resumes[0];
      const result = await downloadResume(resume.id, resume.fileName);
      toast(
        result.success
          ? {
              title: "Download Started",
              description: `Downloading ${resume.fileName}`,
            }
          : {
              title: "Download Failed",
              description: "Could not download the resume",
              variant: "destructive",
            },
      );
    }
  };

  return (
    <div
      className={`rounded-xl border bg-card flex flex-col transition-all duration-200 hover:shadow-md ${
        isSelected ? "ring-2 ring-primary border-primary" : "border-border"
      }`}
    >
      {/*  Header  */}
      <div className="p-4 flex items-start gap-3">
        {/* Avatar with optional AI sparkle badge */}
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand/20 flex items-center justify-center">
            <span className="text-xs font-bold text-brand">
              {getInitials(application.candidate.name)}
            </span>
          </div>
          {application.aiAnalysis && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand flex items-center justify-center">
              <HiSparkles className="w-2.5 h-2.5 text-white" />
            </span>
          )}
        </div>

        {/* Name / meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-foreground truncate leading-tight">
              {application.candidate.name}
            </h3>
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              className="flex-shrink-0 mt-0.5"
              aria-label={`Select ${application.candidate.name}`}
            />
          </div>
          <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 truncate">
              <FiMail className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{application.candidate.email}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FiCalendar className="w-3 h-3 flex-shrink-0" />
              <span>
                {format(new Date(application.appliedAt), "MMM dd, yyyy  HH:mm")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/*  Score badges  */}
      <div className="px-4 pb-3 flex flex-wrap items-center justify-center gap-1.5">
        {/* Match badge */}
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${getScoreColor(application.score)}`}
        >
          <HiSparkles className="w-3 h-3" />
          {application.score}% Match
        </span>

        {/* Quiz score OR Experience badge */}
        {typeof application.candidate.quizScore === "number" ? (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
              application.candidate.quizPassed
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
                : "bg-destructive/5 text-destructive border-destructive/20"
            }`}
          >
            <BsTrophy className="w-3 h-3" />
            {application.candidate.quizScore}% Quiz
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
            <FiBriefcase className="w-3 h-3" />
            {application.candidate.experience}y Exp.
          </span>
        )}

        {/* AI overall OR status badge */}
        {application.aiAnalysis ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border bg-brand-50 text-brand border-brand-200 dark:bg-brand/10 dark:border-brand/30">
            <HiSparkles className="w-3 h-3" />
            {application.aiAnalysis.overallScore}% AI
          </span>
        ) : (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(application.status)}`}
          >
            <BsCheckCircle className="w-3 h-3" />
            {formatStatusText(application.status)}
          </span>
        )}
      </div>

      {/*  AI breakdown  */}
      {application.aiAnalysis && (
        <div className="px-4 pb-3">
          <div className="rounded-lg border border-border bg-muted/50 p-2.5">
            <div className="grid grid-cols-3 gap-2 mb-2">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">
                  <FiTrendingUp className="w-3 h-3" />
                  <span className="text-[9px]">Skills</span>
                </div>
                <div className="text-sm font-bold text-brand">
                  {application.aiAnalysis.scores.skills}
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">
                  <FiBriefcase className="w-3 h-3" />
                  <span className="text-[9px]">Exp</span>
                </div>
                <div className="text-sm font-bold text-brand">
                  {application.aiAnalysis.scores.experience}
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">
                  <BsCheckCircle className="w-3 h-3" />
                  <span className="text-[9px]">Fit</span>
                </div>
                <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {application.aiAnalysis.scores.fit}
                </div>
              </div>
            </div>
            <div
              className={`text-center text-xs font-semibold px-2 py-1 rounded-md border ${getRecommendationColor(
                application.aiAnalysis.overallScore,
              )}`}
            >
              {application.aiAnalysis.recommendation.replace(/_/g, " ")}
            </div>
          </div>
        </div>
      )}

      {/*  Footer actions  */}
      <div className="mt-auto border-t border-border p-3 space-y-2">
        <Select value={application.status} onValueChange={onStatusUpdate}>
          <SelectTrigger className="h-8 text-xs bg-muted border-border text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="REVIEWED">Reviewed</SelectItem>
            <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="QUIZ_PENDING">Quiz Pending</SelectItem>
            <SelectItem value="QUIZ_COMPLETED">Quiz Completed</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          {application.candidate.resumes.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownloadResume}
              className="flex-1 h-8 text-xs border-border text-foreground hover:bg-muted"
            >
              <FiDownload className="w-3.5 h-3.5 mr-1.5" />
              Resume
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-8 text-xs border-border text-foreground hover:bg-muted"
          >
            <FiMail className="w-3.5 h-3.5 mr-1.5" />
            Email
          </Button>
        </div>

        {onViewAIAnalysis && (
          <Button
            variant="outline"
            size="sm"
            onClick={onViewAIAnalysis}
            className="w-full h-8 text-xs border-brand-200 text-brand hover:bg-brand-50 dark:hover:bg-brand/10"
          >
            <HiSparkles className="w-3.5 h-3.5 mr-1.5" />
            {application.aiAnalysis
              ? "View AI Details"
              : "Generate AI Analysis"}
          </Button>
        )}
      </div>
    </div>
  );
}
