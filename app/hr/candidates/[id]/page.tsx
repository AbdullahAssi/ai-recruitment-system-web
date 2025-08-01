"use client";


import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Import modular components and hooks
import {
  ProfileHeader,
  ProfileInfoCard,
  SkillsAndSummary,
  WorkExperienceCard,
  ProjectsCard,
  SidebarCards,
} from "../../../../components/candidates";
import { useCandidateProfile } from "../../../../hooks/hooks";
import { createDownloadHandler } from "../../../../lib/resumeDownload";

// interface CandidateProfile {
//   id: string;
//   name: string;
//   email: string;
//   experience: number;
//   createdAt: string;
//   resumes: {
//     id: string;
//     fileName: string;
//     filePath: string;
//     uploadDate: string;
//     extractedText: string;
//     name?: string;
//     email?: string;
//     phone?: string;
//     linkedin?: string;
//     github?: string;
//     skills_json?: string;
//     experience_json?: string;
//     projects_json?: string;
//     certifications_json?: string;
//     education_level?: string;
//     experience_years?: number;
//     summary?: string;
//   }[];
//   applications: {
//     id: string;
//     score: number;
//     status: string;
//     appliedAt: string;
//     job: {
//       id: string;
//       title: string;
//       location: string;
//       company: string;
//     };
//   }[];
// }

export default function CandidateProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const candidateId = params.id as string;

  // Use the custom hook for candidate profile data
  const { candidate, loading, fetchCandidateProfile } =
    useCandidateProfile(candidateId);

  // Centralized download handler
  const downloadResume = useMemo(() => createDownloadHandler(toast), [toast]);

  // Local state for download loading indicator
  const [downloadingResume, setDownloadingResume] = useState<string | null>(
    null
  );

  // Enhanced download handler with loading state
  const handleDownloadResume = useCallback(
    async (resumeId: string, fileName: string) => {
      setDownloadingResume(resumeId);
      try {
        await downloadResume(resumeId, fileName);
      } finally {
        setDownloadingResume(null);
      }
    },
    [downloadResume]
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading candidate profile...</p>
        </div>
      </div>
    );
  }

  // Error or candidate not found
  if (!candidate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Candidate Not Found
          </h3>
          <p className="text-gray-600 mb-4">
            The requested candidate profile could not be found.
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Get the most recent resume with extracted data
  const latestResume =
    candidate.resumes.find((resume) => resume.skills_json || resume.name) ||
    candidate.resumes[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100">
      <div className="max-w-6xl mx-auto p-6">
        {/* Profile Header */}
        <ProfileHeader
          onBack={() => router.back()}
          onDownloadResume={
            latestResume
              ? () =>
                  handleDownloadResume(latestResume.id, latestResume.fileName)
              : undefined
          }
          hasResume={!!latestResume}
        />

        {/* Profile Info Card */}
        <ProfileInfoCard candidate={candidate} latestResume={latestResume} />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Professional Summary and Skills */}
            <SkillsAndSummary latestResume={latestResume} />

            {/* Work Experience */}
            <WorkExperienceCard latestResume={latestResume} />

            {/* Projects */}
            <ProjectsCard latestResume={latestResume} />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <SidebarCards
              candidate={candidate}
              latestResume={latestResume}
              onDownloadResume={handleDownloadResume}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
