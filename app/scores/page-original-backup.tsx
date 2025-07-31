"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Star,
  User,
  Briefcase,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Building,
  Eye,
  TrendingUp,
  TrendingDown,
  Brain,
  Target,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search,
} from "lucide-react";
import { Console } from "node:console";

interface ScoringData {
  id: string;
  score: number;
  scoredAt: string;
  explanation: any;
  skillsMatch: any;
  requirements: any;
  candidate: {
    name: string;
    filename: string;
    email: string;
    phone: string;
    skills: string[];
    experience: any[];
  } | null;
  job: {
    title: string;
    description: string;
    requirements: string;
    location: string;
    company: string;
  } | null;
  application: {
    id: string;
    appliedAt: string;
  } | null;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ScoresDashboard() {
  const [scores, setScores] = useState<ScoringData[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    applicationId: "",
    jobId: "",
    resumeId: "",
    candidateName: "",
    jobTitle: "",
    minScore: "",
    maxScore: "",
    recommendation: "",
    dateFrom: "",
    dateTo: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(
    null
  );

  const fetchScores = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.applicationId && { applicationId: filters.applicationId }),
        ...(filters.jobId && { jobId: filters.jobId }),
        ...(filters.resumeId && { resumeId: filters.resumeId }),
      });

      const response = await fetch(`/api/ai/scores?${params}`);
      const data = await response.json();

      console.log(data);

      if (data.success) {
        // Apply client-side filtering for fields not supported by API
        let filteredScores = data.data;

        // Filter by candidate name
        if (filters.candidateName) {
          filteredScores = filteredScores.filter((score: ScoringData) =>
            score.candidate?.name
              ?.toLowerCase()
              .includes(filters.candidateName.toLowerCase())
          );
        }

        // Filter by job title
        if (filters.jobTitle) {
          filteredScores = filteredScores.filter((score: ScoringData) =>
            score.job?.title
              ?.toLowerCase()
              .includes(filters.jobTitle.toLowerCase())
          );
        }

        // Filter by score range
        if (filters.minScore) {
          const minScore = parseInt(filters.minScore);
          filteredScores = filteredScores.filter(
            (score: ScoringData) => (score.score || 0) >= minScore
          );
        }

        if (filters.maxScore) {
          const maxScore = parseInt(filters.maxScore);
          filteredScores = filteredScores.filter(
            (score: ScoringData) => (score.score || 0) <= maxScore
          );
        }

        // Filter by recommendation
        if (filters.recommendation) {
          filteredScores = filteredScores.filter(
            (score: ScoringData) =>
              score.explanation?.recommendation === filters.recommendation
          );
        }

        // Filter by date range
        if (filters.dateFrom) {
          const fromDate = new Date(filters.dateFrom);
          filteredScores = filteredScores.filter(
            (score: ScoringData) => new Date(score.scoredAt) >= fromDate
          );
        }

        if (filters.dateTo) {
          const toDate = new Date(filters.dateTo);
          toDate.setHours(23, 59, 59, 999); // Include the entire day
          filteredScores = filteredScores.filter(
            (score: ScoringData) => new Date(score.scoredAt) <= toDate
          );
        }

        setScores(filteredScores);
        setPagination({
          ...data.pagination,
          total: filteredScores.length,
          totalPages: Math.ceil(filteredScores.length / data.pagination.limit),
        });
      } else {
        console.error("Failed to fetch scores:", data.error);
      }
    } catch (error) {
      console.error("Error fetching scores:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
  }, [pagination.page, filters.applicationId, filters.jobId, filters.resumeId]);

  // Debounced effect for search filters
  useEffect(() => {
    if (searchDebounce) {
      clearTimeout(searchDebounce);
    }

    const newDebounce = setTimeout(() => {
      fetchScores();
    }, 500);

    setSearchDebounce(newDebounce);

    return () => {
      if (newDebounce) clearTimeout(newDebounce);
    };
  }, [
    filters.candidateName,
    filters.jobTitle,
    filters.minScore,
    filters.maxScore,
    filters.recommendation,
    filters.dateFrom,
    filters.dateTo,
  ]);

  const clearFilters = () => {
    setFilters({
      applicationId: "",
      jobId: "",
      resumeId: "",
      candidateName: "",
      jobTitle: "",
      minScore: "",
      maxScore: "",
      recommendation: "",
      dateFrom: "",
      dateTo: "",
    });
    setPagination({ ...pagination, page: 1 });
  };

  const hasActiveFilters = Object.values(filters).some(
    (filter) => filter !== ""
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-50 border-green-200";
    if (score >= 60) return "bg-yellow-50 border-yellow-200";
    if (score >= 40) return "bg-orange-50 border-orange-200";
    return "bg-red-50 border-red-200";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80)
      return {
        label: "Excellent",
        variant: "default",
        className: "bg-green-100 text-green-800 border-green-300",
      };
    if (score >= 60)
      return {
        label: "Good",
        variant: "default",
        className: "bg-yellow-100 text-yellow-800 border-yellow-300",
      };
    if (score >= 40)
      return {
        label: "Fair",
        variant: "default",
        className: "bg-orange-100 text-orange-800 border-orange-300",
      };
    return {
      label: "Poor",
      variant: "destructive",
      className: "bg-red-100 text-red-800 border-red-300",
    };
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case "HIGHLY_RECOMMENDED":
      case "RECOMMENDED":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "CONSIDER":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case "NOT_RECOMMENDED":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const renderScoreBreakdown = (explanation: any) => {
    if (!explanation || typeof explanation !== "object") return null;

    // Use scores object if available, otherwise fall back to direct properties
    const scores = explanation.scores || explanation;

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {scores.skills !== undefined && (
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">
              {scores.skills}
            </div>
            <div className="text-xs text-blue-700">Skills</div>
          </div>
        )}
        {scores.experience !== undefined && (
          <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">
              {scores.experience}
            </div>
            <div className="text-xs text-purple-700">Experience</div>
          </div>
        )}
        {scores.education !== undefined && (
          <div className="text-center p-3 bg-indigo-50 rounded-lg border border-indigo-200">
            <div className="text-2xl font-bold text-indigo-600">
              {scores.education}
            </div>
            <div className="text-xs text-indigo-700">Education</div>
          </div>
        )}
        {scores.fit !== undefined && (
          <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <div className="text-2xl font-bold text-emerald-600">
              {scores.fit}
            </div>
            <div className="text-xs text-emerald-700">Overall Fit</div>
          </div>
        )}
      </div>
    );
  };

  const renderDetailedAnalysisDialog = (scoreData: ScoringData) => {
    const explanation = scoreData.explanation;
    const skillsMatch = scoreData.skillsMatch;

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Detailed AI Analysis
            </DialogTitle>
            <DialogDescription>
              Complete scoring breakdown for{" "}
              {scoreData.candidate?.name || "Unknown Candidate"}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-6">
              {/* Score Breakdown */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Score Breakdown
                </h4>
                {renderScoreBreakdown(explanation)}
              </div>

              <Separator />

              {/* Skills Analysis */}
              {skillsMatch && Object.keys(skillsMatch).length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Skills Analysis</h4>

                  {skillsMatch.matchedRequired &&
                    skillsMatch.matchedRequired.length > 0 && (
                      <div className="mb-4">
                        <Label className="text-sm text-green-600 mb-2 block">
                          ✓ Matched Required Skills
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {skillsMatch.matchedRequired.map(
                            (skill: string, index: number) => (
                              <Badge
                                key={index}
                                className="bg-green-100 text-green-800 border-green-300"
                              >
                                {skill}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {skillsMatch.matchedPreferred &&
                    skillsMatch.matchedPreferred.length > 0 && (
                      <div className="mb-4">
                        <Label className="text-sm text-blue-600 mb-2 block">
                          ✓ Matched Preferred Skills
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {skillsMatch.matchedPreferred.map(
                            (skill: string, index: number) => (
                              <Badge
                                key={index}
                                className="bg-blue-100 text-blue-800 border-blue-300"
                              >
                                {skill}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {skillsMatch.missingRequired &&
                    skillsMatch.missingRequired.length > 0 && (
                      <div className="mb-4">
                        <Label className="text-sm text-red-600 mb-2 block">
                          ✗ Missing Required Skills
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {skillsMatch.missingRequired.map(
                            (skill: string, index: number) => (
                              <Badge
                                key={index}
                                variant="destructive"
                                className="opacity-80"
                              >
                                {skill}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {(skillsMatch.requiredScore !== undefined ||
                    skillsMatch.preferredScore !== undefined) && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {skillsMatch.requiredScore !== undefined && (
                        <div>
                          <Label className="text-sm block mb-2">
                            Required Skills Score
                          </Label>
                          <Progress
                            value={skillsMatch.requiredScore}
                            className="h-2"
                          />
                          <span className="text-xs text-muted-foreground mt-1 block">
                            {skillsMatch.requiredScore}%
                          </span>
                        </div>
                      )}
                      {skillsMatch.preferredScore !== undefined && (
                        <div>
                          <Label className="text-sm block mb-2">
                            Preferred Skills Score
                          </Label>
                          <Progress
                            value={skillsMatch.preferredScore}
                            className="h-2"
                          />
                          <span className="text-xs text-muted-foreground mt-1 block">
                            {skillsMatch.preferredScore}%
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <Separator />

              {/* Detailed Analysis */}
              {explanation && explanation.aiAnalysis && (
                <div className="space-y-4">
                  {explanation.aiAnalysis.strengths &&
                    explanation.aiAnalysis.strengths.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-green-600 mb-2 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Strengths
                        </h4>
                        <ul className="space-y-2">
                          {explanation.aiAnalysis.strengths.map(
                            (strength: string, index: number) => (
                              <li
                                key={index}
                                className="flex items-start gap-2 text-sm"
                              >
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                {strength}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                  {explanation.aiAnalysis.weaknesses &&
                    explanation.aiAnalysis.weaknesses.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-red-600 mb-2 flex items-center gap-2">
                          <TrendingDown className="h-4 w-4" />
                          Areas for Improvement
                        </h4>
                        <ul className="space-y-2">
                          {explanation.aiAnalysis.weaknesses.map(
                            (weakness: string, index: number) => (
                              <li
                                key={index}
                                className="flex items-start gap-2 text-sm"
                              >
                                <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                {weakness}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                  {explanation.aiAnalysis.key_matches &&
                    explanation.aiAnalysis.key_matches.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-blue-600 mb-2">
                          Key Matches
                        </h4>
                        <ul className="space-y-2">
                          {explanation.aiAnalysis.key_matches.map(
                            (match: string, index: number) => (
                              <li
                                key={index}
                                className="flex items-start gap-2 text-sm"
                              >
                                <Target className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                {match}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                  {explanation.aiAnalysis.missing_requirements &&
                    explanation.aiAnalysis.missing_requirements.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-orange-600 mb-2 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Missing Requirements
                        </h4>
                        <ul className="space-y-2">
                          {explanation.aiAnalysis.missing_requirements.map(
                            (requirement: string, index: number) => (
                              <li
                                key={index}
                                className="flex items-start gap-2 text-sm"
                              >
                                <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                {requirement}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                  {explanation.recommendation && (
                    <div className="p-4 bg-gray-50 rounded-lg border">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        {getRecommendationIcon(explanation.recommendation)}
                        Final Recommendation
                      </h4>
                      <Badge
                        className={
                          getScoreBadge(scoreData.score || 0).className
                        }
                      >
                        {explanation.recommendation.replace("_", " ")}
                      </Badge>
                      {explanation.summary && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {explanation.summary}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <Brain className="h-8 w-8 text-blue-600" />
                AI Scoring Dashboard
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Comprehensive AI-powered candidate evaluation results
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                {showFilters ? "Hide Filters" : "Show Filters"}
                {hasActiveFilters && (
                  <Badge className="ml-1 bg-blue-100 text-blue-800">
                    {Object.values(filters).filter((f) => f !== "").length}
                  </Badge>
                )}
              </Button>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Clear Filters
                </Button>
              )}
              <Button onClick={fetchScores} disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                {loading ? "Loading..." : "Refresh"}
              </Button>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Evaluations</p>
                    <p className="text-2xl font-bold">{pagination.total}</p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Score</p>
                    <p className="text-2xl font-bold">
                      {scores.length > 0
                        ? Math.round(
                            scores.reduce((sum, s) => sum + (s.score || 0), 0) /
                              scores.length
                          )
                        : 0}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">High Performers</p>
                    <p className="text-2xl font-bold">
                      {scores.filter((s) => (s.score || 0) >= 80).length}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Need Review</p>
                    <p className="text-2xl font-bold">
                      {scores.filter((s) => (s.score || 0) < 60).length}
                    </p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Advanced Search Filters
                </div>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="text-red-600 hover:text-red-700"
                  >
                    Clear All
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Basic Search */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    🔍 Quick Search
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="candidateName" className="text-sm">
                        Candidate Name
                      </Label>
                      <Input
                        id="candidateName"
                        value={filters.candidateName}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            candidateName: e.target.value,
                          })
                        }
                        placeholder="Search by candidate name..."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="jobTitle" className="text-sm">
                        Job Title
                      </Label>
                      <Input
                        id="jobTitle"
                        value={filters.jobTitle}
                        onChange={(e) =>
                          setFilters({ ...filters, jobTitle: e.target.value })
                        }
                        placeholder="Search by job title..."
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Score Range */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    📊 Score Range
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="minScore" className="text-sm">
                        Minimum Score
                      </Label>
                      <Input
                        id="minScore"
                        type="number"
                        min="0"
                        max="100"
                        value={filters.minScore}
                        onChange={(e) =>
                          setFilters({ ...filters, minScore: e.target.value })
                        }
                        placeholder="0"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxScore" className="text-sm">
                        Maximum Score
                      </Label>
                      <Input
                        id="maxScore"
                        type="number"
                        min="0"
                        max="100"
                        value={filters.maxScore}
                        onChange={(e) =>
                          setFilters({ ...filters, maxScore: e.target.value })
                        }
                        placeholder="100"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="recommendation" className="text-sm">
                        Recommendation
                      </Label>
                      <Select
                        value={filters.recommendation || "all"}
                        onValueChange={(value) =>
                          setFilters({
                            ...filters,
                            recommendation: value === "all" ? "" : value,
                          })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="All recommendations" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            All recommendations
                          </SelectItem>
                          <SelectItem value="HIGHLY_RECOMMENDED">
                            Highly Recommended
                          </SelectItem>
                          <SelectItem value="RECOMMENDED">
                            Recommended
                          </SelectItem>
                          <SelectItem value="CONSIDER">Consider</SelectItem>
                          <SelectItem value="NOT_RECOMMENDED">
                            Not Recommended
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Date Range */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    📅 Date Range
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dateFrom" className="text-sm">
                        From Date
                      </Label>
                      <Input
                        id="dateFrom"
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) =>
                          setFilters({ ...filters, dateFrom: e.target.value })
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateTo" className="text-sm">
                        To Date
                      </Label>
                      <Input
                        id="dateTo"
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) =>
                          setFilters({ ...filters, dateTo: e.target.value })
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Advanced ID Filters */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    🔢 Advanced ID Filters
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="applicationId" className="text-sm">
                        Application ID
                      </Label>
                      <Input
                        id="applicationId"
                        value={filters.applicationId}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            applicationId: e.target.value,
                          })
                        }
                        placeholder="Search by application ID..."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="jobId" className="text-sm">
                        Job ID
                      </Label>
                      <Input
                        id="jobId"
                        value={filters.jobId}
                        onChange={(e) =>
                          setFilters({ ...filters, jobId: e.target.value })
                        }
                        placeholder="Search by job ID..."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="resumeId" className="text-sm">
                        Resume ID
                      </Label>
                      <Input
                        id="resumeId"
                        value={filters.resumeId}
                        onChange={(e) =>
                          setFilters({ ...filters, resumeId: e.target.value })
                        }
                        placeholder="Search by resume ID..."
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Filter Summary */}
                {hasActiveFilters && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Filter className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        Active Filters (
                        {Object.values(filters).filter((f) => f !== "").length})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(filters).map(([key, value]) => {
                        if (!value) return null;
                        const displayName = key
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase());
                        return (
                          <Badge
                            key={key}
                            variant="secondary"
                            className="bg-blue-100 text-blue-800"
                          >
                            {displayName}: {value}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Filter Shortcuts */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600 mr-2">Quick filters:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setFilters({ ...filters, minScore: "80", maxScore: "" })
              }
              className="text-green-600 hover:text-green-700"
            >
              High Performers (80+)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setFilters({ ...filters, recommendation: "HIGHLY_RECOMMENDED" })
              }
              className="text-blue-600 hover:text-blue-700"
            >
              Highly Recommended
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setFilters({ ...filters, maxScore: "60", minScore: "" })
              }
              className="text-orange-600 hover:text-orange-700"
            >
              Need Review (≤60)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setFilters({
                  ...filters,
                  dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split("T")[0],
                })
              }
              className="text-purple-600 hover:text-purple-700"
            >
              Last 7 Days
            </Button>
          </div>
        </div>

        {/* Results Summary */}
        {!loading && scores.length > 0 && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <span>
                  Showing <strong>{scores.length}</strong> of{" "}
                  <strong>{pagination.total}</strong> evaluations
                </span>
                {hasActiveFilters && (
                  <span className="text-blue-600">• Filters applied</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span>
                  Avg Score:{" "}
                  <strong
                    className={getScoreColor(
                      scores.length > 0
                        ? Math.round(
                            scores.reduce((sum, s) => sum + (s.score || 0), 0) /
                              scores.length
                          )
                        : 0
                    )}
                  >
                    {scores.length > 0
                      ? Math.round(
                          scores.reduce((sum, s) => sum + (s.score || 0), 0) /
                            scores.length
                        )
                      : 0}
                  </strong>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Scores List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Brain className="h-8 w-8 text-blue-600 animate-pulse mx-auto mb-4" />
              <p className="text-lg text-gray-600">Loading AI evaluations...</p>
            </div>
          </div>
        ) : scores.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Evaluations Found
                </h3>
                <p className="text-gray-600">
                  No AI scoring results match your current filters.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {scores.map((scoreData) => {
              const scoreBadge = getScoreBadge(scoreData.score || 0);
              return (
                <Card
                  key={scoreData.id}
                  className={`hover:shadow-lg transition-all duration-200 ${getScoreBgColor(
                    scoreData.score || 0
                  )}`}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left Side - Main Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-2">
                            <Star className="h-5 w-5 text-yellow-500" />
                            <span
                              className={`text-3xl font-bold ${getScoreColor(
                                scoreData.score || 0
                              )}`}
                            >
                              {scoreData.score || 0}
                            </span>
                            <span className="text-lg text-gray-500">/100</span>
                          </div>
                          <Badge className={scoreBadge.className}>
                            {scoreBadge.label}
                          </Badge>
                          {scoreData.explanation?.recommendation && (
                            <div className="flex items-center gap-1">
                              {getRecommendationIcon(
                                scoreData.explanation.recommendation
                              )}
                              <span className="text-sm text-gray-600">
                                {scoreData.explanation.recommendation.replace(
                                  "_",
                                  " "
                                )}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Candidate Info */}
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <span className="font-semibold text-gray-900">
                                {scoreData.candidate?.name ||
                                  "Unknown Candidate"}
                              </span>
                            </div>
                            {scoreData.candidate?.email && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail className="h-3 w-3" />
                                {scoreData.candidate.email}
                              </div>
                            )}
                          </div>

                          {/* Job Info */}
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Briefcase className="h-4 w-4 text-gray-500" />
                              <span className="font-semibold text-gray-900">
                                {scoreData.job?.title || "Unknown Position"}
                              </span>
                            </div>
                            {scoreData.job?.location && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="h-3 w-3" />
                                {scoreData.job.location}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Score Breakdown */}
                        <div className="mt-4">
                          {renderScoreBreakdown(scoreData.explanation)}
                        </div>

                        {/* Summary */}
                        {scoreData.explanation?.summary && (
                          <div className="mt-4 p-3 bg-white/80 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {scoreData.explanation.summary}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Right Side - Actions */}
                      <div className="flex flex-col items-end gap-3 lg:w-48">
                        <div className="text-right">
                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(scoreData.scoredAt).toLocaleDateString()}
                          </div>
                          <Progress
                            value={scoreData.score || 0}
                            className="w-32 h-2"
                          />
                        </div>

                        {renderDetailedAnalysisDialog(scoreData)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button
              variant="outline"
              disabled={pagination.page <= 1}
              onClick={() =>
                setPagination({ ...pagination, page: pagination.page - 1 })
              }
            >
              Previous
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <span className="text-xs text-gray-500">
                ({pagination.total} total results)
              </span>
            </div>
            <Button
              variant="outline"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() =>
                setPagination({ ...pagination, page: pagination.page + 1 })
              }
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
