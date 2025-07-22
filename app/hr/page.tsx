"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  FileText,
  Search,
  TrendingUp,
  CheckCircle,
  XCircle,
  Briefcase,
} from "lucide-react";
import Link from "next/link";

interface JobData {
  id: string;
  title: string;
  description: string;
  location: string;
  requirements?: string;
}

interface MatchResult {
  overallScore: number;
  textSimilarity: number;
  skillMatchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  candidateSkills: string[];
  jobRequiredSkills: string[];
}

interface CandidateInfo {
  id: string;
  name: string;
  email: string;
  experience: number;
}

export default function HRPage() {
  const [jobData, setJobData] = useState({
    title: "",
    description: "",
    location: "",
  });
  const [candidateId, setCandidateId] = useState("");
  const [job, setJob] = useState<JobData | null>(null);
  const { toast } = useToast();
  const [matchResult, setMatchResult] = useState<{
    matchResult: MatchResult;
    candidate: CandidateInfo;
    job: JobData;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [matchLoading, setMatchLoading] = useState(false);

  const handleJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !jobData.title.trim() ||
      !jobData.description.trim() ||
      !jobData.location.trim()
    ) {
      toast({
        title: "Missing Information",
        description:
          "Please fill in all required fields (Title, Description, Location)",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/upload/jd", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jobData),
      });

      const data = await response.json();
      if (data.success) {
        setJob(data.job);
        setJobData({ title: "", description: "", location: "" });
        toast({
          title: "Job Created Successfully",
          description:
            "The job has been created and is ready for candidate matching",
        });
      } else {
        toast({
          title: "Job Creation Failed",
          description: data.error || "Failed to process job description",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error processing job description:", error);
      toast({
        title: "Job Creation Failed",
        description: "An unexpected error occurred while creating the job",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMatch = async () => {
    if (!job || !candidateId) {
      toast({
        title: "Missing Information",
        description: "Please create a job and enter a candidate ID first",
        variant: "destructive",
      });
      return;
    }

    setMatchLoading(true);
    try {
      const response = await fetch(
        `/api/match?candidateId=${candidateId}&jobId=${job.id}`
      );
      const data = await response.json();

      if (data.success) {
        setMatchResult(data);
        toast({
          title: "Match Analysis Complete",
          description:
            "The candidate-job match has been calculated successfully",
        });
      } else {
        toast({
          title: "Match Analysis Failed",
          description: data.error || "Failed to calculate match",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error calculating match:", error);
      toast({
        title: "Match Analysis Failed",
        description: "An unexpected error occurred while calculating the match",
        variant: "destructive",
      });
    } finally {
      setMatchLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Good Match";
    if (score >= 40) return "Fair Match";
    return "Poor Match";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">HR Portal</h1>
          <p className="text-gray-600">
            Create job descriptions and match with candidates
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Link href="/hr/jobs">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <Briefcase className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <CardTitle className="text-lg">Job Management</CardTitle>
                <p className="text-sm text-gray-600">
                  Create and manage job postings
                </p>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/hr/candidates">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <CardTitle className="text-lg">Candidates</CardTitle>
                <p className="text-sm text-gray-600">
                  View and manage candidate profiles
                </p>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/hr/analytics">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <CardTitle className="text-lg">Analytics</CardTitle>
                <p className="text-sm text-gray-600">
                  View hiring statistics and reports
                </p>
              </CardHeader>
            </Card>
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Job Description Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Create Job Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJobSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    value={jobData.title}
                    onChange={(e) =>
                      setJobData((prev) => ({ ...prev, title: e.target.value }))
                    }
                    required
                    placeholder="e.g., Senior React Developer"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={jobData.location}
                    onChange={(e) =>
                      setJobData((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    placeholder="e.g., Remote, New York, NY"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Job Description</Label>
                  <Textarea
                    id="description"
                    value={jobData.description}
                    onChange={(e) =>
                      setJobData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    required
                    placeholder="Enter the complete job description including requirements, responsibilities, and preferred skills..."
                    rows={8}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Processing..." : "Process Job Description"}
                </Button>
              </form>

              {job && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Job Created Successfully
                  </h3>
                  <div className="bg-green-50 p-3 rounded-lg space-y-1 mb-4">
                    <p>
                      <strong>Title:</strong> {job.title}
                    </p>
                    <p>
                      <strong>Location:</strong> {job.location}
                    </p>
                    <p>
                      <strong>Job ID:</strong>{" "}
                      <code className="text-green-800">{job.id}</code>
                    </p>
                  </div>

                  {job.requirements && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Requirements
                      </h4>
                      <p className="text-gray-700 text-sm">
                        {job.requirements}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Candidate Matching */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Match with Candidate
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!job ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Please create a job description first</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label
                      htmlFor="candidateId"
                      className="flex items-center gap-2"
                    >
                      <Search className="w-4 h-4" />
                      Candidate ID
                    </Label>
                    <Input
                      id="candidateId"
                      value={candidateId}
                      onChange={(e) => setCandidateId(e.target.value)}
                      placeholder="Enter candidate ID to match"
                    />
                  </div>

                  <Button
                    onClick={handleMatch}
                    className="w-full"
                    disabled={!candidateId || matchLoading}
                  >
                    {matchLoading
                      ? "Calculating Match..."
                      : "Calculate Match Score"}
                  </Button>

                  {matchResult && (
                    <div className="mt-6 space-y-4">
                      <Separator />

                      {/* Overall Score */}
                      <div className="text-center">
                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center justify-center gap-2">
                          <TrendingUp className="w-5 h-5" />
                          Match Results
                        </h3>
                        <div
                          className={`text-3xl font-bold ${getScoreColor(
                            matchResult.matchResult.overallScore
                          )}`}
                        >
                          {matchResult.matchResult.overallScore}%
                        </div>
                        <p className="text-gray-600">
                          {getScoreLabel(matchResult.matchResult.overallScore)}
                        </p>
                      </div>

                      {/* Candidate Info */}
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <h4 className="font-semibold mb-1">
                          Candidate Details
                        </h4>
                        <p>
                          <strong>Name:</strong> {matchResult.candidate.name}
                        </p>
                        <p>
                          <strong>Email:</strong> {matchResult.candidate.email}
                        </p>
                        <p>
                          <strong>Experience:</strong>{" "}
                          {matchResult.candidate.experience} years
                        </p>
                      </div>

                      {/* Detailed Scores */}
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">
                              Text Similarity
                            </span>
                            <span className="text-sm">
                              {matchResult.matchResult.textSimilarity}%
                            </span>
                          </div>
                          <Progress
                            value={matchResult.matchResult.textSimilarity}
                            className="h-2"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">
                              Skill Match
                            </span>
                            <span className="text-sm">
                              {matchResult.matchResult.skillMatchPercentage.toFixed(
                                1
                              )}
                              %
                            </span>
                          </div>
                          <Progress
                            value={matchResult.matchResult.skillMatchPercentage}
                            className="h-2"
                          />
                        </div>
                      </div>

                      {/* Skills Analysis */}
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Matched Skills (
                            {matchResult.matchResult.matchedSkills.length})
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {matchResult.matchResult.matchedSkills.map(
                              (skill, index) => (
                                <Badge
                                  key={index}
                                  className="bg-green-100 text-green-800 text-xs"
                                >
                                  {skill}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                            <XCircle className="w-4 h-4" />
                            Missing Skills (
                            {matchResult.matchResult.missingSkills.length})
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {matchResult.matchResult.missingSkills.map(
                              (skill, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="border-red-200 text-red-800 text-xs"
                                >
                                  {skill}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
