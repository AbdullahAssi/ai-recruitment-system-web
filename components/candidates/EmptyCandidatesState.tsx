import React from "react";
import { FaUsers } from "react-icons/fa";

interface EmptyCandidatesStateProps {
  hasFilter: boolean;
}

export function EmptyCandidatesState({ hasFilter }: EmptyCandidatesStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-border bg-card">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <FaUsers className="w-7 h-7 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">
        {hasFilter ? "No Candidates Found" : "No Candidates Yet"}
      </h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        {hasFilter
          ? "No candidates match your filters. Try adjusting your search criteria."
          : "Candidates will appear here once they register and upload their resumes."}
      </p>
    </div>
  );
}
