import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building } from "lucide-react";
import { CandidateResume } from "../../hooks/useCandidates";
import { parseJsonField } from "../../lib/candidateUtils";

interface ProjectsCardProps {
  latestResume: CandidateResume | null;
}

export function ProjectsCard({ latestResume }: ProjectsCardProps) {
  const projects = parseJsonField(latestResume?.projects_json);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="w-5 h-5 text-purple-600" />
          Projects ({projects.length} found)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {projects.length > 0 ? (
          projects
            .map((project: any) => {
              // Handle Object format (Preferred)
              if (typeof project === "object" && project !== null) {
                return {
                  title: project.name || "Untitled Project",
                  description: project.description || "",
                  technologies: Array.isArray(project.technologies)
                    ? project.technologies
                    : [],
                };
              }
              // Handle String format "Title: Description" (Legacy)
              if (typeof project === "string") {
                if (!project.trim()) return null;
                const colonIndex = project.indexOf(":");
                const title =
                  colonIndex > 0
                    ? project.substring(0, colonIndex).trim()
                    : project.trim();
                const description =
                  colonIndex > 0
                    ? project.substring(colonIndex + 1).trim()
                    : "";
                return { title, description, technologies: [] };
              }
              return null;
            })
            .filter((p: any) => p !== null)
            .map((project: any, index: number) => (
              <div key={index} className="border p-4 rounded-lg bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900">
                    {project.title}
                  </h4>
                </div>
                {project.description && (
                  <p className="text-gray-700 text-sm mb-2">
                    {project.description}
                  </p>
                )}
                {project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {project.technologies.map((tech: string, i: number) => (
                      <span
                        key={i}
                        className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
        ) : (
          <p className="text-gray-500 italic">
            No projects extracted from resume.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
