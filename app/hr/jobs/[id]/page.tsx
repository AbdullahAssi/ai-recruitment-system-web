"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  MapPin,
  Building2,
  Calendar,
  Sparkles,
  Users,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { LoadingState } from "@/components/reusables";

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await fetch(`/api/jobs/${jobId}`);
        if (!res.ok) throw new Error("Failed to fetch job");
        const data = await res.json();
        setJob(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  if (loading)
    return <LoadingState variant="page" message="Loading job details..." />;
  if (!job) return <div className="p-8 text-center">Job not found</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <Button variant="ghost" className="mb-4 pl-0" asChild>
          <Link href="/hr/jobs">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Link>
        </Button>
      </div>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{job.title}</h1>
          <div className="flex items-center gap-4 text-muted-foreground mt-2">
            <span className="flex items-center gap-1">
              <Building2 className="w-4 h-4" /> {job.company || "Company"}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" /> {job.location || "Remote"}
            </span>
            <Badge variant={job.isActive ? "default" : "secondary"}>
              {job.isActive ? "Active" : "Closed"}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/hr/jobs/${jobId}/applications`}>
              <Users className="w-4 h-4 mr-2" /> Applications
            </Link>
          </Button>
          <Button
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow"
            asChild
          >
            <Link href={`/hr/jobs/${jobId}/matching`}>
              <Sparkles className="w-4 h-4 mr-2" /> Find Candidates (AI)
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none whitespace-pre-wrap text-sm text-gray-700">
                {job.description}
              </div>
            </CardContent>
          </Card>

          {job.requirements && (
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none whitespace-pre-wrap text-sm text-gray-700">
                  {job.requirements}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">ID</span>
                <span className="font-mono text-xs">{job.id}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Status</span>
                <span>{job.isActive ? "Active" : "Closed"}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Location</span>
                <span>{job.location}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
