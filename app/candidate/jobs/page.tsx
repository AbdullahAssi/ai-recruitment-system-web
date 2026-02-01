"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  Briefcase,
  Building2,
  Search,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { CompanyInfoCard } from "@/components/common/CompanyInfoCard";

interface Company {
  id: string;
  name: string;
  logo?: string | null;
  industry?: string | null;
  size?: string | null;
  location?: string | null;
  website?: string | null;
  isVerified?: boolean;
}

interface Job {
  id: string;
  title: string;
  company?: string;
  location?: string;
  description: string;
  postedDate: string;
  isActive: boolean;
  companyInfo?: Company | null;
  hasApplied?: boolean;
}

export default function CandidateJobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user?.candidate?.id) {
      fetchJobs();
    }
  }, [user]);

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/jobs");
      const data = await response.json();
      if (data.success) {
        const activeJobs = data.jobs.filter((job: Job) => job.isActive);

        // Fetch user's applications to check if they've applied
        if (user?.candidate?.id) {
          const applicationsResponse = await fetch(
            `/api/applications?candidateId=${user.candidate.id}`,
          );
          const applicationsData = await applicationsResponse.json();

          if (applicationsData.success) {
            const appliedJobIds = new Set(
              applicationsData.applications.map((app: any) => app.jobId),
            );

            // Mark jobs as applied
            const jobsWithAppliedStatus = activeJobs.map((job: Job) => ({
              ...job,
              hasApplied: appliedJobIds.has(job.id),
            }));

            setJobs(jobsWithAppliedStatus);
          } else {
            setJobs(activeJobs);
          }
        } else {
          setJobs(activeJobs);
        }
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.companyInfo?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Browse Jobs</h1>
        <p className="text-gray-600 mt-2">
          Find your next opportunity from our open positions
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="text"
          placeholder="Search jobs by title, company, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading jobs...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No jobs found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <Card
              key={job.id}
              className="hover:shadow-lg transition-shadow flex flex-col"
            >
              <CardContent className="p-6 flex-1 flex flex-col">
                {/* Company Info */}
                {/* {job.companyInfo && (
                  <div className="mb-4">
                    <CompanyInfoCard
                      company={job.companyInfo}
                      variant="compact"
                    />
                  </div>
                )} */}

                {/* Job Info */}
                <div className="mb-4 flex-1">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                      {job.title}
                    </h3>
                    {job.hasApplied && (
                      <Badge className="bg-blue-100 text-blue-800 shrink-0">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Applied
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 text-sm text-gray-600 mb-3">
                    {(job.companyInfo?.name || job.company) && (
                      <span className="flex items-center">
                        <Building2 className="w-4 h-4 mr-1 shrink-0" />
                        <span className="truncate">
                          {job.companyInfo?.name || job.company}
                        </span>
                      </span>
                    )}
                    {job.location && (
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1 shrink-0" />
                        <span className="truncate">{job.location}</span>
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 text-sm line-clamp-3">
                    {job.description}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex flex-col gap-3 pt-4 border-t mt-auto">
                  <span className="text-xs text-gray-500">
                    Posted {new Date(job.postedDate).toLocaleDateString()}
                  </span>
                  <Link href={`/candidate/jobs/${job.id}`} className="w-full">
                    <Button className="w-full">View Details</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
