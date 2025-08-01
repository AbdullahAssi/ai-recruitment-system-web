import React from "react";
import { Button } from "@/components/ui/button";
import { Briefcase, Plus } from "lucide-react";

interface EmptyJobsStateProps {
  hasJobs: boolean;
  onCreateNew: () => void;
}

export function EmptyJobsState({ hasJobs, onCreateNew }: EmptyJobsStateProps) {
  return (
    <div className="text-center py-12">
      <Briefcase className="w-16 h-16 mx-auto text-gray-400 mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {!hasJobs ? "No Jobs Posted" : "No Jobs Match Your Filters"}
      </h3>
      <p className="text-gray-600 mb-4">
        {!hasJobs
          ? "Start by creating your first job posting"
          : "Try adjusting your search criteria or filters"}
      </p>
      {!hasJobs && (
        <Button onClick={onCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          Post Your First Job
        </Button>
      )}
    </div>
  );
}
