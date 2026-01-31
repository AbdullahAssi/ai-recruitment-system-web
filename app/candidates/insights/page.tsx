"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ArrowLeft, Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// Components
import { ProfileInfoCard } from "@/components/candidates/ProfileInfoCard";
import { SkillsAndSummary } from "@/components/candidates/SkillsAndSummary";
import { WorkExperienceCard } from "@/components/candidates/WorkExperienceCard";
import { ProjectsCard } from "@/components/candidates/ProjectsCard";

// Types
import { CandidateResume, CandidateProfile } from "@/hooks/useCandidates";

export default function InsightsPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resumeData, setResumeData] = useState<CandidateResume | null>(null);
  const [candidateProfile, setCandidateProfile] =
    useState<CandidateProfile | null>(null);
  const [searched, setSearched] = useState(false);

  const fetchInsights = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setSearched(true);
    setResumeData(null);

    try {
      const res = await fetch(
        `/api/v1/resumes/latest/${encodeURIComponent(email)}`,
      );

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("No resume found for this email.");
        }
        throw new Error("Failed to fetch resume data.");
      }

      const data = await res.json();

      // Adapt the API response (ResumeData) to the Frontend Interface (CandidateResume)
      // The Components expect JSON strings for these fields
      const adaptedResume: CandidateResume = {
        id: "latest", // Placeholder
        fileName: "latest_resume.pdf",
        filePath: "",
        uploadDate: new Date().toISOString(),
        extractedText: "", // Not needed for display components
        name: data.name,
        email: data.email,
        phone: data.phone,
        linkedin: data.linkedin,
        github: data.github,
        education_level: data.education_level,
        experience_years: data.experience_years,
        summary: data.summary,
        // Convert arrays back to JSON strings for compatibility with existing components
        skills_json: JSON.stringify(data.skills || []),
        experience_json: JSON.stringify(data.work_experience || []),
        projects_json: JSON.stringify(data.projects || []),
        certifications_json: JSON.stringify(data.certifications || []),
      };

      setResumeData(adaptedResume);

      // Create a dummy candidate profile wrapper for ProfileInfoCard
      const dummyCandidate: CandidateProfile = {
        id: "temp",
        name: data.name || "Candidate",
        email: data.email || email,
        experience: data.experience_years || 0,
        createdAt: new Date().toISOString(),
        resumes: [adaptedResume],
        applications: [], // Empty for now
      };
      setCandidateProfile(dummyCandidate);

      toast.success("Resume insights loaded!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Could not load insights");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-6xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link href="/candidates/dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Resume Insights</h1>
        <p className="text-muted-foreground">
          View the detailed analysis extracted from your resume.
        </p>
      </div>

      {/* Search Section */}
      <Card className="max-w-xl mx-auto border-purple-100 bg-purple-50/50">
        <CardHeader>
          <CardTitle>Load Your Profile</CardTitle>
          <CardDescription>
            Enter your email to retrieve your latest processed resume.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={fetchInsights} className="flex gap-2">
            <Input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results Section */}
      {searched && !loading && !resumeData && (
        <div className="text-center py-10 text-gray-500">
          No resume found. Please upload one in the Dashboard.
          <div className="mt-4">
            <Button variant="outline" asChild>
              <Link href="/candidates/dashboard">Go to Upload</Link>
            </Button>
          </div>
        </div>
      )}

      {resumeData && candidateProfile && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <ProfileInfoCard
            candidate={candidateProfile}
            latestResume={resumeData}
          />

          <div className="grid md:grid-cols-2 gap-6">
            <SkillsAndSummary latestResume={resumeData} />
            <div className="space-y-6">
              <WorkExperienceCard latestResume={resumeData} />
              <ProjectsCard latestResume={resumeData} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
