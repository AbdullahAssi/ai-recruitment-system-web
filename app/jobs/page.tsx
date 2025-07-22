"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  Calendar,
  Briefcase,
  User,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  requirements: string;
  postedDate: string;
  applications: Array<{
    candidate: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

interface ApplicationResult {
  application: {
    id: string;
    score: number;
    status: string;
    appliedAt: string;
  };
  matchDetails: {
    overallScore: number;
    textSimilarity: number;
    skillMatchPercentage: number;
    matchedSkills: string[];
    missingSkills: string[];
  };
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidateId, setCandidateId] = useState("");
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [applicationResult, setApplicationResult] =
    useState<ApplicationResult | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/jobs");
      const data = await response.json();
      if (data.success) {
        setJobs(data.jobs);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId: string) => {
    if (!candidateId.trim()) {
      alert("Please enter your Candidate ID");
      return;
    }

    setApplying(jobId);
    try {
      const response = await fetch(`/api/jobs/${jobId}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ candidateId: candidateId.trim() }),
      });

      const data = await response.json();
      if (data.success) {
        setApplicationResult(data);
        setSelectedJob(jobs.find((job) => job.id === jobId) || null);
        // Refresh jobs to update application count
        fetchJobs();
      } else {
        alert(data.error || "Failed to apply");
      }
    } catch (error) {
      console.error("Error applying to job:", error);
      alert("Failed to apply to job");
    } finally {
      setApplying(null);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Available Jobs
          </h1>
          <p className="text-gray-600">Browse and apply to open positions</p>
        </div>

        {/* Candidate ID Input */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Enter Your Candidate ID
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="candidateId">Candidate ID</Label>
                <Input
                  id="candidateId"
                  value={candidateId}
                  onChange={(e) => setCandidateId(e.target.value)}
                  placeholder="Enter your candidate ID to apply for jobs"
                />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Don't have a candidate ID?{" "}
              <a href="/candidate" className="text-blue-600 hover:underline">
                Upload your resume first
              </a>
            </p>
          </CardContent>
        </Card>

        {/* Jobs Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <Card
              key={job.id}
              className="shadow-lg hover:shadow-xl transition-shadow"
            >
              <CardHeader>
                <CardTitle className="text-lg">{job.title}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {job.location || "Remote"}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(job.postedDate), "MMM dd, yyyy")}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-gray-700 text-sm line-clamp-3">
                    {job.description}
                  </p>
                </div>

                {job.requirements && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Requirements</h4>
                    <p className="text-gray-600 text-xs line-clamp-2">
                      {job.requirements}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Briefcase className="w-4 h-4" />
                    {job.applications.length} applicants
                  </div>

                  <Button
                    onClick={() => handleApply(job.id)}
                    disabled={!candidateId.trim() || applying === job.id}
                    size="sm"
                  >
                    {applying === job.id ? "Applying..." : "Apply Now"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {jobs.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Jobs Available
            </h3>
            <p className="text-gray-600">
              Check back later for new opportunities
            </p>
          </div>
        )}

        {/* Application Result Dialog */}
        {applicationResult && selectedJob && (
          <Dialog
            open={!!applicationResult}
            onOpenChange={() => setApplicationResult(null)}
          >
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Application Submitted Successfully
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Job Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">
                    Applied to: {selectedJob.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedJob.location}
                  </p>
                </div>

                {/* Match Score */}
                <div className="text-center">
                  <div
                    className={`text-4xl font-bold ${getScoreColor(
                      applicationResult.matchDetails.overallScore
                    )}`}
                  >
                    {applicationResult.matchDetails.overallScore}%
                  </div>
                  <p className="text-gray-600">
                    {getScoreLabel(applicationResult.matchDetails.overallScore)}
                  </p>
                </div>

                {/* Detailed Scores */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-1">
                      Text Similarity
                    </h4>
                    <div className="text-2xl font-bold text-blue-600">
                      {applicationResult.matchDetails.textSimilarity}%
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-1">
                      Skill Match
                    </h4>
                    <div className="text-2xl font-bold text-green-600">
                      {applicationResult.matchDetails.skillMatchPercentage.toFixed(
                        1
                      )}
                      %
                    </div>
                  </div>
                </div>

                {/* Skills Analysis */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Matched Skills (
                      {applicationResult.matchDetails.matchedSkills.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {applicationResult.matchDetails.matchedSkills.map(
                        (skill, index) => (
                          <Badge
                            key={index}
                            className="bg-green-100 text-green-800"
                          >
                            {skill}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>

                  {applicationResult.matchDetails.missingSkills.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Skills to Improve (
                        {applicationResult.matchDetails.missingSkills.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {applicationResult.matchDetails.missingSkills.map(
                          (skill, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="border-red-200 text-red-800"
                            >
                              {skill}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Application ID:</strong>{" "}
                    {applicationResult.application.id}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    Your application has been submitted and is under review.
                    You'll be contacted if selected for the next round.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
