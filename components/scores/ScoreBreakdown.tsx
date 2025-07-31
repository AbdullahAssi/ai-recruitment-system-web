import React from "react";

interface ScoreBreakdownProps {
  explanation: any;
  className?: string;
}

export function ScoreBreakdown({
  explanation,
  className = "",
}: ScoreBreakdownProps) {
  if (!explanation || typeof explanation !== "object") return null;

  // Use scores object if available, otherwise fall back to direct properties
  const scores = explanation.scores || explanation;

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 ${className}`}>
      {scores.skills !== undefined && (
        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">
            {scores.skills}
          </div>
          <div className="text-xs text-blue-700">Skills</div>
        </div>
      )}
      {scores.experience !== undefined && (
        <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="text-2xl font-bold text-purple-600">
            {scores.experience}
          </div>
          <div className="text-xs text-purple-700">Experience</div>
        </div>
      )}
      {scores.education !== undefined && (
        <div className="text-center p-3 bg-indigo-50 rounded-lg border border-indigo-200">
          <div className="text-2xl font-bold text-indigo-600">
            {scores.education}
          </div>
          <div className="text-xs text-indigo-700">Education</div>
        </div>
      )}
      {scores.fit !== undefined && (
        <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-200">
          <div className="text-2xl font-bold text-emerald-600">
            {scores.fit}
          </div>
          <div className="text-xs text-emerald-700">Overall Fit</div>
        </div>
      )}
    </div>
  );
}
