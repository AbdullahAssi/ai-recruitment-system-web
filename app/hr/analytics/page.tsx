"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Briefcase,
  FileText,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
} from "lucide-react";

interface AnalyticsData {
  candidates: {
    total: number;
    thisMonth: number;
    withResumes: number;
    activeApplications: number;
  };
  jobs: {
    total: number;
    active: number;
    thisMonth: number;
    totalApplications: number;
  };
  applications: {
    total: number;
    pending: number;
    reviewed: number;
    shortlisted: number;
    rejected: number;
    thisWeek: number;
  };
  topPerformingJobs: Array<{
    id: string;
    title: string;
    location: string;
    applicationCount: number;
    averageScore: number;
  }>;
  recentActivity: Array<{
    type: "application" | "candidate" | "job";
    message: string;
    timestamp: string;
  }>;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/analytics");
      const data = await response.json();

      if (data.success) {
        setAnalytics(data.analytics);
      } else {
        toast({
          title: "Failed to Load Analytics",
          description: data.error || "Could not fetch analytics data",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast({
        title: "Failed to Load Analytics",
        description: "An error occurred while loading analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "reviewed":
        return "bg-blue-100 text-blue-800";
      case "shortlisted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <TrendingUp className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Analytics Data
          </h3>
          <p className="text-gray-600">
            Analytics data is not available at the moment
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            HR Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Track hiring metrics and performance insights
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Candidates
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.candidates.total}
              </div>
              <p className="text-xs text-gray-600">
                +{analytics.candidates.thisMonth} this month
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.jobs.active}</div>
              <p className="text-xs text-gray-600">
                {analytics.jobs.total} total jobs
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Applications
              </CardTitle>
              <FileText className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.applications.total}
              </div>
              <p className="text-xs text-gray-600">
                +{analytics.applications.thisWeek} this week
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.applications.shortlisted}
              </div>
              <p className="text-xs text-gray-600">
                {analytics.applications.pending} pending review
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Application Status Breakdown */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Application Status Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <span>Pending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {analytics.applications.pending}
                    </span>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {(
                        (analytics.applications.pending /
                          analytics.applications.total) *
                        100
                      ).toFixed(1)}
                      %
                    </Badge>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <span>Reviewed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {analytics.applications.reviewed}
                    </span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {(
                        (analytics.applications.reviewed /
                          analytics.applications.total) *
                        100
                      ).toFixed(1)}
                      %
                    </Badge>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Shortlisted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {analytics.applications.shortlisted}
                    </span>
                    <Badge className="bg-green-100 text-green-800">
                      {(
                        (analytics.applications.shortlisted /
                          analytics.applications.total) *
                        100
                      ).toFixed(1)}
                      %
                    </Badge>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span>Rejected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {analytics.applications.rejected}
                    </span>
                    <Badge className="bg-red-100 text-red-800">
                      {(
                        (analytics.applications.rejected /
                          analytics.applications.total) *
                        100
                      ).toFixed(1)}
                      %
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Top Performing Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topPerformingJobs.map((job) => (
                  <div key={job.id} className="border-b pb-3 last:border-b-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium text-sm">{job.title}</h4>
                      <Badge className="bg-purple-100 text-purple-800">
                        {job.applicationCount} apps
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{job.location}</p>
                    <div className="text-xs text-green-600 font-medium">
                      Avg Score: {job.averageScore.toFixed(1)}%
                    </div>
                  </div>
                ))}

                {analytics.topPerformingJobs.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No job performance data available yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="mt-1">
                    {activity.type === "application" && (
                      <FileText className="w-4 h-4 text-blue-600" />
                    )}
                    {activity.type === "candidate" && (
                      <Users className="w-4 h-4 text-green-600" />
                    )}
                    {activity.type === "job" && (
                      <Briefcase className="w-4 h-4 text-purple-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              ))}

              {analytics.recentActivity.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">
                  No recent activity to display
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
