import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download, Plus } from "lucide-react";

interface EmailTemplatesHeaderProps {
  totalTemplates: number;
  loading: boolean;
  onRefresh: () => void;
  onCreateDefaults: () => void;
  onCreateNew: () => void;
}

export function EmailTemplatesHeader({
  totalTemplates,
  loading,
  onRefresh,
  onCreateDefaults,
  onCreateNew,
}: EmailTemplatesHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Email Templates
        </h1>
        <p className="text-gray-600">
          Manage email templates for candidate communication
          {totalTemplates > 0 && ` • ${totalTemplates} templates`}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onCreateDefaults}
          disabled={loading}
        >
          <Download className="w-4 h-4 mr-2" />
          Create Defaults
        </Button>

        <Button
          className="flex items-center gap-2"
          onClick={onCreateNew}
          disabled={loading}
        >
          <Plus className="w-4 h-4" />
          New Template
        </Button>
      </div>
    </div>
  );
}
