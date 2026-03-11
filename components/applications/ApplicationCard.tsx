"use client";

import { formatDistanceToNow } from "date-fns";
import { FiMail, FiCalendar, FiFileText } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Application } from "../../types/application.types";
import { downloadResume, formatStatusText } from "../../lib/applicationUtil";
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

const AVATAR_PALETTES = [
  { bg: "bg-sky-100", text: "text-sky-700" },
  { bg: "bg-violet-100", text: "text-violet-700" },
  { bg: "bg-rose-100", text: "text-rose-700" },
  { bg: "bg-amber-100", text: "text-amber-700" },
  { bg: "bg-teal-100", text: "text-teal-700" },
  { bg: "bg-indigo-100", text: "text-indigo-700" },
  { bg: "bg-lime-100", text: "text-lime-700" },
  { bg: "bg-pink-100", text: "text-pink-700" },
];

function getAvatarPalette(name: string) {
  const idx =
    name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    AVATAR_PALETTES.length;
  return AVATAR_PALETTES[idx];
}

const STATUS_STYLES: Record<string, string> = {
  SHORTLISTED:
    "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
  APPLIED:
    "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
  PENDING:
    "bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
  REVIEWED:
    "bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-800",
  REJECTED:
    "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
  QUIZ_PENDING:
    "bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
  QUIZ_COMPLETED:
    "bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800",
};

function getStatusStyle(status: string) {
  return (
    STATUS_STYLES[status.toUpperCase()] ||
    "bg-muted text-muted-foreground border border-border"
  );
}

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "REVIEWED", label: "Reviewed" },
  { value: "SHORTLISTED", label: "Shortlisted" },
  { value: "REJECTED", label: "Rejected" },
  { value: "QUIZ_PENDING", label: "Quiz Pending" },
  { value: "QUIZ_COMPLETED", label: "Quiz Completed" },
];

export function ApplicationCard({
  application,
  isSelected,
  onSelect,
  onStatusUpdate,
  onViewAIAnalysis,
}: ApplicationCardProps) {
  const { toast } = useToast();
  const palette = getAvatarPalette(application.candidate.name);
  const initials = getInitials(application.candidate.name);
  const matchScore = application.score ?? 0;
  const quizScore = application.candidate.quizScore;

  const handleDownloadResume = async () => {
    if (application.candidate.resumes.length > 0) {
      const resume = application.candidate.resumes[0];
      const result = await downloadResume(resume.id, resume.fileName);
      toast(
        result.success
          ? { title: "Download Started", description: `Downloading ${resume.fileName}` }
          : { title: "Download Failed", description: "Could not download the resume", variant: "destructive" },
      );
    }
  };

  return (
    <div
      className={`rounded-2xl border bg-card flex flex-col transition-all duration-200 hover:shadow-md ${
        isSelected ? "ring-2 ring-brand border-brand" : "border-border"
      }`}
    >
      {/* Header */}
      <div className="p-5 flex items-start gap-3">
        <div className="flex-shrink-0">
          <div
            className={`w-12 h-12 rounded-full ${palette.bg} flex items-center justify-center`}
          >
            <span className={`text-sm font-bold ${palette.text}`}>{initials}</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground truncate leading-tight">
            {application.candidate.name}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground truncate">
            {application.candidate.email}
          </p>
        </div>

        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
          aria-label={`Select ${application.candidate.name}`}
          className="mt-1 flex-shrink-0"
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer focus:outline-none ${getStatusStyle(application.status)}`}
            >
              {formatStatusText(application.status)}
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[140px]">
            {STATUS_OPTIONS.map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                onClick={() => onStatusUpdate(opt.value)}
                className={application.status === opt.value ? "font-semibold" : ""}
              >
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Score panel */}
      <div className="mx-5 mb-4 grid grid-cols-2 divide-x divide-border rounded-xl border border-border bg-muted/40">
        <div className="py-3 px-4 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
            Match Score
          </p>
          <p
            className={`text-2xl font-extrabold leading-none ${
              matchScore >= 80
                ? "text-brand"
                : matchScore >= 60
                ? "text-amber-500"
                : "text-rose-500"
            }`}
          >
            {matchScore}%
          </p>
        </div>

        <div className="py-3 px-4 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
            {typeof quizScore === "number" ? "Quiz Score" : "Experience"}
          </p>
          <p className="text-2xl font-extrabold leading-none text-foreground">
            {typeof quizScore === "number"
              ? `${quizScore}%`
              : `${application.candidate.experience}y`}
          </p>
        </div>
      </div>

      {/* Meta */}
      <div className="px-5 pb-4 flex flex-col gap-1.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <FiCalendar className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            Applied{" "}
            {formatDistanceToNow(new Date(application.appliedAt), { addSuffix: true })}
          </span>
        </div>
        {application.aiAnalysis && (
          <div className="flex items-center gap-1.5">
            <HiSparkles className="w-3.5 h-3.5 flex-shrink-0 text-brand" />
            <span className="text-brand font-medium">
              AI Score: {application.aiAnalysis.overallScore}%
              {" · "}
              {application.aiAnalysis.recommendation.replace(/_/g, " ")}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-auto border-t border-border px-5 py-4 flex items-center gap-2">
        {onViewAIAnalysis && (
          <Button
            size="sm"
            onClick={onViewAIAnalysis}
            className="flex-1 h-9 text-xs bg-brand hover:bg-brand/90 text-white font-semibold"
          >
            <HiSparkles className="w-3.5 h-3.5 mr-1.5" />
            AI Analysis
          </Button>
        )}

        {application.candidate.resumes.length > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownloadResume}
            title="Download Resume"
            className="h-9 w-9 p-0 flex-shrink-0 border-border text-foreground hover:bg-muted"
          >
            <FiFileText className="w-4 h-4" />
            <span className="sr-only">Resume</span>
          </Button>
        )}

        <Button
          size="sm"
          variant="outline"
          title="Email candidate"
          className="h-9 w-9 p-0 flex-shrink-0 border-border text-foreground hover:bg-muted"
        >
          <FiMail className="w-4 h-4" />
          <span className="sr-only">Email</span>
        </Button>
      </div>
    </div>
  );
}
