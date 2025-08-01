import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";

interface ProfileHeaderProps {
  onBack: () => void;
  onDownloadResume?: () => void;
  hasResume: boolean;
}

export function ProfileHeader({
  onBack,
  onDownloadResume,
  hasResume,
}: ProfileHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <Button variant="outline" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Candidates
      </Button>

      <div className="flex gap-2">
        {hasResume && onDownloadResume && (
          <Button onClick={onDownloadResume} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download Resume
          </Button>
        )}
      </div>
    </div>
  );
}
