import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";

interface JobsHeaderProps {
  loading: boolean;
  onRefresh: () => void;
  onCreateNew: () => void;
}

export function JobsHeader({ loading, onRefresh, onCreateNew }: JobsHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Job Management
        </h1>
        <p className="text-gray-600">
          Manage job postings and view applications
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        
        <Button onClick={onCreateNew} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Post New Job
        </Button>
      </div>
    </div>
  );
}
