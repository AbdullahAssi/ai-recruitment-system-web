import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { FaUsers } from "react-icons/fa";

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
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
          <FaUsers className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Candidates</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage and review candidate profiles &mdash; {totalCandidates} total
          </p>
        </div>
      </div>
      <Button
        onClick={onRefresh}
        variant="outline"
        size="sm"
        disabled={loading}
        className="h-9 border-border text-foreground hover:bg-muted"
      >
        <RefreshCw
          className={`w-3.5 h-3.5 mr-2 ${loading ? "animate-spin" : ""}`}
        />
        Refresh
      </Button>
    </div>
  );
}
