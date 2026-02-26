"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ServerPagination, LoadingState } from "@/components/reusables";
import {
  MapPin,
  Briefcase,
  Building2,
  Search,
  CheckCircle,
  ArrowRight,
  Calendar,
} from "lucide-react";
import Link from "next/link";

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

  // Debounce the search input so the API is only called 400 ms after the
  // user stops typing.
  const debouncedSearch = useDebounce(searchTerm, 400);

  // Reset to page 1 when the debounced search value changes so we only
  // fire one API call (not one for the page reset + one for the new term).
  useEffect(() => {
    setPaginationState((prev) => ({ ...prev, currentPage: 1 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: paginationState.currentPage.toString(),
        limit: paginationState.itemsPerPage.toString(),
        status: "active", // Only fetch active jobs for candidates
      });

      if (debouncedSearch) {
        params.append("search", debouncedSearch);
      }

      // Fire both requests in parallel to halve the round-trip time.
      const [jobsResponse, applicationsResponse] = await Promise.all([
        fetch(`/api/jobs?${params.toString()}`),
        user?.candidate?.id
          ? fetch(`/api/applications?candidateId=${user.candidate.id}`)
          : Promise.resolve(null),
      ]);

      const result = await jobsResponse.json();
      const applicationsData = applicationsResponse
        ? await applicationsResponse.json()
        : null;

      if (result.success) {
        if (applicationsData?.success) {
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
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    paginationState.currentPage,
    paginationState.itemsPerPage,
    debouncedSearch,
    user?.candidate?.id,
  ]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // No need to reset page here — the useEffect on debouncedSearch handles it.
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  // Stable pagination callbacks
  const handlePageChange = useCallback(
    (page: number) =>
      setPaginationState((prev) => ({ ...prev, currentPage: page })),
    [],
  );
  const handleLimitChange = useCallback(
    (limit: number) =>
      setPaginationState((prev) => ({
        ...prev,
        itemsPerPage: limit,
        currentPage: 1,
      })),
    [],
  );

  const jobs = useMemo(() => data?.jobs || [], [data?.jobs]);

  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-6rem)]">
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
          className="pl-10 focus-visible:ring-brand"
        />
      </div>

      {/* Jobs List */}
      <div className="flex-1">
        {loading ? (
          <LoadingState variant="page" message="Loading jobs..." />
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
              {jobs.map((job) => {
                const companyName = job.companyInfo?.name || job.company || "";
                const initials = companyName
                  ? companyName.slice(0, 2).toUpperCase()
                  : "?";

                return (
                  <div
                    key={job.id}
                    className="group relative bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden min-h-[320px]"
                  >
                    {/* Brand accent bar */}
                    {/* <div className="h-1 w-full bg-gradient-to-r from-brand to-brand-light" /> */}

                    <div className="p-5 flex-1 flex flex-col">
                      {/* Card header: avatar + title + applied badge */}
                      <div className="flex items-start gap-3 mb-2">
                        {/* Company avatar / logo */}
                        {job.companyInfo?.logo ? (
                          <img
                            src={job.companyInfo.logo}
                            alt={companyName}
                            className="flex-shrink-0 w-10 h-10 rounded-lg object-contain border border-gray-100 bg-white p-0.5"
                          />
                        ) : (
                          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-50 border border-brand-200 flex items-center justify-center">
                            <span className="text-sm font-bold text-brand">
                              {initials}
                            </span>
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-gray-900 text-base leading-snug line-clamp-2 group-hover:text-brand transition-colors">
                              {job.title}
                            </h3>
                            {job.hasApplied && (
                              <Badge className="bg-brand-50 text-brand border border-brand-200 shrink-0 text-[10px] px-1.5 py-0.5">
                                <CheckCircle className="w-2.5 h-2.5 mr-1" />
                                Applied
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Meta chips — own row, always single line, never wraps into header */}
                      <div className="flex gap-1.5 mb-3 overflow-hidden">
                        {companyName && (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-2.5 py-1 min-w-0 shrink">
                            <Building2 className="w-3 h-3 shrink-0" />
                            <span className="truncate">{companyName}</span>
                          </span>
                        )}
                        {job.location && (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-2.5 py-1 min-w-0 shrink">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="truncate">{job.location}</span>
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-gray-500 text-sm leading-relaxed line-clamp-5 flex-1">
                        {job.description}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                        <Calendar className="w-3 h-3" />
                        {new Date(job.postedDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <Link href={`/candidate/jobs/${job.id}`}>
                        <Button
                          size="sm"
                          className="bg-brand hover:bg-brand-light text-brand-foreground text-xs px-3 h-7 gap-1"
                        >
                          View
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Server-Side Pagination */}
            {data?.pagination && data.pagination.totalPages > 1 && (
              <ServerPagination
                className="mt-6"
                pagination={data.pagination}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
                loading={loading}
                showFirstLast={true}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
