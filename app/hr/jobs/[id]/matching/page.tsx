"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { FeedbackDialog } from "@/components/hr/FeedbackDialog";
import { LoadingState } from "@/components/reusables";

interface MatchResult {
  candidate_id: string;
  candidate_name: string;
  match_score: number;
  ranking: number;
  scores: {
    semantic_similarity: number;
    skills_overlap: number;
    experience_match: number;
    education_match: number;
  };
  highlights: string[];
  gaps: string[];
}

export default function JobMatchingPage() {
  const params = useParams();
  const jobId = params.id as string;

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [jobId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch Job Details
      const jobRes = await fetch(`/api/jobs/${jobId}`);
      if (!jobRes.ok) throw new Error("Failed to fetch job details");
      const jobData = await jobRes.json();
      setJob(jobData);

      // Fetch Candidates
      const candRes = await fetch("/api/candidates?limit=100");
      if (!candRes.ok) throw new Error("Failed to fetch candidates");
      const candData = await candRes.json();
      setCandidates(candData.candidates || candData);
    } catch (error: any) {
      console.error(error);
      toast.error("Error loading data");
    } finally {
      setLoading(false);
    }
  };

  const runMatching = async () => {
    if (!job || candidates.length === 0) return;

    setMatching(true);
    setResults([]);

    try {
      const payload = {
        job_description:
          job.description + "\n\nRequirements:\n" + (job.requirements || ""),
        candidates: candidates,
        top_k: 20,
        min_score: 0.3,
      };

      const res = await fetch("/api/fastapi/matching/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Matching failed");

      const data = await res.json();
      if (data.success) {
        setResults(data.matches);
        toast.success(`Found ${data.matches_found} matches!`);
      } else {
        toast.error("Matching returned no success");
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Matching failed: " + error.message);
    } finally {
      setMatching(false);
    }
  };

  if (loading) {
    return <LoadingState variant="page" message="Loading matching data..." />;
  }

  if (!job) {
    return <div className="text-center py-10">Job not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Button variant="ghost" className="mb-2 pl-0" asChild>
            <Link href="/hr/jobs">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Jobs
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <span className="font-medium">{job.company || "Company"}</span> •{" "}
            {job.location || "Remote"}
          </p>
        </div>
        <Button
          size="lg"
          onClick={runMatching}
          disabled={matching || candidates.length === 0}
          className="bg-gradient-to-r from-blue-600 to-blue-300 shadow-lg"
        >
          {matching ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Matching...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" /> Find Candidates
            </>
          )}
        </Button>
      </div>

      {!matching && results.length === 0 && (
        <Card className="bg-slate-50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Sparkles className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium">Ready to Match</h3>
            <p className="text-muted-foreground max-w-md mt-2">
              We found {candidates.length} candidates in the database. Click
              "Find Candidates" to rank them against this job description using
              AI.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Results List */}
      <div className="space-y-6">
        {results.map((match) => (
          <Card
            key={match.candidate_id}
            className="overflow-hidden  hover:shadow-md transition-shadow"
          >
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Score Section */}
                <div className="flex-shrink-0 flex flex-col items-center justify-center min-w-[120px] space-y-2">
                  <div className="relative flex items-center justify-center">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-gray-100"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - 251.2 * match.match_score}
                        className={`${match.match_score > 0.7 ? "text-green-500" : match.match_score > 0.5 ? "text-yellow-500" : "text-red-500"} transition-all duration-1000 ease-out`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-2xl font-bold">
                      {Math.round(match.match_score * 100)}%
                    </span>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Match Score
                  </span>
                </div>

                {/* Info Section */}
                <div className="flex-grow space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold">
                        {match.candidate_name}
                      </h3>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          Skills:{" "}
                          {Math.round(match.scores.skills_overlap * 100)}%
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Exp: {Math.round(match.scores.experience_match * 100)}
                          %
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Semantic:{" "}
                          {Math.round(match.scores.semantic_similarity * 100)}%
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <FeedbackDialog
                        candidateId={match.candidate_id}
                        jobId={jobId}
                        currentScore={match.match_score}
                        candidateName={match.candidate_name}
                      />
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/hr/candidates/${match.candidate_id}`}>
                          View Profile
                        </Link>
                      </Button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-semibold text-green-700 flex items-center mb-1">
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Highlights
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {match.highlights.slice(0, 3).map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-amber-700 flex items-center mb-1">
                        <AlertCircle className="w-4 h-4 mr-1" /> Gaps / Notes
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {match.gaps.length > 0 ? (
                          match.gaps
                            .slice(0, 3)
                            .map((g, i) => <li key={i}>{g}</li>)
                        ) : (
                          <li>No significant gaps identified.</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
