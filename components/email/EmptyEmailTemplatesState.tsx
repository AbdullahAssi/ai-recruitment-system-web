import React from "react";
import { Button } from "@/components/ui/button";
import { Mail, Plus, Download } from "lucide-react";

interface EmptyEmailTemplatesStateProps {
  onCreateNew: () => void;
  onCreateDefaults: () => void;
}

export function EmptyEmailTemplatesState({
  onCreateNew,
  onCreateDefaults,
}: EmptyEmailTemplatesStateProps) {
  return (
    <div className="text-center py-12">
      <Mail className="w-16 h-16 mx-auto text-gray-400 mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No Email Templates
      </h3>
      <p className="text-gray-600 mb-4">
        Create your first email template or load the default templates
      </p>
      <div className="flex justify-center gap-4">
        <Button onClick={onCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
        <Button variant="outline" onClick={onCreateDefaults}>
          <Download className="w-4 h-4 mr-2" />
          Load Defaults
        </Button>
      </div>
    </div>
  );
}
