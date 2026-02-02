import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Users } from "lucide-react";

interface CandidatesHeaderProps {
  totalCandidates: number;
  loading: boolean;
  onRefresh: () => void;
}

export function CandidatesHeader({
  totalCandidates,
  loading,
  onRefresh,
}: CandidatesHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-600" />
          Candidates Management
        </h1>
        <p className="text-gray-600 mt-1">
          Manage and review candidate profiles ({totalCandidates} total)
        </p>
      </div>
      <Button
        onClick={onRefresh}
        variant="outline"
        disabled={loading}
        className="flex items-center gap-2"
      >
        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        Refresh
      </Button>
    </div>
  );
}
