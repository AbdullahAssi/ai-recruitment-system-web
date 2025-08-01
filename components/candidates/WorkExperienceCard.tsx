import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Calendar, MapPin } from "lucide-react";
import { CandidateResume } from "../../hooks/useCandidates";
import { parseWorkExperienceField } from "../../lib/candidateUtils";

interface WorkExperienceCardProps {
  latestResume: CandidateResume | null;
}

export function WorkExperienceCard({ latestResume }: WorkExperienceCardProps) {
  const workExperience = parseWorkExperienceField(latestResume?.experience_json);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-purple-600" />
          Work Experience ({workExperience.length} found)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {workExperience.length > 0 ? (
          workExperience
            .map((exp: any, index: number) => {
              // Handle string format (like "Position at Company: Description")
              if (typeof exp === "string") {
                const parts = exp.split(":");
                const titlePart = parts[0]?.trim() || "Work Experience";
                const description = parts[1]?.trim() || "";

                const atIndex = titlePart.lastIndexOf(" at ");
                const position = atIndex > 0 ? titlePart.substring(0, atIndex).trim() : titlePart;
                const company = atIndex > 0 ? titlePart.substring(atIndex + 4).trim() : "";

                return (
                  <div key={index} className="border-l-4 border-purple-200 pl-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{position}</h4>
                        {company && <p className="text-purple-600 font-medium">{company}</p>}
                      </div>
                    </div>
                    {description && (
                      <p className="text-gray-700 text-sm leading-relaxed">{description}</p>
                    )}
                  </div>
                );
              }

              // Handle object format
              if (exp && typeof exp === "object" && (exp.position || exp.title || exp.role || exp.company)) {
                return (
                  <div key={index} className="border-l-4 border-purple-200 pl-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {exp.position || exp.title || exp.role || "Position"}
                        </h4>
                        <p className="text-purple-600 font-medium">{exp.company || "Company"}</p>
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {exp.duration || exp.period || exp.years || "Duration"}
                        </div>
                        {exp.location && (
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {exp.location}
                          </div>
                        )}
                      </div>
                    </div>
                    {exp.description && (
                      <p className="text-gray-700 text-sm leading-relaxed">{exp.description}</p>
                    )}
                    {exp.technologies && Array.isArray(exp.technologies) && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {exp.technologies
                          .filter((tech: string) => tech && tech.trim() !== "")
                          .map((tech: string, techIndex: number) => (
                            <Badge key={techIndex} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                      </div>
                    )}
                  </div>
                );
              }

              return null;
            })
            .filter(Boolean)
        ) : (
          <p className="text-gray-500 italic">No work experience extracted from resume.</p>
        )}
      </CardContent>
    </Card>
  );
}
