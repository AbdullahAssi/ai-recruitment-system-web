"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  ArrowLeft,
  Download,
  Briefcase,
  MapPin,
  ExternalLink,
  Github,
  Linkedin,
  Award,
  GraduationCap,
  Code,
  Building,
  Clock,
  Star,
  Target,
} from "lucide-react";
import { format } from "date-fns";

interface CandidateProfile {
  id: string;
  name: string;
  email: string;
  experience: number;
  createdAt: string;
  resumes: {
    id: string;
    fileName: string;
    filePath: string;
    uploadDate: string;
    extractedText: string;
    name?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    github?: string;
    skills_json?: string;
    experience_json?: string;
    projects_json?: string;
    certifications_json?: string;
    education_level?: string;
    experience_years?: number;
    summary?: string;
  }[];
  applications: {
    id: string;
    score: number;
    status: string;
    appliedAt: string;
    job: {
      id: string;
      title: string;
      location: string;
      company: string;
    };
  }[];
}

export default function CandidateProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const candidateId = params.id as string;

  useEffect(() => {
    if (candidateId) {
      fetchCandidateProfile();
    }
  }, [candidateId]);

  const fetchCandidateProfile = async () => {
    try {
      const response = await fetch(`/api/candidates/${candidateId}`);
      const data = await response.json();

      if (data.success) {
        setCandidate(data.candidate);
      } else {
        toast({
          title: "Failed to Load Profile",
          description: data.error || "Could not fetch candidate profile",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching candidate profile:", error);
      toast({
        title: "Failed to Load Profile",
        description: "An error occurred while loading the profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadResume = async (resumeId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/resumes/${resumeId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast({
          title: "Download Started",
          description: `Downloading ${fileName}`,
        });
      }
    } catch (error) {
      console.error("Error downloading resume:", error);
      toast({
        title: "Download Failed",
        description: "Could not download the resume",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "reviewed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "shortlisted":
        return "bg-green-100 text-green-800 border-green-200";
      case "interviewed":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const parseJsonField = (jsonString: string | undefined) => {
    if (!jsonString) return [];
    try {
      const parsed = JSON.parse(jsonString);
      // Handle case where parsed data is null or not an array
      if (!parsed || !Array.isArray(parsed)) return [];
      // Filter out null, undefined, or empty strings
      return parsed.filter(
        (item) => item !== null && item !== undefined && item !== ""
      );
    } catch {
      return [];
    }
  };

  const parseWorkExperienceField = (jsonString: string | undefined) => {
    if (!jsonString) return [];
    try {
      const parsed = JSON.parse(jsonString);
      // Handle case where parsed data is null or not an array
      if (!parsed || !Array.isArray(parsed)) return [];
      // Filter out null, undefined, or empty objects for work experience
      return parsed.filter(
        (item) =>
          item &&
          typeof item === "object" &&
          item !== null &&
          Object.keys(item).length > 0
      );
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading candidate profile...</p>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Candidate Not Found
          </h3>
          <p className="text-gray-600 mb-4">
            The requested candidate profile could not be found.
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back 
          </Button>
        </div>
      </div>
    );
  }

  // Get the most recent resume with extracted data
  const latestResume =
    candidate.resumes.find((resume) => resume.skills_json || resume.name) ||
    candidate.resumes[0];

  const skills = parseJsonField(latestResume?.skills_json);
  const workExperience = parseWorkExperienceField(
    latestResume?.experience_json
  );
  const projects = parseJsonField(latestResume?.projects_json);
  const certifications = parseJsonField(latestResume?.certifications_json);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Candidates
          </Button>

          <div className="flex gap-2">
            {latestResume && (
              <Button
                onClick={() =>
                  downloadResume(latestResume.id, latestResume.fileName)
                }
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Resume
              </Button>
            )}
          </div>
        </div>

        {/* Profile Header */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
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
                    {latestResume?.experience_years ||
                      candidate.experience}{" "}
                    years experience
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

        {/* Debug Information */}
        {/* <Card className="mb-6 shadow-lg bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">Debug Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <strong>Resume Name:</strong>{" "}
              {latestResume?.name || "Not extracted"}
            </div>
            <div>
              <strong>Resume Email:</strong>{" "}
              {latestResume?.email || "Not extracted"}
            </div>
            <div>
              <strong>Skills JSON:</strong>{" "}
              {latestResume?.skills_json || "Empty"}
            </div>
            <div>
              <strong>Parsed Skills Count:</strong> {skills.length}
            </div>
            <div>
              <strong>Experience JSON:</strong>{" "}
              {latestResume?.experience_json || "Empty"}
            </div>
            <div>
              <strong>Parsed Experience Count:</strong> {workExperience.length}
            </div>
            <div>
              <strong>Projects JSON:</strong>{" "}
              {latestResume?.projects_json || "Empty"}
            </div>
            <div>
              <strong>Parsed Projects Count:</strong> {projects.length}
            </div>
            <div>
              <strong>Certifications JSON:</strong>{" "}
              {latestResume?.certifications_json || "Empty"}
            </div>
            <div>
              <strong>Parsed Certifications Count:</strong>{" "}
              {certifications.length}
            </div>
            <div>
              <strong>Summary:</strong>{" "}
              {latestResume?.summary || "Not extracted"}
            </div>
            <div>
              <strong>Education Level:</strong>{" "}
              {latestResume?.education_level || "Not extracted"}
            </div>
            <div>
              <strong>LinkedIn:</strong>{" "}
              {latestResume?.linkedin || "Not extracted"}
            </div>
            <div>
              <strong>GitHub:</strong> {latestResume?.github || "Not extracted"}
            </div>
          </CardContent>
        </Card> */}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
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

            {/* Work Experience */}
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
                    .filter(
                      (exp: any) =>
                        exp &&
                        (exp.position || exp.title || exp.role || exp.company)
                    )
                    .map((exp: any, index: number) => (
                      <div
                        key={index}
                        className="border-l-4 border-purple-200 pl-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {exp.position ||
                                exp.title ||
                                exp.role ||
                                "Position"}
                            </h4>
                            <p className="text-purple-600 font-medium">
                              {exp.company || "Company"}
                            </p>
                          </div>
                          <div className="text-right text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {exp.duration ||
                                exp.period ||
                                exp.years ||
                                "Duration"}
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
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {exp.description}
                          </p>
                        )}
                        {exp.technologies &&
                          Array.isArray(exp.technologies) && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {exp.technologies
                                .filter(
                                  (tech: string) => tech && tech.trim() !== ""
                                )
                                .map((tech: string, techIndex: number) => (
                                  <Badge
                                    key={techIndex}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {tech}
                                  </Badge>
                                ))}
                            </div>
                          )}
                      </div>
                    ))
                ) : (
                  <p className="text-gray-500 italic">
                    No work experience extracted from resume.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Projects */}
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
                    .filter(
                      (project: string) => project && project.trim() !== ""
                    )
                    .map((project: string, index: number) => {
                      // Parse project string - format is typically "Title: Description"
                      const colonIndex = project.indexOf(":");
                      const title =
                        colonIndex > 0
                          ? project.substring(0, colonIndex).trim()
                          : project.trim();
                      const description =
                        colonIndex > 0
                          ? project.substring(colonIndex + 1).trim()
                          : "";

                      return (
                        <div
                          key={index}
                          className="border p-4 rounded-lg bg-gray-50"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gray-900">
                              {title}
                            </h4>
                          </div>
                          {description && (
                            <p className="text-gray-700 text-sm mb-2">
                              {description}
                            </p>
                          )}
                        </div>
                      );
                    })
                ) : (
                  <p className="text-gray-500 italic">
                    No projects extracted from resume.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Certifications */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  Certifications ({certifications.length} found)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {certifications.length > 0 ? (
                  certifications
                    .filter((cert: string) => cert && cert.trim() !== "")
                    .map((cert: string, index: number) => {
                      // Parse certification string - format is typically "Course Name - Provider"
                      const dashIndex = cert.lastIndexOf(" - ");
                      const name =
                        dashIndex > 0
                          ? cert.substring(0, dashIndex).trim()
                          : cert.trim();
                      const issuer =
                        dashIndex > 0
                          ? cert.substring(dashIndex + 3).trim()
                          : "";

                      return (
                        <div
                          key={index}
                          className="border-b border-gray-200 pb-3 last:border-b-0"
                        >
                          <h4 className="font-medium text-gray-900">{name}</h4>
                          {issuer && (
                            <p className="text-sm text-purple-600">{issuer}</p>
                          )}
                        </div>
                      );
                    })
                ) : (
                  <p className="text-gray-500 italic">
                    No certifications extracted from resume.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Application History */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  Application History
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {candidate.applications.length > 0 ? (
                  candidate.applications.map((application) => (
                    <div
                      key={application.id}
                      className="border p-3 rounded-lg bg-gray-50"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {application.job.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {application.job.company}
                          </p>
                        </div>
                        <div className="text-right">
                          <div
                            className={`px-2 py-1 rounded text-sm font-semibold ${getScoreColor(
                              application.score
                            )}`}
                          >
                            {application.score}%
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <Badge className={getStatusColor(application.status)}>
                          {application.status}
                        </Badge>
                        <span className="text-xs text-gray-600">
                          {format(
                            new Date(application.appliedAt),
                            "MMM dd, yyyy"
                          )}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No applications yet
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Resume Files */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Resume Files
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {candidate.resumes.map((resume) => (
                  <div
                    key={resume.id}
                    className="flex justify-between items-center p-3 border rounded-lg bg-gray-50"
                  >
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">
                        {resume.fileName}
                      </h4>
                      <p className="text-xs text-gray-600">
                        {format(new Date(resume.uploadDate), "MMM dd, yyyy")}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadResume(resume.id, resume.fileName)}
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
