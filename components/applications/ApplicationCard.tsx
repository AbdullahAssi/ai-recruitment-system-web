import { format } from "date-fns";
import {
  Mail,
  Briefcase,
  Calendar,
  FileText,
  Download,
  Eye,
  Brain,
  User,
} from "lucide-react";
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
  getScoreBadgeColor,
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
  onViewProfile: () => void;
  onViewAIAnalysis?: () => void;
}

export function ApplicationCard({
  application,
  isSelected,
  onSelect,
  onStatusUpdate,
  onViewProfile,
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

  return (
    <Card
      className={`shadow-xl hover:shadow-2xl transition-all duration-300 border-l-4 ${getApplicationBorderColor(
        application,
        isSelected,
      )}`}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-start gap-4 flex-1">
            <div className="flex flex-col items-center gap-3">
              <Checkbox
                checked={isSelected}
                onCheckedChange={onSelect}
                aria-label={`Select application from ${application.candidate.name}`}
              />
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center shadow-lg">
                  <User className="w-8 h-8 text-purple-600" />
                </div>
                {application.aiAnalysis && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Brain className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-bold text-xl text-gray-900">
                  {application.candidate.name}
                </h4>
                {application.aiAnalysis && (
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-300 text-xs"
                  >
                    AI Analyzed
                  </Badge>
                )}
              </div>
              <div className="space-y-1 mb-3">
                <p className="text-gray-600 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-500" />
                  {application.candidate.email}
                </p>
                <p className="text-gray-600 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-green-500" />
                  {application.candidate.experience} years experience
                </p>
                {/* Quiz Score Display */}
                {typeof application.candidate.quizScore === "number" && (
                  <p className="text-gray-600 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-500" />
                    Quiz Score:
                    <span
                      className={`font-semibold ${
                        application.candidate.quizPassed
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {application.candidate.quizScore}%
                    </span>
                  </p>
                )}
              </div>

              {/* Enhanced AI Analysis Summary */}
              {application.aiAnalysis && (
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 rounded-xl border-2 border-blue-200 shadow-sm">
                  <h5 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    AI Analysis Summary
                  </h5>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div className="text-center p-2 bg-white rounded border">
                      <div className="text-lg font-bold text-blue-600">
                        {application.aiAnalysis.scores.skills}
                      </div>
                      <div className="text-xs text-gray-600">Skills</div>
                    </div>
                    <div className="text-center p-2 bg-white rounded border">
                      <div className="text-lg font-bold text-purple-600">
                        {application.aiAnalysis.scores.experience}
                      </div>
                      <div className="text-xs text-gray-600">Experience</div>
                    </div>
                    <div className="text-center p-2 bg-white rounded border">
                      <div className="text-lg font-bold text-indigo-600">
                        {application.aiAnalysis.scores.education}
                      </div>
                      <div className="text-xs text-gray-600">Education</div>
                    </div>
                    <div className="text-center p-2 bg-white rounded border">
                      <div className="text-lg font-bold text-emerald-600">
                        {application.aiAnalysis.scores.fit}
                      </div>
                      <div className="text-xs text-gray-600">Fit</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Skills Match:{" "}
                      {application.aiAnalysis.skillsMatch.required}% required
                    </span>
                    <Badge
                      className={`${getScoreBadgeColor(
                        application.aiAnalysis.overallScore,
                      )} text-xs`}
                      variant="outline"
                    >
                      {application.aiAnalysis.recommendation.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="text-right flex flex-col items-end gap-3">
            <div className="flex flex-col items-end gap-2">
              <div
                className={`text-2xl font-bold px-4 py-3 rounded-xl shadow-lg ${getScoreColor(
                  application.score,
                )}`}
              >
                {application.score}%
              </div>
              <Badge
                className={`${getStatusColor(
                  application.status,
                )} shadow-sm font-medium`}
              >
                {formatStatusText(application.status)}
              </Badge>
            </div>

            {application.aiAnalysis && (
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">
                  AI Recommendation
                </div>
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ${
                    application.aiAnalysis.overallScore >= 80
                      ? "bg-green-500"
                      : application.aiAnalysis.overallScore >= 60
                        ? "bg-yellow-500"
                        : application.aiAnalysis.overallScore >= 40
                          ? "bg-orange-500"
                          : "bg-red-500"
                  }`}
                >
                  {Math.round(application.aiAnalysis.overallScore)}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h5 className="font-medium text-gray-900 mb-2">
              Application Details
            </h5>
            <div className="space-y-1 text-sm">
              <p className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>
                  <strong>Applied:</strong>{" "}
                  {format(
                    new Date(application.appliedAt),
                    "MMM dd, yyyy 'at' HH:mm",
                  )}
                </span>
              </p>
              <p className="flex items-center gap-2 text-gray-600">
                <FileText className="w-4 h-4 text-green-500" />
                <span>
                  <strong>Application ID:</strong>{" "}
                  {application.id.substring(0, 8)}...
                </span>
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border">
            <h5 className="font-medium text-gray-900 mb-2">
              Resume Information
            </h5>
            <div className="space-y-1 text-sm">
              <p className="flex items-center gap-2 text-gray-600">
                <Download className="w-4 h-4 text-purple-500" />
                <span>
                  <strong>Resumes:</strong>{" "}
                  {application.candidate.resumes.length} uploaded
                </span>
              </p>
              {application.candidate.resumes.length > 0 && (
                <p className="flex items-center gap-2 text-gray-600">
                  <FileText className="w-4 h-4 text-orange-500" />
                  <span>
                    <strong>Latest:</strong>{" "}
                    {application.candidate.resumes[0].fileName.length > 20
                      ? `${application.candidate.resumes[0].fileName.substring(
                          0,
                          20,
                        )}...`
                      : application.candidate.resumes[0].fileName}
                  </span>
                </p>
              )}
            </div>
          </div>

          {application.aiAnalysis && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
              <h5 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Quick AI Insights
              </h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Overall Match:</span>
                  <span
                    className={`font-bold ${
                      application.aiAnalysis.overallScore >= 80
                        ? "text-green-600"
                        : application.aiAnalysis.overallScore >= 60
                          ? "text-yellow-600"
                          : application.aiAnalysis.overallScore >= 40
                            ? "text-orange-600"
                            : "text-red-600"
                    }`}
                  >
                    {application.aiAnalysis.overallScore}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Skills Match:</span>
                  <span className="font-medium text-green-600">
                    {application.aiAnalysis.skillsMatch.required}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Recommendation:</span>
                  <Badge
                    className={`${getScoreBadgeColor(
                      application.aiAnalysis.overallScore,
                    )} text-xs`}
                    variant="outline"
                  >
                    {application.aiAnalysis.recommendation.replace("_", " ")}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-6 border-t-2 border-gray-100">
          <div className="flex gap-3">
            {application.candidate.resumes.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownloadResume}
                className="border-green-300 text-green-700 hover:bg-green-50 shadow-sm"
                aria-label={`Download resume for ${application.candidate.name}`}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Resume
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onViewProfile}
              className="border-blue-300 text-blue-700 hover:bg-blue-50 shadow-sm"
              aria-label={`View detailed profile for ${application.candidate.name}`}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </div>

          <div className="flex gap-3">
            {onViewAIAnalysis && (
              <Button
                variant="outline"
                size="sm"
                onClick={onViewAIAnalysis}
                className="border-purple-300 text-purple-700 hover:bg-purple-50 shadow-sm"
                aria-label={`View AI analysis for ${application.candidate.name}`}
              >
                <Brain className="h-4 w-4 mr-2" />
                {application.aiAnalysis ? "AI Analysis" : "Get AI Analysis"}
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-50 shadow-sm"
              aria-label={`Contact ${application.candidate.name}`}
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact
            </Button>
            <Select
              value={application.status}
              onValueChange={onStatusUpdate}
              aria-label={`Update status for ${application.candidate.name}`}
            >
              <SelectTrigger className="w-36 border-2 shadow-sm">
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
        </div>
      </CardContent>
    </Card>
  );
}
