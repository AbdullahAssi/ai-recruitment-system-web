import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Eye,
  MoreHorizontal,
  Edit,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Job } from "../../hooks/useJobs";
import { getScoreColor, getStatusBadgeColor } from "../../lib/jobUtils";
import { formatStatusText } from "../../lib/applicationUtil";

interface JobCardProps {
  job: Job;
  updating: string | null;
  onEdit: (job: Job) => void;
  onToggleStatus: (jobId: string, currentStatus: boolean) => void;
}

export function JobCard({
  job,
  updating,
  onEdit,
  onToggleStatus,
}: JobCardProps) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl flex items-center gap-2">
              {job.title}
              <Badge
                variant={job.isActive ? "default" : "secondary"}
                className={getStatusBadgeColor(job.isActive)}
              >
                {job.isActive ? "Active" : "Inactive"}
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {job.location || "Remote"}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(job.postedDate), "MMM dd, yyyy")}
              </div>
            </div>
          </div>

          {/* Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onEdit(job)}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Job
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onToggleStatus(job.id, job.isActive)}
                disabled={updating === job.id}
                className="flex items-center gap-2"
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
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <p className="text-gray-700 text-sm line-clamp-3">
            {job.description}
          </p>
        </div>

        {job.requirements && (
          <div>
            <h4 className="font-semibold text-sm mb-2">Requirements</h4>
            <p className="text-gray-600 text-xs line-clamp-2">
              {job.requirements}
            </p>
          </div>
        )}

        {/* Applications Summary */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Users className="w-4 h-4" />
              Applications ({job.applications.length})
            </h4>
          </div>

          {job.applications.length > 0 ? (
            <div className="space-y-2">
              {job.applications.slice(0, 3).map((application) => (
                <div
                  key={application.id}
                  className="flex items-center justify-between bg-gray-50 p-2 rounded"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {application.candidate.name}
                    </p>
                    <p className="text-xs text-gray-600">
                      {application.candidate.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-sm font-bold px-2 py-1 rounded ${getScoreColor(
                        application.score,
                      )}`}
                    >
                      {application.score}%
                    </div>
                    <p className="text-xs text-gray-600">
                      {formatStatusText(application.status)}
                    </p>
                  </div>
                </div>
              ))}

              {job.applications.length > 0 && (
                <div className="text-center">
                  <Link href={`/hr/jobs/${job.id}/applications`}>
                    <Button variant="outline" size="sm" className="text-xs">
                      <Eye className="w-3 h-3 mr-1" />
                      {job.applications.length > 3
                        ? `View All ${job.applications.length} Applications`
                        : `View ${job.applications.length} Application${
                            job.applications.length > 1 ? "s" : ""
                          }`}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-4">
              No applications yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
