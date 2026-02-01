"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Briefcase,
  MapPin,
  Calendar,
  Loader2,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";

interface Application {
  id: string;
  status: string;
  appliedAt: string;
  score?: number;
  quizCompleted?: boolean;
  quizAttempt?: {
    score: number | null;
    passed: boolean;
    completedAt: Date | null;
  } | null;
  job: {
    id: string;
    title: string;
    location: string;
    postedDate: string;
  };
}

export default function CandidateApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user?.candidate?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/applications?candidateId=${user.candidate.id}`,
        );
        const data = await response.json();

        if (data.success) {
          setApplications(data.applications);
        }
      } catch (error) {
        console.error("Failed to fetch applications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "accepted":
      case "hired":
        return "default";
      case "rejected":
        return "destructive";
      case "interview":
      case "quiz_pending":
        return "secondary";
      case "quiz_completed":
        return "outline";
      default:
        return "outline";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-600 mt-2">
            Track the status of your job applications
          </p>
        </div>
        <Link href="/candidate/jobs">
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Briefcase className="w-4 h-4 mr-2" />
            Browse Jobs
          </Button>
        </Link>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No applications yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Start applying to jobs to see them here
            </p>
            <Link href="/candidate/jobs" className="inline-block mt-4">
              <Button variant="outline">Browse Jobs</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((application) => (
            <Card
              key={application.id}
              className="hover:shadow-md transition-shadow flex flex-col"
            >
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-3 gap-2">
                  <Link
                    href={`/candidate/jobs/${application.job.id}`}
                    className="hover:underline flex-1"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {application.job.title}
                    </h3>
                  </Link>
                  <Badge
                    variant={getStatusBadgeVariant(application.status)}
                    className="shrink-0"
                  >
                    {application.status?.replace(/_/g, " ") || "Pending"}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4 flex-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span className="truncate">{application.job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span>Applied on {formatDate(application.appliedAt)}</span>
                  </div>
                  {application.score !== undefined && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 shrink-0" />
                      <span>
                        Match Score:{" "}
                        <span
                          className={`font-semibold ${
                            application.score >= 80
                              ? "text-green-600"
                              : application.score >= 60
                                ? "text-yellow-600"
                                : "text-orange-600"
                          }`}
                        >
                          {application.score}%
                        </span>
                      </span>
                    </div>
                  )}
                  {application.quizAttempt?.completedAt &&
                    application.quizAttempt?.score !== null && (
                      <div className="flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 shrink-0" />
                        <span>
                          Quiz Score:{" "}
                          <span
                            className={`font-semibold ${
                              application.quizAttempt.passed
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {application.quizAttempt.score}%
                          </span>
                        </span>
                      </div>
                    )}
                </div>

                {/* Quiz Action Button */}
                {application.status === "QUIZ_PENDING" && (
                  <div className="mt-auto pt-3 border-t">
                    <Link href={`/candidate/quiz/${application.id}`}>
                      <Button
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 w-full"
                      >
                        <ClipboardList className="w-4 h-4 mr-2" />
                        Take Quiz Assessment
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
