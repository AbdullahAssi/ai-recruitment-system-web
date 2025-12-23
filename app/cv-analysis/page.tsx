"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Target,
  Award,
  Brain,
  Users,
} from "lucide-react";

interface CVAnalysis {
  id: string;
  score: number;
  summary: string;
  candidateName: string;
  jobTitle: string;
  aiAnalysis: {
    strengths: string[];
    weaknesses: string[];
    key_matches: string[];
    missing_requirements: string[];
  };
  scores: {
    overall: number;
    skills: number;
    experience: number;
    education: number;
    fit: number;
  };
  recommendation: string;
  totalResumeSkills: number;
  overallSkillScore: number;
}

export default function CVAnalysisPage() {
  const [analyses, setAnalyses] = useState<CVAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState<CVAnalysis | null>(
    null
  );

  useEffect(() => {
    // Load dummy data directly
    loadDummyData();
  }, []);

  const loadDummyData = () => {
    const dummyData: CVAnalysis[] = [
      {
        id: "cvs_1",
        score: 85,
        summary:
          "Strong background in full-stack development with excellent React and Node.js skills. Shows great potential for senior roles with additional experience in system architecture.",
        candidateName: "John Doe",
        jobTitle: "Senior Full Stack Developer",
        aiAnalysis: {
          strengths: [
            "Strong background in full-stack development",
            "Excellent React and Node.js proficiency",
            "Good problem-solving abilities",
            "Team collaboration experience",
          ],
          weaknesses: [
            "Limited experience with system architecture",
            "Could benefit from more DevOps knowledge",
            "Needs exposure to microservices",
          ],
          key_matches: [
            "React expertise matches job requirements",
            "Node.js experience aligns perfectly",
            "Full-stack background is ideal",
            "5+ years experience requirement met",
          ],
          missing_requirements: [
            "Advanced system architecture experience",
            "Leadership experience in large teams",
            "Cloud platform certifications",
          ],
        },
        scores: {
          overall: 85,
          skills: 22,
          experience: 18,
          education: 15,
          fit: 30,
        },
        recommendation: "SHORTLIST",
        totalResumeSkills: 8,
        overallSkillScore: 90.5,
      },
      {
        id: "cvs_2",
        score: 78,
        summary:
          "Solid frontend developer with excellent React skills. Good match for the position with room for growth in backend technologies.",
        candidateName: "Jane Smith",
        jobTitle: "Frontend Engineer",
        aiAnalysis: {
          strengths: [
            "Expert-level React and TypeScript",
            "Strong UI/UX design sense",
            "Modern frontend tooling knowledge",
            "Responsive design expertise",
          ],
          weaknesses: [
            "Limited backend experience",
            "No exposure to testing frameworks",
            "Minimal API development knowledge",
          ],
          key_matches: [
            "React and TypeScript proficiency",
            "Component library experience",
            "Modern CSS frameworks",
            "Git workflow expertise",
          ],
          missing_requirements: [
            "Backend API integration experience",
            "Unit testing knowledge",
            "Performance optimization skills",
          ],
        },
        scores: {
          overall: 78,
          skills: 20,
          experience: 15,
          education: 13,
          fit: 30,
        },
        recommendation: "CONSIDER",
        totalResumeSkills: 6,
        overallSkillScore: 82.0,
      },
      {
        id: "cvs_3",
        score: 92,
        summary:
          "Exceptional backend engineer with extensive Node.js and Python experience. Perfect fit for senior engineering role with strong system design skills.",
        candidateName: "Mike Johnson",
        jobTitle: "Backend Developer",
        aiAnalysis: {
          strengths: [
            "Extensive backend architecture experience",
            "Expert in Node.js and Python",
            "Strong database design skills",
            "Microservices architecture knowledge",
            "API design best practices",
          ],
          weaknesses: [
            "Limited frontend experience",
            "Could improve documentation skills",
          ],
          key_matches: [
            "Node.js and Python expertise",
            "PostgreSQL and MongoDB experience",
            "REST API development",
            "Docker and containerization",
            "7+ years experience",
          ],
          missing_requirements: [],
        },
        scores: {
          overall: 92,
          skills: 24,
          experience: 22,
          education: 16,
          fit: 30,
        },
        recommendation: "SHORTLIST",
        totalResumeSkills: 12,
        overallSkillScore: 95.0,
      },
      {
        id: "cvs_4",
        score: 65,
        summary:
          "Junior developer with good potential. Shows enthusiasm and willingness to learn. Would benefit from mentorship and structured learning.",
        candidateName: "David Brown",
        jobTitle: "Junior Developer",
        aiAnalysis: {
          strengths: [
            "Strong learning attitude",
            "Basic JavaScript knowledge",
            "Good communication skills",
            "Recent bootcamp graduate",
          ],
          weaknesses: [
            "Limited professional experience",
            "Needs more hands-on project work",
            "Beginner-level coding skills",
            "No production environment exposure",
          ],
          key_matches: [
            "JavaScript fundamentals",
            "React basics",
            "Git version control",
          ],
          missing_requirements: [
            "Professional development experience",
            "Advanced JavaScript concepts",
            "Backend development skills",
            "Testing experience",
          ],
        },
        scores: {
          overall: 65,
          skills: 12,
          experience: 8,
          education: 15,
          fit: 30,
        },
        recommendation: "REVIEW",
        totalResumeSkills: 4,
        overallSkillScore: 55.0,
      },
    ];

    setAnalyses(dummyData);
    setSelectedAnalysis(dummyData[0]);
    setLoading(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case "SHORTLIST":
        return "bg-green-100 text-green-800 border-green-300";
      case "CONSIDER":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "REVIEW":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading CV analyses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          CV Analysis Dashboard
        </h1>
        <p className="text-gray-600">
          AI-powered candidate evaluation and scoring
        </p>
      </div>

      {selectedAnalysis && (
        <div className="space-y-6">
          {/* Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Brain className="h-6 w-6 text-blue-600" />
                  {selectedAnalysis.candidateName}
                </span>
                <Badge
                  className={`${getRecommendationColor(
                    selectedAnalysis.recommendation
                  )} text-lg px-4 py-1`}
                >
                  {selectedAnalysis.recommendation}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Position Applied</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedAnalysis.jobTitle}
                  </p>
                </div>

                <div className="flex items-center gap-8">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Overall Score</p>
                    <p
                      className={`text-4xl font-bold ${getScoreColor(
                        selectedAnalysis.score
                      )}`}
                    >
                      {selectedAnalysis.score}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Skills Score</p>
                    <p className="text-2xl font-semibold text-gray-700">
                      {selectedAnalysis.overallSkillScore.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Skills Found</p>
                    <p className="text-2xl font-semibold text-gray-700">
                      {selectedAnalysis.totalResumeSkills}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-gray-700 leading-relaxed">
                    {selectedAnalysis.summary}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Score Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                Score Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(selectedAnalysis.scores).map(([key, value]) => {
                if (key === "overall") return null;
                const maxScores: { [key: string]: number } = {
                  skills: 25,
                  experience: 25,
                  education: 20,
                  fit: 30,
                };
                const percentage = (value / maxScores[key]) * 100;

                return (
                  <div key={key}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {key}
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {value} / {maxScores[key]}
                      </span>
                    </div>
                    <Progress value={percentage} className="h-3" />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* AI Analysis Grid - 2x2 Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <TrendingUp className="h-5 w-5" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {selectedAnalysis.aiAnalysis.strengths.map(
                    (strength, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{strength}</span>
                      </li>
                    )
                  )}
                </ul>
              </CardContent>
            </Card>

            {/* Key Matches */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Award className="h-5 w-5" />
                  Key Matches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {selectedAnalysis.aiAnalysis.key_matches.map(
                    (match, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{match}</span>
                      </li>
                    )
                  )}
                </ul>
              </CardContent>
            </Card>

            {/* Weaknesses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700">
                  <TrendingDown className="h-5 w-5" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {selectedAnalysis.aiAnalysis.weaknesses.map(
                    (weakness, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <XCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{weakness}</span>
                      </li>
                    )
                  )}
                </ul>
              </CardContent>
            </Card>

            {/* Missing Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <XCircle className="h-5 w-5" />
                  Missing Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {selectedAnalysis.aiAnalysis.missing_requirements.map(
                    (req, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{req}</span>
                      </li>
                    )
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
