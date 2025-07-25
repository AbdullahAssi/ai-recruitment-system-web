"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  Area,
  AreaChart,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  Briefcase,
  FileText,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
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

// Chart configuration
const chartConfig = {
  pending: {
    label: "Pending",
    color: "#f59e0b",
  },
  reviewed: {
    label: "Reviewed",
    color: "#3b82f6",
  },
  shortlisted: {
    label: "Shortlisted",
    color: "#10b981",
  },
  rejected: {
    label: "Rejected",
    color: "#ef4444",
  },
  applications: {
    label: "Applications",
    color: "#8b5cf6",
  },
  candidates: {
    label: "Candidates",
    color: "#06b6d4",
  },
};

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/analytics", {
        cache: "no-store", // Bypass cache for fresh data
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setAnalytics(data.analytics);
      } else {
        throw new Error(data.error || "Could not fetch analytics data");
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast({
        title: "Failed to Load Analytics",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while loading analytics data",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1"></div>
            <div className="flex-1 text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                HR Analytics Dashboard
              </h1>
            </div>
            <div className="flex-1 flex justify-end">
              <Button
                onClick={fetchAnalytics}
                disabled={loading}
                variant="default"
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                title="Refresh analytics data"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </div>
          <p className="text-gray-600 text-lg">
            Track hiring metrics and performance insights
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">
                Total Candidates
              </CardTitle>
              <div className="p-2 bg-blue-500 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">
                {analytics.candidates.total.toLocaleString()}
              </div>
              <p className="text-sm text-blue-600 flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />+
                {analytics.candidates.thisMonth} this month
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-gradient-to-br from-green-50 to-green-100 hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">
                Active Jobs
              </CardTitle>
              <div className="p-2 bg-green-500 rounded-lg">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">
                {analytics.jobs.active}
              </div>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <Activity className="w-4 h-4 mr-1" />
                {analytics.jobs.total} total jobs
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">
                Total Applications
              </CardTitle>
              <div className="p-2 bg-purple-500 rounded-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">
                {analytics.applications.total.toLocaleString()}
              </div>
              <p className="text-sm text-purple-600 flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />+
                {analytics.applications.thisWeek} this week
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-gradient-to-br from-emerald-50 to-emerald-100 hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-700">
                Shortlisted
              </CardTitle>
              <div className="p-2 bg-emerald-500 rounded-lg">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-900">
                {analytics.applications.shortlisted}
              </div>
              <p className="text-sm text-emerald-600 flex items-center mt-1">
                <Clock className="w-4 h-4 mr-1" />
                {analytics.applications.pending} pending review
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Application Status Pie Chart */}
          <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <PieChartIcon className="w-6 h-6 text-blue-600" />
                Application Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[300px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={[
                      {
                        status: "pending",
                        value: analytics.applications.pending,
                        fill: "#f59e0b",
                      },
                      {
                        status: "reviewed",
                        value: analytics.applications.reviewed,
                        fill: "#3b82f6",
                      },
                      {
                        status: "shortlisted",
                        value: analytics.applications.shortlisted,
                        fill: "#10b981",
                      },
                      {
                        status: "rejected",
                        value: analytics.applications.rejected,
                        fill: "#ef4444",
                      },
                    ]}
                    dataKey="value"
                    nameKey="status"
                    innerRadius={60}
                    strokeWidth={5}
                  >
                    <ChartLegend
                      content={<ChartLegendContent nameKey="status" />}
                      className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Top Performing Jobs Bar Chart */}
          <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
                Top Performing Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.topPerformingJobs.length > 0 ? (
                <ChartContainer config={chartConfig} className="max-h-[300px]">
                  <BarChart data={analytics.topPerformingJobs}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="title"
                      tick={{ fontSize: 12 }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="applicationCount"
                      fill="#8b5cf6"
                      radius={[4, 4, 0, 0]}
                      name="Applications"
                    />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No job performance data available yet</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Application Trends and Activity */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Application Status Overview */}
          <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
                Status Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500 rounded-full">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium">Pending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-yellow-700">
                      {analytics.applications.pending}
                    </span>
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                      {(
                        (analytics.applications.pending /
                          analytics.applications.total) *
                        100
                      ).toFixed(1)}
                      %
                    </Badge>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500 rounded-full">
                      <Eye className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium">Reviewed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-blue-700">
                      {analytics.applications.reviewed}
                    </span>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                      {(
                        (analytics.applications.reviewed /
                          analytics.applications.total) *
                        100
                      ).toFixed(1)}
                      %
                    </Badge>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500 rounded-full">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium">Shortlisted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-green-700">
                      {analytics.applications.shortlisted}
                    </span>
                    <Badge className="bg-green-100 text-green-800 border-green-300">
                      {(
                        (analytics.applications.shortlisted /
                          analytics.applications.total) *
                        100
                      ).toFixed(1)}
                      %
                    </Badge>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500 rounded-full">
                      <XCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium">Rejected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-red-700">
                      {analytics.applications.rejected}
                    </span>
                    <Badge className="bg-red-100 text-red-800 border-red-300">
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

          {/* Recruitment Metrics */}
          <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="w-6 h-6 text-green-600" />
                Recruitment Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {analytics.candidates.withResumes}
                  </div>
                  <p className="text-sm text-gray-600">
                    Candidates with Resumes
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          (analytics.candidates.withResumes /
                            analytics.candidates.total) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {analytics.candidates.activeApplications}
                  </div>
                  <p className="text-sm text-gray-600">Active Applications</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          (analytics.candidates.activeApplications /
                            analytics.applications.total) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border">
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    {(
                      (analytics.applications.shortlisted /
                        analytics.applications.total) *
                      100
                    ).toFixed(1)}
                    %
                  </div>
                  <p className="text-sm text-gray-600">Shortlist Rate</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          (analytics.applications.shortlisted /
                            analytics.applications.total) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-6 h-6 text-orange-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {analytics.recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border hover:shadow-md transition-all duration-200"
                  >
                    <div className="mt-1">
                      {activity.type === "application" && (
                        <div className="p-1.5 bg-blue-500 rounded-full">
                          <FileText className="w-3 h-3 text-white" />
                        </div>
                      )}
                      {activity.type === "candidate" && (
                        <div className="p-1.5 bg-green-500 rounded-full">
                          <Users className="w-3 h-3 text-white" />
                        </div>
                      )}
                      {activity.type === "job" && (
                        <div className="p-1.5 bg-purple-500 rounded-full">
                          <Briefcase className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 font-medium leading-relaxed">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                ))}

                {analytics.recentActivity.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No recent activity to display</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
