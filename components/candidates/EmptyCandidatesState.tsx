import React from "react";
import { Users } from "lucide-react";

interface EmptyCandidatesStateProps {
  hasFilter: boolean;
}

export function EmptyCandidatesState({ hasFilter }: EmptyCandidatesStateProps) {
  return (
    <div className="text-center py-12">
      <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {hasFilter ? "No Candidates Found" : "No Candidates Yet"}
      </h3>
      <p className="text-gray-600">
        {hasFilter
          ? "No candidates match your current filters. Try adjusting your search criteria."
          : "No candidates have been added to the system yet. Candidates will appear here once they upload their resumes."}
      </p>
    </div>
  );
}
