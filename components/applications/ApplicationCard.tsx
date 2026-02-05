"use client";

import { format } from "date-fns";
import {
  FiMail,
  FiBriefcase,
  FiCalendar,
  FiDownload,
  FiTrendingUp,
} from "react-icons/fi";
import { BsTrophy, BsCheckCircle, BsXCircle } from "react-icons/bs";
import { HiSparkles } from "react-icons/hi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Application } from "../../types/application.types";
import {
  getStatusColor,
  getScoreColor,
  getScoreVariant,
  getApplicationBorderColor,
  downloadResume,
  formatStatusText,
} from "../../lib/applicationUtil";
import { useToast } from "@/hooks/use-toast";

interface ApplicationCardProps {
  application: Application;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onStatusUpdate: (newStatus: string) => void;
  onViewAIAnalysis?: () => void;
}

export function ApplicationCard({
  application,
  isSelected,
  onSelect,
  onStatusUpdate,
  onViewAIAnalysis,
}: ApplicationCardProps) {
  const { toast } = useToast();

  const handleDownloadResume = async () => {
    if (application.candidate.resumes.length > 0) {
      const resume = application.candidate.resumes[0];
      const result = await downloadResume(resume.id, resume.fileName);

      if (result.success) {
        toast({
          title: "Download Started",
          description: `Downloading ${resume.fileName}`,
        });
      } else {
        toast({
          title: "Download Failed",
          description: "Could not download the resume",
          variant: "destructive",
        });
      }
    }
  };

  const getRecommendationColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 60) return "text-amber-600 bg-amber-50 border-amber-200";
    if (score >= 40) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  return (
    <Card
      className={`group relative overflow-hidden transition-all duration-200 hover:shadow-md ${isSelected ? "ring-2 ring-purple-400" : ""}`}
    >
      <CardContent className="p-4">
        {/* Header with Checkbox and Name */}
        <div className="flex items-start gap-3 mb-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            className="mt-1"
            aria-label={`Select ${application.candidate.name}`}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-base font-semibold text-gray-900 truncate">
                {application.candidate.name}
              </h3>
              {application.aiAnalysis && (
                <Badge variant="success" className="h-5 px-1.5 text-[10px]">
                  <HiSparkles className="w-3 h-3 mr-1" />
                  AI
                </Badge>
              )}
            </div>

            <div className="space-y-1.5 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <FiMail className="w-4 h-4 text-gray-400" />
                <span className="truncate">{application.candidate.email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FiCalendar className="w-4 h-4 text-gray-400" />
                <span>
                  {format(new Date(application.appliedAt), "MMM dd, HH:mm")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scores Section */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {/* Match Score */}
          <div
            className={`rounded-lg p-2.5 border text-center ${getScoreColor(application.score)}`}
          >
            <HiSparkles className="w-4 h-4 mx-auto mb-1" />
            <div className="text-lg font-bold">{application.score}%</div>
            <div className="text-[10px] font-medium">Match</div>
          </div>

          {/* Quiz Score */}
          {typeof application.candidate.quizScore === "number" && (
            <div className="bg-purple-50 rounded-lg p-2.5 border border-purple-200 text-center">
              <BsTrophy className="w-4 h-4 text-purple-600 mx-auto mb-1" />
              <div
                className={`text-lg font-bold ${
                  application.candidate.quizPassed
                    ? "text-emerald-700"
                    : "text-red-700"
                }`}
              >
                {application.candidate.quizScore}%
              </div>
              <div className="text-[10px] text-purple-700 font-medium">
                Quiz
              </div>
            </div>
          )}

          {/* Experience Box */}
          <div className="bg-amber-50 rounded-lg p-2.5 border border-amber-200 text-center">
            <FiBriefcase className="w-4 h-4 text-amber-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-amber-700">
              {application.candidate.experience}y
            </div>
            <div className="text-[10px] text-amber-700 font-medium">
              Experience
            </div>
          </div>

          {/* AI Overall Score or Status */}
          {application.aiAnalysis ? (
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg p-2.5 border border-purple-200 text-center">
              <HiSparkles className="w-4 h-4 text-purple-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-purple-700">
                {application.aiAnalysis.overallScore}%
              </div>
              <div className="text-[10px] text-purple-700 font-medium">
                AI Score
              </div>
            </div>
          ) : (
            <div
              className={`rounded-lg p-2.5 border text-center ${getStatusColor(application.status)}`}
            >
              <BsCheckCircle className="w-4 h-4 mx-auto mb-1" />
              <div className="text-xs font-bold">
                {formatStatusText(application.status)}
              </div>
              <div className="text-[10px] font-medium">Status</div>
            </div>
          )}
        </div>

        {/* AI Analysis Breakdown (if available) */}
        {application.aiAnalysis && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-blue-50 rounded p-2 border border-blue-200 text-center">
              <FiTrendingUp className="w-3.5 h-3.5 text-blue-600 mx-auto mb-0.5" />
              <div className="text-sm font-bold text-blue-700">
                {application.aiAnalysis.scores.skills}
              </div>
              <div className="text-[9px] text-blue-700">Skills</div>
            </div>
            <div className="bg-indigo-50 rounded p-2 border border-indigo-200 text-center">
              <FiBriefcase className="w-3.5 h-3.5 text-indigo-600 mx-auto mb-0.5" />
              <div className="text-sm font-bold text-indigo-700">
                {application.aiAnalysis.scores.experience}
              </div>
              <div className="text-[9px] text-indigo-700">Exp</div>
            </div>
            <div className="bg-emerald-50 rounded p-2 border border-emerald-200 text-center">
              <BsCheckCircle className="w-3.5 h-3.5 text-emerald-600 mx-auto mb-0.5" />
              <div className="text-sm font-bold text-emerald-700">
                {application.aiAnalysis.scores.fit}
              </div>
              <div className="text-[9px] text-emerald-700">Fit</div>
            </div>
          </div>
        )}

        {/* AI Recommendation */}
        {application.aiAnalysis && (
          <div
            className={`rounded-lg p-2 mb-3 border ${getRecommendationColor(application.aiAnalysis.overallScore)}`}
          >
            <div className="flex items-center justify-center">
              <Badge
                className="text-xs px-3 py-1"
                variant={getScoreVariant(application.aiAnalysis.overallScore)}
              >
                {application.aiAnalysis.recommendation.replace("_", " ")}
              </Badge>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          {application.candidate.resumes.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownloadResume}
              className="h-9"
            >
              <FiDownload className="w-4 h-4 mr-2" />
              Resume
            </Button>
          )}
          <Button size="sm" variant="outline" className="h-9">
            <FiMail className="w-4 h-4 mr-2" />
            Contact
          </Button>
          {onViewAIAnalysis && (
            <Button
              variant="outline"
              size="sm"
              onClick={onViewAIAnalysis}
              className="h-9 col-span-2"
            >
              <HiSparkles className="w-4 h-4 mr-2" />
              {application.aiAnalysis
                ? "View AI Details"
                : "Generate AI Analysis"}
            </Button>
          )}
          <Select value={application.status} onValueChange={onStatusUpdate}>
            <SelectTrigger className="h-9 col-span-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="REVIEWED">Reviewed</SelectItem>
              <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="QUIZ_PENDING">Quiz Pending</SelectItem>
              <SelectItem value="QUIZ_COMPLETED">Quiz Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
