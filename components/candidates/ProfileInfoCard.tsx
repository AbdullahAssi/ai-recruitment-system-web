import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  ExternalLink,
  Github,
  Linkedin,
  GraduationCap,
} from "lucide-react";
import { format } from "date-fns";
import { CandidateProfile, CandidateResume } from "../../hooks/useCandidates";

interface ProfileInfoCardProps {
  candidate: CandidateProfile;
  latestResume: CandidateResume | null;
}

export function ProfileInfoCard({
  candidate,
  latestResume,
}: ProfileInfoCardProps) {
  return (
    <Card className="mb-6 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-300 to-blue-300 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {latestResume?.name || candidate.name}
            </h1>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {latestResume?.email || candidate.email}
              </div>

              {latestResume?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {latestResume.phone}
                </div>
              )}

              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                {latestResume?.experience_years || candidate.experience} years
                experience
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Joined {format(new Date(candidate.createdAt), "MMM yyyy")}
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-4 mt-4">
              {latestResume?.linkedin && (
                <a
                  href={latestResume.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}

              {latestResume?.github && (
                <a
                  href={latestResume.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Education Level */}
            {latestResume?.education_level &&
              latestResume.education_level !== "Unknown" && (
                <div className="mt-3">
                  <Badge variant="secondary" className="px-3 py-1">
                    <GraduationCap className="w-3 h-3 mr-1" />
                    {latestResume.education_level}
                  </Badge>
                </div>
              )}
          </div>

          {/* Quick Stats */}
          <div className="text-right">
            <div className="grid grid-cols-1 gap-2 text-center">
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {candidate.applications.length}
                </div>
                <div className="text-xs text-gray-600">Applications</div>
              </div>
              <div className="bg-pink-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-pink-600">
                  {candidate.resumes.length}
                </div>
                <div className="text-xs text-gray-600">Resumes</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
