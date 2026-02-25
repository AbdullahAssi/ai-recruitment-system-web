import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MapPin,
  Calendar,
  Users,
  MoreHorizontal,
  Edit,
  ToggleLeft,
  ToggleRight,
  ArrowUpRight,
} from "lucide-react";
import { Job } from "../../hooks/useJobs";
import { getScoreColor } from "../../lib/jobUtils";
import { formatStatusText } from "../../lib/applicationUtil";

interface JobCardProps {
  job: Job;
  updating: string | null;
  onEdit: (job: Job) => void;
  onToggleStatus: (jobId: string, currentStatus: boolean) => void;
}

function getInitials(title: string): string {
  return title
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function JobCard({ job, updating, onEdit, onToggleStatus }: JobCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-md transition-shadow flex flex-col">
      {/* Header */}
      <div className="p-5 pb-4 flex items-start gap-3">
        {/* Initials avatar */}
        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
            {getInitials(job.title)}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white leading-tight truncate">
              {job.title}
            </h3>
            {/* Status badge */}
            <span
              className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
                job.isActive
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
              }`}
            >
              {job.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          {/* Meta pills */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-full px-2.5 py-1">
              <MapPin className="w-3 h-3" />
              {job.location || "Remote"}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-full px-2.5 py-1">
              <Calendar className="w-3 h-3" />
              {format(new Date(job.postedDate), "MMM dd, yyyy")}
            </span>
          </div>
        </div>

        {/* Actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:border-gray-700">
            <DropdownMenuLabel className="dark:text-gray-300">Actions</DropdownMenuLabel>
            <DropdownMenuSeparator className="dark:bg-gray-700" />
            <DropdownMenuItem
              onClick={() => onEdit(job)}
              className="flex items-center gap-2 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <Edit className="w-4 h-4" />
              Edit Job
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onToggleStatus(job.id, job.isActive)}
              disabled={updating === job.id}
              className="flex items-center gap-2 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {job.isActive ? (
                <ToggleLeft className="w-4 h-4" />
              ) : (
                <ToggleRight className="w-4 h-4" />
              )}
              {updating === job.id
                ? "Updating..."
                : job.isActive
                  ? "Deactivate"
                  : "Activate"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Body */}
      <div className="px-5 pb-4 flex-1 space-y-3">
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">
          {job.description}
        </p>

        {job.requirements && (
          <div>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
              Requirements
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
              {job.requirements}
            </p>
          </div>
        )}
      </div>

      {/* Applications section */}
      <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-800 pt-4 mt-auto">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            Applications
            <span className="ml-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold px-1.5 py-0.5 rounded-full">
              {job.applications.length}
            </span>
          </span>
        </div>

        {job.applications.length > 0 ? (
          <div className="space-y-2">
            {job.applications.slice(0, 3).map((application) => (
              <div
                key={application.id}
                className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                    {application.candidate.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {formatStatusText(application.status)}
                  </p>
                </div>
                <div
                  className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ml-2 ${getScoreColor(application.score)}`}
                >
                  {application.score}%
                </div>
              </div>
            ))}

            <Link href={`/hr/jobs/${job.id}/applications`}>
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-8 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 mt-1"
              >
                <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
                {job.applications.length > 3
                  ? `View All ${job.applications.length} Applications`
                  : `View ${job.applications.length} Application${job.applications.length > 1 ? "s" : ""}`}
              </Button>
            </Link>
          </div>
        ) : (
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-3">
            No applications yet
          </p>
        )}
      </div>
    </div>
  );
}
