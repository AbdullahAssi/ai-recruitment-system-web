"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  User,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Download,
} from "lucide-react";
import type { MatchResult } from "@/lib/types/fastapi.types";

interface CandidateMatchCardProps {
  match: MatchResult;
  onViewProfile?: (candidateId: string) => void;
  onDownloadResume?: (candidateId: string) => void;
}

export function CandidateMatchCard({
  match,
  onViewProfile,
  onDownloadResume,
}: CandidateMatchCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-50 border-green-200";
    if (score >= 60) return "bg-blue-50 border-blue-200";
    if (score >= 40) return "bg-orange-50 border-orange-200";
    return "bg-red-50 border-red-200";
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {match.candidate_name}
            </CardTitle>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              {match.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {match.email}
                </div>
              )}
              {match.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {match.phone}
                </div>
              )}
              {match.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {match.location}
                </div>
              )}
            </div>
          </div>
          <div
            className={`text-center px-4 py-2 rounded-lg border-2 ${getScoreBgColor(
              match.match_score,
            )}`}
          >
            <div
              className={`text-3xl font-bold ${getScoreColor(match.match_score)}`}
            >
              {match.match_score}
            </div>
            <div className="text-xs text-gray-600 mt-1">Match Score</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Match Score Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Overall Match</span>
            <span className={getScoreColor(match.match_score)}>
              {match.match_score}%
            </span>
          </div>
          <Progress value={match.match_score} className="h-2" />
        </div>

        {/* Matched Skills */}
        {match.matched_skills && match.matched_skills.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold">
                Matched Skills ({match.matched_skills.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {match.matched_skills.map((skill, index) => (
                <Badge
                  key={index}
                  variant="default"
                  className="bg-green-100 text-green-800"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Missing Skills */}
        {match.missing_skills && match.missing_skills.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-semibold">
                Missing Skills ({match.missing_skills.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {match.missing_skills.map((skill, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-red-600 border-red-300"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Explanation */}
        {match.explanation && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-blue-900 mb-1">
                  AI Analysis
                </p>
                <p className="text-sm text-blue-800">{match.explanation}</p>
              </div>
            </div>
          </div>
        )}

        {/* Semantic Similarity */}
        {typeof match.similarity_score === "number" && (
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-purple-900">
                Semantic Similarity
              </span>
              <span className="text-sm text-purple-800">
                {(match.similarity_score * 100).toFixed(1)}%
              </span>
            </div>
            <Progress
              value={match.similarity_score * 100}
              className="h-1 mt-2"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {onViewProfile && (
            <Button
              onClick={() => onViewProfile(match.candidate_id)}
              variant="default"
              className="flex-1"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Profile
            </Button>
          )}
          {onDownloadResume && (
            <Button
              onClick={() => onDownloadResume(match.candidate_id)}
              variant="outline"
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Resume
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
