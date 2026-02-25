import React from "react";
import { Button } from "@/components/ui/button";
import { FaBriefcase } from "react-icons/fa";
import { Plus } from "lucide-react";

interface EmptyJobsStateProps {
  hasJobs?: boolean;
  onCreateNew?: () => void;
}

export function EmptyJobsState({
  hasJobs = false,
  onCreateNew,
}: EmptyJobsStateProps) {
  const isFiltered = hasJobs; // jobs exist but none match current filters

  return (
    <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-center py-16 px-6">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
          <FaBriefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            {isFiltered ? "No jobs match your filters" : "No job postings yet"}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
            {isFiltered
              ? "Try adjusting your search or filter criteria to find what you're looking for."
              : "Get started by creating your first job posting to attract qualified candidates."}
          </p>
        </div>

        {!isFiltered && onCreateNew && (
          <Button
            onClick={onCreateNew}
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Post First Job
          </Button>
        )}
      </div>
    </div>
  );
}
