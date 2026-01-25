"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Briefcase, MapPin, Calendar, Loader2 } from "lucide-react";
import Link from "next/link";

interface Application {
  id: string;
  status: string;
  appliedAt: string;
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
        return "secondary";
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
        <div className="grid gap-4">
          {applications.map((application) => (
            <Card
              key={application.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link
                      href={`/candidate/jobs/${application.job.id}`}
                      className="hover:underline"
                    >
                      <h3 className="text-lg font-semibold text-gray-900">
                        {application.job.title}
                      </h3>
                    </Link>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {application.job.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Applied on {formatDate(application.appliedAt)}
                      </div>
                    </div>
                  </div>
                  <Badge variant={getStatusBadgeVariant(application.status)}>
                    {application.status?.replace(/_/g, " ") || "Pending"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
