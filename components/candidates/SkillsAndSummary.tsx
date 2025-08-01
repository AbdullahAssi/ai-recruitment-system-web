import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Code } from "lucide-react";
import { CandidateResume } from "../../hooks/useCandidates";
import { parseJsonField } from "../../lib/candidateUtils";

interface SkillsAndSummaryProps {
  latestResume: CandidateResume | null;
}

export function SkillsAndSummary({ latestResume }: SkillsAndSummaryProps) {
  const skills = parseJsonField(latestResume?.skills_json);

  return (
    <div className="space-y-6">
      {/* Professional Summary */}
      {latestResume?.summary &&
        latestResume.summary !== "Could not extract information" && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                Professional Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                {latestResume.summary}
              </p>
            </CardContent>
          </Card>
        )}

      {/* Skills */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5 text-purple-600" />
            Technical Skills ({skills.length} found)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills
                .filter((skill: string) => skill && skill.trim() !== "")
                .map((skill: string, index: number) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="px-3 py-1 bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors"
                  >
                    {skill}
                  </Badge>
                ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">
              No skills extracted from resume. This could be due to OpenAI
              processing or empty skills data.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
