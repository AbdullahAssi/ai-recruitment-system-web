import { format } from "date-fns";
import {
  Brain,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Target,
  User,
  Mail,
  Briefcase,
  Calendar,
  FileText,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Application, AIScoresData } from "../../types/application.types";
import {
  getScoreColor,
  getScoreVariant,
  getStatusColor,
  formatStatusText,
} from "../../lib/applicationUtil";

interface AIAnalysisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: Application | null;
  aiScoresData: AIScoresData | null;
  loadingScores: boolean;
  onFetchScores: () => void;
}

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

export function AIAnalysisDialog({
  open,
  onOpenChange,
  application,
  aiScoresData,
  loadingScores,
  onFetchScores,
}: AIAnalysisDialogProps) {
  if (!application) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Detailed AI Analysis
          </DialogTitle>
          <DialogDescription>
            Complete scoring breakdown for{" "}
            {application.candidate?.name || "Unknown Candidate"}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Fetch AI Scores Button */}
            {!aiScoresData && (
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700 mb-3">
                  Load detailed AI scoring analysis from the AI service
                </p>
                <Button
                  onClick={onFetchScores}
                  disabled={loadingScores}
                  className="bg-blue-600 hover:bg-blue-700"
                  aria-label="Load AI scores analysis"
                >
                  {loadingScores ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Loading AI Scores...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Load AI Scores Analysis
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* AI Scores Data from API */}
            {aiScoresData && (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Brain className="h-5 w-5 text-indigo-600" />
                    AI Service Analysis Results
                  </h4>

                  {/* Overall AI Score */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-4 bg-white rounded-lg border">
                      <div className="text-3xl font-bold text-indigo-600">
                        {aiScoresData.score || "N/A"}%
                      </div>
                      <div className="text-sm text-gray-600">
                        AI Service Score
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {aiScoresData.scoredAt
                          ? format(
                              new Date(aiScoresData.scoredAt),
                              "MMM dd, yyyy 'at' HH:mm",
                            )
                          : ""}
                      </div>
                    </div>

                    {aiScoresData.explanation?.recommendation && (
                      <div className="text-center p-4 bg-white rounded-lg border">
                        <Badge
                          variant={getScoreVariant(aiScoresData.score || 0)}
                          className="text-lg px-4 py-2 mb-2"
                        >
                          {aiScoresData.explanation.recommendation
                            .replace("_", " ")
                            .toUpperCase()}
                        </Badge>
                        <div className="text-sm text-gray-600">
                          AI Recommendation
                        </div>
                      </div>
                    )}
                  </div>

                  {/* AI Service Detailed Scores */}
                  {aiScoresData.explanation?.scores && (
                    <div className="mb-4">
                      <h5 className="font-medium mb-3">
                        AI Service Detailed Scores
                      </h5>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="text-xl font-bold text-blue-600">
                            {aiScoresData.explanation.scores.overall}%
                          </div>
                          <div className="text-xs text-blue-700">Overall</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="text-xl font-bold text-green-600">
                            {aiScoresData.explanation.scores.skills}%
                          </div>
                          <div className="text-xs text-green-700">Skills</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="text-xl font-bold text-purple-600">
                            {aiScoresData.explanation.scores.experience}%
                          </div>
                          <div className="text-xs text-purple-700">
                            Experience
                          </div>
                        </div>
                        <div className="text-center p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                          <div className="text-xl font-bold text-indigo-600">
                            {aiScoresData.explanation.scores.education}%
                          </div>
                          <div className="text-xs text-indigo-700">
                            Education
                          </div>
                        </div>
                        <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                          <div className="text-xl font-bold text-emerald-600">
                            {aiScoresData.explanation.scores.fit}%
                          </div>
                          <div className="text-xs text-emerald-700">Fit</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AI Service Skills Analysis */}
                  {aiScoresData.skillsMatch && (
                    <div className="mb-4">
                      <h5 className="font-medium mb-3">
                        AI Service Skills Analysis
                      </h5>

                      {/* Progress bars for skills match */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {aiScoresData.skillsMatch.requiredScore !==
                          undefined && (
                          <div>
                            <Label className="text-sm block mb-2">
                              Required Skills Score (AI Service)
                            </Label>
                            <Progress
                              value={aiScoresData.skillsMatch.requiredScore}
                              className="h-3"
                            />
                            <span className="text-xs text-muted-foreground mt-1 block">
                              {aiScoresData.skillsMatch.requiredScore}%
                            </span>
                          </div>
                        )}
                        {aiScoresData.skillsMatch.preferredScore !==
                          undefined && (
                          <div>
                            <Label className="text-sm block mb-2">
                              Preferred Skills Score (AI Service)
                            </Label>
                            <Progress
                              value={aiScoresData.skillsMatch.preferredScore}
                              className="h-3"
                            />
                            <span className="text-xs text-muted-foreground mt-1 block">
                              {aiScoresData.skillsMatch.preferredScore}%
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Matched skills from AI service */}
                      {aiScoresData.skillsMatch.matchedRequired?.length > 0 && (
                        <div className="mb-3">
                          <Label className="text-sm text-green-600 mb-2 block">
                            ✓ AI Service Matched Required Skills
                          </Label>
                          <div className="flex flex-wrap gap-2">
                            {aiScoresData.skillsMatch.matchedRequired.map(
                              (skill: string, index: number) => (
                                <Badge
                                  key={index}
                                  className="bg-green-100 text-green-800 border-green-300"
                                >
                                  {skill}
                                </Badge>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                      {/* Missing skills */}
                      {aiScoresData.skillsMatch.missingRequired?.length > 0 && (
                        <div className="mb-3">
                          <Label className="text-sm text-red-600 mb-2 block">
                            ✗ AI Service Missing Required Skills
                          </Label>
                          <div className="flex flex-wrap gap-2">
                            {aiScoresData.skillsMatch.missingRequired.map(
                              (skill: string, index: number) => (
                                <Badge
                                  key={index}
                                  variant="destructive"
                                  className="opacity-80"
                                >
                                  {skill}
                                </Badge>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* AI Service Explanation Details */}
                  {aiScoresData.explanation && (
                    <div className="space-y-4">
                      {/* AI Analysis breakdown */}
                      {aiScoresData.explanation.aiAnalysis && (
                        <>
                          {aiScoresData.explanation.aiAnalysis.strengths
                            ?.length > 0 && (
                            <div>
                              <h5 className="font-medium text-green-600 mb-2 flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                AI Service Identified Strengths
                              </h5>
                              <ul className="space-y-1">
                                {aiScoresData.explanation.aiAnalysis.strengths.map(
                                  (strength: string, index: number) => (
                                    <li
                                      key={index}
                                      className="flex items-start gap-2 text-sm"
                                    >
                                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                      {strength}
                                    </li>
                                  ),
                                )}
                              </ul>
                            </div>
                          )}

                          {aiScoresData.explanation.aiAnalysis.weaknesses
                            ?.length > 0 && (
                            <div>
                              <h5 className="font-medium text-red-600 mb-2 flex items-center gap-2">
                                <TrendingDown className="h-4 w-4" />
                                AI Service Identified Weaknesses
                              </h5>
                              <ul className="space-y-1">
                                {aiScoresData.explanation.aiAnalysis.weaknesses.map(
                                  (weakness: string, index: number) => (
                                    <li
                                      key={index}
                                      className="flex items-start gap-2 text-sm"
                                    >
                                      <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                      {weakness}
                                    </li>
                                  ),
                                )}
                              </ul>
                            </div>
                          )}

                          {aiScoresData.explanation.aiAnalysis.key_matches
                            ?.length > 0 && (
                            <div>
                              <h5 className="font-medium text-blue-600 mb-2">
                                AI Service Key Matches
                              </h5>
                              <ul className="space-y-1">
                                {aiScoresData.explanation.aiAnalysis.key_matches.map(
                                  (match: string, index: number) => (
                                    <li
                                      key={index}
                                      className="flex items-start gap-2 text-sm"
                                    >
                                      <Target className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                      {match}
                                    </li>
                                  ),
                                )}
                              </ul>
                            </div>
                          )}
                        </>
                      )}

                      {/* Summary */}
                      {aiScoresData.explanation.summary && (
                        <div className="p-3 bg-white rounded-lg border">
                          <h5 className="font-medium mb-2">
                            AI Service Summary
                          </h5>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {aiScoresData.explanation.summary}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <Separator />
              </div>
            )}

            {/* Candidate and Job Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-semibold text-gray-900">
                    {application.candidate?.name || "Unknown Candidate"}
                  </span>
                </div>
                {application.candidate?.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-3 w-3" />
                    {application.candidate.email}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <Briefcase className="h-3 w-3" />
                  {application.candidate.experience} years experience
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-semibold text-gray-900">
                    Application Details
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText className="h-3 w-3" />
                  Applied:{" "}
                  {format(new Date(application.appliedAt), "MMM dd, yyyy")}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <Badge
                    className={`${getStatusColor(application.status)} text-xs`}
                  >
                    {formatStatusText(application.status)}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Score Summary */}
            <div className="mt-4">
              <div className="p-3 bg-white/80 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Overall Score
                    </h4>
                    <p className="text-sm text-gray-600">
                      Final matching assessment
                    </p>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-3xl font-bold ${getScoreColor(
                        application.score,
                      )}`}
                    >
                      {application.score}%
                    </div>
                    {application.aiAnalysis && (
                      <Badge
                        variant={getScoreVariant(
                          application.aiAnalysis.overallScore ||
                            application.score,
                        )}
                        className="mt-1"
                      >
                        {application.aiAnalysis.recommendation
                          ? application.aiAnalysis.recommendation.replace(
                              "_",
                              " ",
                            )
                          : "Assessment Complete"}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
