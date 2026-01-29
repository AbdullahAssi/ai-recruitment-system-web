"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  Building2,
  CheckCircle2,
  FileText,
  Users,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { JobApplicationDialog } from "@/components/jobs/JobApplicationDialog";
import { CompanyInfoCard } from "@/components/common/CompanyInfoCard";

interface Company {
  id: string;
  name: string;
  logo?: string | null;
  industry?: string | null;
  size?: string | null;
  location?: string | null;
  website?: string | null;
  description?: string | null;
  foundedYear?: number | null;
  isVerified?: boolean;
}

interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string;
  responsibilities: string;
  location: string;
  employmentType: string;
  experienceLevel: string;
  salaryRange?: string;
  department?: string;
  benefits?: string;
  deadline?: string;
  isActive: boolean;
  createdAt: string;
  companyInfo?: Company | null;
  _count: {
    applications: number;
  };
}

interface Application {
  id: string;
  status: string;
  appliedAt: string;
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
  const [primaryResume, setPrimaryResume] = useState<any>(null);

  useEffect(() => {
    fetchJobDetails();
    if (user?.candidate?.id) {
      fetchPrimaryResume();
    }
  }, [jobId, user]);

  const fetchPrimaryResume = async () => {
    if (!user?.candidate?.id) return;

    try {
      const response = await fetch(`/api/candidates/${user.candidate.id}`);
      const data = await response.json();

      if (data.success && data.candidate.primaryResume) {
        setPrimaryResume(data.candidate.primaryResume);
      }
    } catch (error) {
      console.error("Error fetching primary resume:", error);
    }
  };

  const fetchJobDetails = async () => {
    try {
      setLoading(true);

      // Fetch job details
      const jobResponse = await fetch(`/api/jobs/${jobId}`, {
        credentials: "include",
      });

      if (!jobResponse.ok) {
        throw new Error("Failed to fetch job details");
      }

      const jobData = await jobResponse.json();
      setJob(jobData);

      // Check if already applied
      if (user?.candidate?.id) {
        const appResponse = await fetch(
          `/api/jobs/${jobId}/application?candidateId=${user.candidate.id}`,
          {
            credentials: "include",
          },
        );

        if (appResponse.ok) {
          const appData = await appResponse.json();
          // Fix logic: check if explicitly null in response
          if (appData.application === null) {
            setApplication(null);
          } else {
            // Otherwise it's the application object directly
            setApplication(appData);
          }
        }
      }
    } catch (error: any) {
      console.error("Error fetching job details:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load job details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user?.candidate?.id) {
      toast({
        title: "Profile Required",
        description: "Please complete your profile before applying",
        variant: "destructive",
      });
      router.push("/candidate/profile");
      return;
    }

    try {
      // Check for quiz first
      const quizCheckResponse = await fetch(`/api/jobs/${jobId}/quiz`);
      if (quizCheckResponse.ok) {
        const quizData = await quizCheckResponse.json();
        // If quiz exists and hasn't been passed (or strictly if it exists, depending on reqs)
        if (quizData.quiz && !quizData.hasAttempted) {
          toast({
            title: "Quiz Required",
            description:
              "You must complete the skill quiz to apply for this position.",
          });
          router.push(
            `/candidates/quizzes/${quizData.quiz.id}/start?jobId=${jobId}`,
          );
          return;
        }
      }

      // Open application dialog
      setShowApplicationDialog(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start application",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
        <p className="text-gray-600 mb-6">
          The job you're looking for doesn't exist or has been removed.
        </p>
        <Link href="/candidate/jobs">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Button>
        </Link>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "PENDING":
        return "secondary";
      case "SCREENING":
        return "default";
      case "INTERVIEW_SCHEDULED":
        return "default";
      case "SHORTLISTED":
        return "default";
      case "ACCEPTED":
        return "default";
      case "REJECTED":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    return status ? status.replace(/_/g, " ") : "N/A";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/candidate/jobs">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Button>
        </Link>

        {!job.isActive && (
          <Badge variant="destructive">No Longer Accepting Applications</Badge>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Job Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Info */}
          {job.companyInfo && (
            <CompanyInfoCard company={job.companyInfo} showDescription={true} />
          )}

          {/* Job Header */}
          <Card>
            <CardHeader>
              <div className="space-y-4">
                <div>
                  <CardTitle className="text-3xl">{job.title}</CardTitle>
                  {job.department && (
                    <p className="text-lg text-gray-600 mt-2">
                      {job.department}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    {job.employmentType}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {job.experienceLevel}
                  </div>
                  {job.salaryRange && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      {job.salaryRange}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">
                    Posted on {formatDate(job.createdAt)}
                  </span>
                  {job.deadline && (
                    <>
                      <span className="text-gray-400">•</span>
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">
                        Deadline: {formatDate(job.deadline)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: job.description }}
              />
            </CardContent>
          </Card>

          {/* Responsibilities */}
          <Card>
            <CardHeader>
              <CardTitle>Key Responsibilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: job.responsibilities }}
              />
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Requirements & Qualifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: job.requirements }}
              />
            </CardContent>
          </Card>

          {/* Benefits */}
          {job.benefits && (
            <Card>
              <CardHeader>
                <CardTitle>Benefits & Perks</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: job.benefits }}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Application Section */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {application ? (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status:</span>
                      <Badge
                        variant={getStatusBadgeVariant(application.status)}
                      >
                        {getStatusLabel(application.status)}
                      </Badge>
                    </div>

                    <Separator />

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>
                        Applied on {formatDate(application.appliedAt)}
                      </span>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-900">
                        Your application has been submitted successfully. We'll
                        notify you of any updates.
                      </p>
                    </div>

                    <Link href="/candidate/applications" className="block">
                      <Button variant="outline" className="w-full">
                        <FileText className="mr-2 h-4 w-4" />
                        View Application
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>
                        {job._count.applications} applications received
                      </span>
                    </div>

                    {job.isActive ? (
                      <>
                        <Separator />

                        <div className="space-y-3">
                          <p className="text-sm text-gray-600">
                            Ready to take the next step in your career? Apply
                            now to join our team!
                          </p>

                          <Button
                            onClick={handleApply}
                            className="w-full"
                            size="lg"
                          >
                            Apply Now
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-sm text-gray-700">
                          This position is no longer accepting applications.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Application Dialog */}
      {user?.candidate?.id && job && (
        <JobApplicationDialog
          isOpen={showApplicationDialog}
          onClose={() => setShowApplicationDialog(false)}
          jobId={job.id}
          jobTitle={job.title}
          candidateId={user.candidate.id}
          userName={user.name || ""}
          userEmail={user.email || ""}
          userExperience={user.candidate.experience || 0}
          primaryResume={primaryResume}
          onApplicationSuccess={() => {
            fetchJobDetails();
          }}
        />
      )}
    </div>
  );
}
