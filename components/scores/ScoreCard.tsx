import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  User,
  Briefcase,
  Calendar,
  Mail,
  MapPin,
  Eye,
  CheckCircle,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { ScoringData } from '@/lib/types';

interface ScoreCardProps {
  scoreData: ScoringData;
  onViewDetails: (scoreData: ScoringData) => void;
  className?: string;
}

export function ScoreCard({ scoreData, onViewDetails, className = '' }: ScoreCardProps) {
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

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case "HIGHLY_RECOMMENDED":
        return "bg-green-100 text-green-800 border-green-200";
      case "RECOMMENDED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "CONSIDER":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "NOT_RECOMMENDED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Left Side - Main Info */}
          <div className="flex-1">
            {/* Overall Score */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getScoreColor(scoreData.score || 0)}`}>
                    {scoreData.score || 0}
                  </div>
                  <div className="text-xs text-gray-500">Overall Score</div>
                </div>
                {scoreData.explanation?.recommendation && (
                  <Badge
                    variant="outline"
                    className={getRecommendationColor(scoreData.explanation.recommendation)}
                  >
                    {getRecommendationIcon(scoreData.explanation.recommendation)}
                    <span className="ml-1">
                      {scoreData.explanation.recommendation.replace('_', ' ')}
                    </span>
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Candidate Info */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-semibold text-gray-900">
                    {scoreData.candidate?.name || "Unknown Candidate"}
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

            {/* Summary */}
            {scoreData.explanation?.summary && (
              <div className="mt-4 p-3 bg-white/80 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {scoreData.explanation.summary}
                </p>
              </div>
            )}
          </div>

          {/* Right Side - Actions and Date */}
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

            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(scoreData)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
