import React from "react";
import { Button } from "@/components/ui/button";
import { FaArrowLeft, FaDownload } from "react-icons/fa";

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
        <FaArrowLeft className="w-4 h-4 mr-2" />
        Back to Candidates
      </Button>

      <div className="flex gap-2">
        {hasResume && onDownloadResume && (
          <Button onClick={onDownloadResume} variant="outline">
            <FaDownload className="w-4 h-4 mr-2" />
            Download Resume
          </Button>
        )}
      </div>
    </div>
  );
}
