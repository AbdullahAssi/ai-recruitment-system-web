"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PrimaryResumeUpload } from "@/components/reusables/PrimaryResumeUpload";
import {
  CandidateProfileCard,
  ResumeListCard,
  EditProfileDialog,
  ProfileStatsCard,
} from "@/components/candidates";
import { FaUpload } from "react-icons/fa";

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
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }

  const activeApplications = candidateData.applications.filter(
    (app) => !["REJECTED", "WITHDRAWN"].includes(app.status),
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-2">
          Manage your professional profile and documents
        </p>
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
            className="w-full bg-purple-600 hover:bg-purple-700"
            aria-label="Upload new resume"
          >
            <FaUpload className="w-4 h-4 mr-2" />
            Upload New Resume
          </Button>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Tips</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Keep your profile updated</li>
              <li>• Upload a recent resume</li>
              <li>• Add social links for better visibility</li>
              <li>• Write a clear and concise bio</li>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
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
              className="w-full mt-4"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
