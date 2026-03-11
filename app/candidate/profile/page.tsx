"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PrimaryResumeUpload } from "@/components/reusables/PrimaryResumeUpload";
import { LoadingState } from "@/components/reusables";
import {
  CandidateProfileCard,
  ResumeListCard,
  EditProfileDialog,
  ProfileStatsCard,
} from "@/components/candidates";
import { FaUpload, FaLightbulb, FaTimes } from "react-icons/fa";

interface Resume {
  id: string;
  fileName: string;
  uploadDate: string;
}

interface CandidateData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  experience?: number;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  primaryResumeId?: string | null;
  resumes: Resume[];
  applications: any[];
}

export default function CandidateProfilePage() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [candidateData, setCandidateData] = useState<CandidateData | null>(
    null,
  );
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    location: "",
    bio: "",
    experience: 0,
    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: "",
  });

  useEffect(() => {
    if (user?.candidate?.id) {
      fetchCandidateData();
    }
  }, [user]);

  const fetchCandidateData = async () => {
    if (!user?.candidate?.id) return;

    try {
      const response = await fetch(`/api/candidates/${user.candidate.id}`);
      const data = await response.json();

      if (data.success) {
        setCandidateData(data.candidate);
        // Update form data
        setFormData({
          name: data.candidate.name || "",
          phone: data.candidate.phone || "",
          location: data.candidate.location || "",
          bio: data.candidate.bio || "",
          experience: data.candidate.experience || 0,
          linkedinUrl: data.candidate.linkedinUrl || "",
          githubUrl: data.candidate.githubUrl || "",
          portfolioUrl: data.candidate.portfolioUrl || "",
        });
      }
    } catch (error) {
      console.error("Error fetching candidate data:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.candidate?.id) {
      toast({
        title: "Error",
        description: "User profile not found",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/candidates/${user.candidate.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: user.email,
          experience: parseInt(formData.experience.toString()),
          location: formData.location,
          bio: formData.bio,
          linkedinUrl: formData.linkedinUrl,
          githubUrl: formData.githubUrl,
          portfolioUrl: formData.portfolioUrl,
          phone: formData.phone,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
        await refreshUser();
        await fetchCandidateData();
        setEditDialogOpen(false);
      } else {
        throw new Error(data.error || "Failed to update profile");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadResume = async (resumeId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/resumes/${resumeId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "Success",
          description: "Resume downloaded successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download resume",
        variant: "destructive",
      });
    }
  };

  if (!candidateData) {
    return <LoadingState variant="page" message="Loading profile..." />;
  }

  const activeApplications = candidateData.applications.filter(
    (app) => !["REJECTED", "WITHDRAWN"].includes(app.status),
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your professional profile and documents
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          <Button
            onClick={() => setUploadDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
            aria-label="Upload new resume"
          >
            <FaUpload className="w-4 h-4 mr-2" />
            Upload Resume
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <ProfileStatsCard
        totalApplications={candidateData.applications.length}
        activeApplications={activeApplications}
        totalResumes={candidateData.resumes.length}
      />

      {/* Profile Information Card */}
      <CandidateProfileCard
        name={candidateData.name}
        email={candidateData.email}
        phone={candidateData.phone}
        location={candidateData.location}
        experience={candidateData.experience}
        bio={candidateData.bio}
        linkedinUrl={candidateData.linkedinUrl}
        githubUrl={candidateData.githubUrl}
        portfolioUrl={candidateData.portfolioUrl}
        avatarUrl={user?.avatarUrl}
        onAvatarChange={() => refreshUser()}
        onAvatarDelete={() => refreshUser()}
        onEditClick={() => setEditDialogOpen(true)}
      />

      {/* Resumes Section */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <ResumeListCard
            resumes={candidateData.resumes}
            primaryResumeId={candidateData.primaryResumeId}
            onDownload={handleDownloadResume}
          />
        </div>
        <div className="space-y-4">
          <Button
            onClick={() => setUploadDialogOpen(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
            aria-label="Upload new resume"
          >
            <FaUpload className="w-4 h-4 mr-2" />
            Upload New Resume
          </Button>

          {/* Tips Card */}
          <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40">
                <FaLightbulb className="text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-200">
                Profile Tips
              </h3>
            </div>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 shrink-0" />
                Keep your profile updated regularly
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 shrink-0" />
                Upload a recent, tailored resume
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 shrink-0" />
                Add LinkedIn & GitHub for visibility
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 shrink-0" />
                Write a clear and concise bio
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <EditProfileDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        formData={formData}
        onFormDataChange={(data) =>
          setFormData((prev) => ({ ...prev, ...data }))
        }
        onSubmit={handleSubmit}
        loading={loading}
      />

      {/* Upload Resume Dialog */}
      {uploadDialogOpen && user?.candidate?.id && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-2xl w-full mx-auto">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <FaUpload className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Upload Resume
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PDF format recommended
                  </p>
                </div>
              </div>
              <button
                onClick={() => setUploadDialogOpen(false)}
                className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Close dialog"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-6">
              <PrimaryResumeUpload
                candidateId={user.candidate.id}
                userName={candidateData.name}
                userEmail={candidateData.email}
                experience={candidateData.experience || 0}
                primaryResume={
                  candidateData.resumes.find(
                    (r) => r.id === candidateData.primaryResumeId,
                  ) || null
                }
                onUploadSuccess={() => {
                  fetchCandidateData();
                  refreshUser();
                  setUploadDialogOpen(false);
                  toast({
                    title: "Success",
                    description: "Resume uploaded successfully",
                  });
                }}
              />
              <Button
                variant="outline"
                onClick={() => setUploadDialogOpen(false)}
                className="w-full mt-4 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
