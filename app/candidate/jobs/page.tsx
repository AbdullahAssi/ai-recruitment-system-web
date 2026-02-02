"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ServerPagination } from "@/components/reusables";
import {
  MapPin,
  Briefcase,
  Building2,
  Search,
  CheckCircle,
  EyeIcon,
} from "lucide-react";
import Link from "next/link";
import { CompanyInfoCard } from "@/components/common/CompanyInfoCard";
import { BsEyeFill } from "react-icons/bs";

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

interface JobsData {
  jobs: Job[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function CandidateJobsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<JobsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [paginationState, setPaginationState] = useState({
    currentPage: 1,
    itemsPerPage: 9,
  });

  useEffect(() => {
    fetchJobs();
  }, [paginationState.currentPage, paginationState.itemsPerPage, searchTerm]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: paginationState.currentPage.toString(),
        limit: paginationState.itemsPerPage.toString(),
        status: "active", // Only fetch active jobs for candidates
      });

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const response = await fetch(`/api/jobs?${params.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        // Check if user has applied to these jobs
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
            const jobsWithAppliedStatus = result.jobs.map((job: Job) => ({
              ...job,
              hasApplied: appliedJobIds.has(job.id),
            }));

            setData({
              jobs: jobsWithAppliedStatus,
              pagination: result.pagination,
            });
          } else {
            setData({
              jobs: result.jobs,
              pagination: result.pagination,
            });
          }
        } else {
          setData({
            jobs: result.jobs,
            pagination: result.pagination,
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPaginationState((prev) => ({ ...prev, currentPage: 1 }));
  };

  const jobs = data?.jobs || [];

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
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Jobs List */}
      {loading ? (
       <div className="min-h-[50vh]   flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Jobs...</p>
        </div>
      </div>
      ) : jobs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No jobs found</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
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
                    <Button className="w-full "> 
                      <EyeIcon className="w-4 h-4 mr-2" />
                      View Details</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>

          {/* Server-Side Pagination */}
          {data?.pagination && data.pagination.totalPages > 1 && (
            <Card className="mt-6">
              <CardContent className="p-4">
                <ServerPagination
                  pagination={data.pagination}
                  onPageChange={(page) =>
                    setPaginationState((prev) => ({ ...prev, currentPage: page }))
                  }
                  onLimitChange={(limit) =>
                    setPaginationState((prev) => ({
                      ...prev,
                      itemsPerPage: limit,
                      currentPage: 1,
                    }))
                  }
                  loading={loading}
                  showFirstLast={true}
                />
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
