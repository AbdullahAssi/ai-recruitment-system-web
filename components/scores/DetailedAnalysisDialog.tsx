import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Brain, Target, CheckCircle, XCircle } from "lucide-react";
import { ScoringData } from "@/lib/types";
import { ScoreBreakdown } from "./ScoreBreakdown";
import { GrScorecard } from "react-icons/gr";
interface DetailedAnalysisDialogProps {
  scoreData: ScoringData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DetailedAnalysisDialog({
  scoreData,
  open,
  onOpenChange,
}: DetailedAnalysisDialogProps) {
  // Early return if no scoreData is provided
  if (!scoreData) {
    console.warn("DetailedAnalysisDialog: No scoreData provided");
    return null;
  }

  // Debug log to verify scoreData structure
  React.useEffect(() => {
    if (open && scoreData) {
      console.log("=== DetailedAnalysisDialog Debug Info ===");
      console.log("Dialog opened with scoreData:", scoreData);
      console.log("Score value:", scoreData.score);
      console.log("Explanation:", scoreData.explanation);
      console.log("SkillsMatch:", scoreData.skillsMatch);
      console.log("Candidate:", scoreData.candidate);
      console.log("========================================");
    }
  }, [open, scoreData]);

  const explanation = scoreData.explanation as any; // Allow dynamic properties
  const skillsMatch = scoreData.skillsMatch;

  // Handle different data formats - check if we have nested aiAnalysis structure
  const getAnalysisData = () => {
    console.log(
      "Using format:",
      explanation?.aiAnalysis
        ? "new (nested aiAnalysis)"
        : "legacy (direct properties)",
    );
    console.log("Explanation structure:", explanation);

    if (explanation?.aiAnalysis) {
      // New format with nested aiAnalysis
      const newFormatData = {
        strengths: explanation.aiAnalysis.strengths || [],
        weaknesses: explanation.aiAnalysis.weaknesses || [],
        keySkillsMatch: explanation.aiAnalysis.key_matches || [],
        missingSkills: explanation.aiAnalysis.missing_requirements || [],
        summary: explanation.summary || "",
        recommendation: explanation.recommendation || "",
        skills: explanation.scores?.skills || 0,
        experience: explanation.scores?.experience || 0,
        education: explanation.scores?.education || 0,
        fit: explanation.scores?.fit || 0,
      };
      console.log("Using new format data (aiAnalysis):", newFormatData);
      return newFormatData;
    }

    if (explanation?.detailed_analysis) {
      // Backend format (detailed_analysis)
      const detailedFormatData = {
        strengths: explanation.detailed_analysis.strengths || [],
        weaknesses: explanation.detailed_analysis.weaknesses || [],
        keySkillsMatch: explanation.detailed_analysis.key_matches || [], // Map key_matches to keySkillsMatch
        missingSkills: explanation.detailed_analysis.missing_requirements || [], // Map missing_requirements
        summary: explanation.summary || "",
        recommendation: explanation.recommendation || "",
        skills: explanation.skills_score || 0,
        experience: explanation.experience_score || 0,
        education: explanation.education_score || 0,
        fit: explanation.fit_score || 0,
      };
      console.log(
        "Using backend format data (detailed_analysis):",
        detailedFormatData,
      );
      return detailedFormatData;
    }

    // Fallback to direct properties (legacy format)
    const legacyFormatData = {
      strengths: explanation?.strengths || [],
      weaknesses: explanation?.weaknesses || [],
      keySkillsMatch: explanation?.keySkillsMatch || [],
      missingSkills: explanation?.missingSkills || [],
      summary: explanation?.summary || "",
      recommendation: explanation?.recommendation || "",
      skills: explanation?.skills || 0,
      experience: explanation?.experience || 0,
      education: explanation?.education || 0,
      fit: explanation?.fit || 0,
    };
    console.log("Using legacy format data:", legacyFormatData);
    return legacyFormatData;
  };

  const analysisData = getAnalysisData();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent key={scoreData?.id} className="max-w-4xl max-h-[80vh]">
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
            {/* Overall AI Service Score */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="h-6 w-6 text-purple-600" />
                <h3 className="text-lg font-semibold text-purple-900">
                  AI Service Analysis Results
                </h3>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-purple-600 mb-2">
                  {scoreData.score ||
                    explanation?.scores?.overall ||
                    explanation?.overall ||
                    0}
                  %
                </div>
                <div className="text-sm text-purple-700 font-medium">
                  AI Service Score
                </div>
                {explanation?.recommendation && (
                  <div className="mt-3">
                    <Badge
                      variant={
                        explanation.recommendation === "STRONG_FIT"
                          ? "default"
                          : explanation.recommendation === "GOOD_FIT"
                            ? "secondary"
                            : explanation.recommendation === "CONSIDER"
                              ? "outline"
                              : "destructive"
                      }
                      className="px-3 py-1"
                    >
                      {explanation.recommendation}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Score Breakdown */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <GrScorecard className="h-4 w-4" />
                Score Breakdown
              </h4>
              <ScoreBreakdown explanation={analysisData} />
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
                        ✅ Matched Required Skills (
                        {skillsMatch.matchedRequired.length})
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {skillsMatch.matchedRequired.map(
                          (skill: string, index: number) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {skill}
                            </Badge>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                {skillsMatch.missingRequired &&
                  skillsMatch.missingRequired.length > 0 && (
                    <div className="mb-4">
                      <Label className="text-sm text-red-600 mb-2 block">
                        ❌ Missing Required Skills (
                        {skillsMatch.missingRequired.length})
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {skillsMatch.missingRequired.map(
                          (skill: string, index: number) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="bg-red-50 text-red-700 border-red-200"
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              {skill}
                            </Badge>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                {skillsMatch.matchedPreferred &&
                  skillsMatch.matchedPreferred.length > 0 && (
                    <div className="mb-4">
                      <Label className="text-sm text-blue-600 mb-2 block">
                        💎 Matched Preferred Skills (
                        {skillsMatch.matchedPreferred.length})
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {skillsMatch.matchedPreferred.map(
                          (skill: string, index: number) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200"
                            >
                              {skill}
                            </Badge>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                {skillsMatch.overallSkillScore !== undefined && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      {skillsMatch.requiredScore !== undefined && (
                        <div>
                          <div className="text-lg font-bold text-green-600">
                            {skillsMatch.requiredScore}%
                          </div>
                          <div className="text-xs text-gray-600">
                            Required Match
                          </div>
                        </div>
                      )}
                      {skillsMatch.preferredScore !== undefined && (
                        <div>
                          <div className="text-lg font-bold text-blue-600">
                            {skillsMatch.preferredScore}%
                          </div>
                          <div className="text-xs text-gray-600">
                            Preferred Match
                          </div>
                        </div>
                      )}
                      <div>
                        <div className="text-lg font-bold text-purple-600">
                          {skillsMatch.overallSkillScore}%
                        </div>
                        <div className="text-xs text-gray-600">
                          Overall Skills
                        </div>
                      </div>
                      {skillsMatch.totalResumeSkills !== undefined && (
                        <div>
                          <div className="text-lg font-bold text-gray-600">
                            {skillsMatch.totalResumeSkills}
                          </div>
                          <div className="text-xs text-gray-600">
                            Total Skills
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <Separator />

            {/* AI Analysis Insights */}
            {explanation && (
              <div>
                <h4 className="font-semibold mb-3">AI Analysis Insights</h4>

                {analysisData.strengths &&
                  analysisData.strengths.length > 0 && (
                    <div className="mb-4">
                      <Label className="text-sm text-green-600 mb-2 block">
                        Strengths
                      </Label>
                      <ul className="space-y-1">
                        {analysisData.strengths.map(
                          (strength: string, index: number) => (
                            <li
                              key={index}
                              className="text-sm text-gray-700 flex items-start gap-2"
                            >
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              {strength}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}

                {analysisData.weaknesses &&
                  analysisData.weaknesses.length > 0 && (
                    <div className="mb-4">
                      <Label className="text-sm text-orange-600 mb-2 block">
                        Areas for Improvement
                      </Label>
                      <ul className="space-y-1">
                        {analysisData.weaknesses.map(
                          (weakness: string, index: number) => (
                            <li
                              key={index}
                              className="text-sm text-gray-700 flex items-start gap-2"
                            >
                              <XCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                              {weakness}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}

                {analysisData.keySkillsMatch &&
                  analysisData.keySkillsMatch.length > 0 && (
                    <div className="mb-4">
                      <Label className="text-sm text-blue-600 mb-2 block">
                        Key Skill Matches
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {analysisData.keySkillsMatch.map(
                          (skill: string, index: number) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200"
                            >
                              {skill}
                            </Badge>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                {analysisData.missingSkills &&
                  analysisData.missingSkills.length > 0 && (
                    <div className="mb-4">
                      <Label className="text-sm text-red-600 mb-2 block">
                        Missing Critical Skills
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {analysisData.missingSkills.map(
                          (skill: string, index: number) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="bg-red-50 text-red-700 border-red-200"
                            >
                              {skill}
                            </Badge>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                {analysisData.summary && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <Label className="text-sm text-blue-800 mb-2 block font-semibold">
                      Summary
                    </Label>
                    <p className="text-sm text-blue-700 leading-relaxed">
                      {analysisData.summary}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
