"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
  FaBriefcase,
  FaUserTie,
  FaFileAlt,
  FaClock,
  FaChartLine,
  FaEnvelope,
  FaUsers,
  FaTrophy,
} from "react-icons/fa";
import Link from "next/link";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface DashboardStats {
  stats: {
    totalJobs: number;
    activeJobs: number;
    totalCandidates: number;
    totalApplications: number;
    pendingApplications: number;
    recentApplications: number;
    applicationsGrowth: number;
  };
  applicationsByStatus: Array<{ status: string; count: number }>;
  applicationsTrend: Array<{ date: string; count: number }>;
  topSkills: Array<{ skill: string; count: number }>;
  recentActivity?: Array<{
    id: string;
    type: string;
    candidateName: string;
    jobTitle: string;
    status: string;
    appliedAt: string;
  }>;
}

export default function HRPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(
    null,
  );

  useEffect(() => {
    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/dashboard/stats");
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const stats = dashboardData?.stats || {
    totalJobs: 0,
    activeJobs: 0,
    totalCandidates: 0,
    totalApplications: 0,
    pendingApplications: 0,
    recentApplications: 0,
    applicationsGrowth: 0,
  };

  const statusColors: Record<string, string> = {
    PENDING: "#F59E0B",
    REVIEWED: "#06B6D4",
    SHORTLISTED: "#0a66c2",
    INTERVIEW: "#10B981",
    REJECTED: "#EF4444",
    ACCEPTED: "#059669",
  };

  // Mixed Chart Options (Applications Trend - Column + Line)
  const mixedChartOptions = {
    chart: {
      type: "line" as const,
      height: 300,
      fontFamily: "inherit",
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    stroke: {
      width: [0, 3],
      curve: "smooth" as const,
    },
    fill: {
      opacity: [0.85, 1],
      gradient: {
        inverseColors: false,
        shade: "light",
        type: "vertical",
        opacityFrom: 0.85,
        opacityTo: 0.55,
        stops: [0, 100],
      },
    },
    colors: ["#0a66c2", "#06B6D4"],
    plotOptions: {
      bar: {
        columnWidth: "50%",
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: true,
      enabledOnSeries: [1],
      style: {
        fontSize: "10px",
        colors: ["#fff"],
      },
      background: {
        enabled: true,
        foreColor: "#06B6D4",
        borderRadius: 2,
        padding: 4,
        opacity: 0.9,
      },
    },
    labels:
      dashboardData?.applicationsTrend?.map((item) =>
        new Date(item.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      ) || [],
    xaxis: {
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "11px",
        },
        rotate: -45,
      },
    },
    yaxis: [
      {
        title: {
          text: "Applications",
          style: { color: "#6B7280", fontSize: "12px" },
        },
        labels: {
          style: { colors: "#6B7280", fontSize: "12px" },
          formatter: (val: number) => Math.floor(val).toString(),
        },
      },
    ],
    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 4,
    },
    legend: {
      position: "top" as const,
      horizontalAlign: "right" as const,
      fontSize: "13px",
      markers: {
        size: 10,
        shape: "circle" as const,
      },
      itemMargin: { horizontal: 10 },
    },
    tooltip: {
      theme: "light",
      shared: true,
      intersect: false,
    },
  };

  const mixedChartSeries = [
    {
      name: "Daily Count",
      type: "column" as const,
      data:
        dashboardData?.applicationsTrend?.map((item) => Number(item.count)) ||
        [],
    },
    {
      name: "Trend",
      type: "line" as const,
      data:
        dashboardData?.applicationsTrend?.map((item) => Number(item.count)) ||
        [],
    },
  ];

  // Radial Bar Chart Options (Applications by Status)
  const radialChartOptions = {
    chart: {
      type: "radialBar" as const,
      height: 350,
      fontFamily: "inherit",
    },
    plotOptions: {
      radialBar: {
        offsetY: 0,
        startAngle: 0,
        endAngle: 270,
        hollow: {
          margin: 5,
          size: "30%",
          background: "transparent",
        },
        dataLabels: {
          name: {
            show: true,
            fontSize: "14px",
            fontWeight: 600,
            color: "#6B7280",
            offsetY: -10,
          },
          value: {
            show: true,
            fontSize: "20px",
            fontWeight: 700,
            color: "#111827",
            offsetY: 5,
            formatter: (val: number) => {
              const total =
                dashboardData?.applicationsByStatus?.reduce(
                  (sum, item) => sum + item.count,
                  0,
                ) || 0;
              const count = Math.round((val / 100) * total);
              return count.toString();
            },
          },
          total: {
            show: true,
            label: "Total Apps",
            fontSize: "14px",
            fontWeight: 600,
            color: "#6B7280",
            formatter: () => {
              const total =
                dashboardData?.applicationsByStatus?.reduce(
                  (sum, item) => sum + item.count,
                  0,
                ) || 0;
              return total.toString();
            },
          },
        },
        track: {
          background: "#E5E7EB",
          strokeWidth: "100%",
          margin: 5,
        },
      },
    },
    colors:
      dashboardData?.applicationsByStatus?.map(
        (item) => statusColors[item.status] || "#0a66c2",
      ) || [],
    labels:
      dashboardData?.applicationsByStatus?.map((item) => item.status) || [],
    legend: {
      show: true,
      position: "right" as const,
      offsetY: 40,
      fontSize: "13px",
      fontWeight: 500,
      markers: {
        size: 12,
        shape: "circle" as const,
      },
      itemMargin: {
        vertical: 5,
      },
      formatter: (seriesName: string, opts: any) => {
        const count =
          dashboardData?.applicationsByStatus?.[opts.seriesIndex]?.count || 0;
        return `${seriesName}: ${count}`;
      },
    },
    tooltip: {
      enabled: true,
      theme: "light",
      y: {
        formatter: (value: number) => {
          const total =
            dashboardData?.applicationsByStatus?.reduce(
              (sum, item) => sum + item.count,
              0,
            ) || 0;
          const count = Math.round((value / 100) * total);
          return `${count} applications`;
        },
      },
    },
  };

  const radialChartSeries =
    dashboardData?.applicationsByStatus?.map((item) => {
      const total =
        dashboardData?.applicationsByStatus?.reduce(
          (sum, stat) => sum + stat.count,
          0,
        ) || 1;
      return Math.round((item.count / total) * 100);
    }) || [];

  // Radar Chart Options (Top Skills)
  const radarChartOptions = {
    chart: {
      type: "radar" as const,
      height: 350,
      fontFamily: "inherit",
      toolbar: { show: false },
      dropShadow: {
        enabled: true,
        blur: 4,
        left: 0,
        top: 0,
        opacity: 0.1,
      },
    },
    colors: ["#0a66c2"],
    stroke: {
      width: 2,
      colors: ["#0a66c2"],
    },
    fill: {
      opacity: 0.2,
      colors: ["#0a66c2"],
    },
    markers: {
      size: 4,
      colors: ["#0a66c2"],
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 6,
      },
    },
    xaxis: {
      categories: dashboardData?.topSkills?.map((item) => item.skill) || [],
      labels: {
        show: true,
        style: {
          colors: Array(10).fill("#6B7280"),
          fontSize: "12px",
          fontWeight: 600,
        },
      },
    },
    yaxis: {
      show: true,
      tickAmount: 4,
      labels: {
        style: {
          colors: "#9CA3AF",
          fontSize: "11px",
        },
      },
    },
    tooltip: {
      theme: "light",
      y: {
        formatter: (value: number) => `${value} candidates`,
      },
    },
  };

  const radarChartSeries = [
    {
      name: "Skill Frequency",
      data: dashboardData?.topSkills?.map((item) => Number(item.count)) || [],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Here's what's happening with your recruitment today.
          </p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Jobs Card */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Total Jobs
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {loading ? (
                  <span className="animate-pulse">--</span>
                ) : (
                  stats.totalJobs
                )}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                  {stats.activeJobs} Active
                </span>
              </div>
            </div>
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 group-hover:scale-110 transition-transform duration-300">
              <FaBriefcase className="text-2xl text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Candidates Card */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Total Candidates
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {loading ? (
                  <span className="animate-pulse">--</span>
                ) : (
                  stats.totalCandidates
                )}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Registered users
              </p>
            </div>
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-cyan-100 dark:bg-cyan-900/30 group-hover:scale-110 transition-transform duration-300">
              <FaUserTie className="text-2xl text-cyan-600 dark:text-cyan-400" />
            </div>
          </div>
        </div>

        {/* Applications Card */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Applications
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {loading ? (
                  <span className="animate-pulse">--</span>
                ) : (
                  stats.totalApplications
                )}
              </p>
              <div className="flex items-center gap-1 mt-2">
                {stats.applicationsGrowth >= 0 ? (
                  <ArrowUpRight className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 text-red-600 dark:text-red-400" />
                )}
                <p
                  className={`text-xs font-medium ${
                    stats.applicationsGrowth >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {Math.abs(stats.applicationsGrowth)}% vs last week
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 group-hover:scale-110 transition-transform duration-300">
              <FaFileAlt className="text-2xl text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Pending Review Card */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Pending Review
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {loading ? (
                  <span className="animate-pulse">--</span>
                ) : (
                  stats.pendingApplications
                )}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                Needs attention
              </p>
            </div>
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/30 group-hover:scale-110 transition-transform duration-300">
              <FaClock className="text-2xl text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      {/* Applications Trend Chart - Full Width */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <FaChartLine className="text-xl text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Applications Trend
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last 30 days
            </p>
          </div>
        </div>
        <div className="mt-4">
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Loading chart...
                </p>
              </div>
            </div>
          ) : dashboardData?.applicationsTrend &&
            dashboardData.applicationsTrend.length > 0 ? (
            <div className="h-[300px]">
              <Chart
                options={mixedChartOptions}
                series={mixedChartSeries}
                type="line"
                height="100%"
              />
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
              <FaChartLine className="text-4xl mb-3 opacity-50" />
              <p className="text-sm">No data available</p>
              <p className="text-xs mt-1">
                Data will appear once you receive applications
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Applications by Status and Top Skills - 6/6 Grid */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Applications by Status */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <FaTrophy className="text-xl text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Applications by Status
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Current distribution
              </p>
            </div>
          </div>
          <div className="mt-4">
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-emerald-200 dark:border-emerald-900 border-t-emerald-600 dark:border-t-emerald-400 rounded-full animate-spin"></div>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Loading chart...
                  </p>
                </div>
              </div>
            ) : dashboardData?.applicationsByStatus &&
              dashboardData.applicationsByStatus.length > 0 ? (
              <div className="h-[350px]">
                <Chart
                  options={radialChartOptions}
                  series={radialChartSeries}
                  type="radialBar"
                  height="100%"
                />
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                <FaTrophy className="text-4xl mb-3 opacity-50" />
                <p className="text-sm">No data available</p>
                <p className="text-xs mt-1">
                  Data will appear once you receive applications
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Top Skills Chart */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
              <FaUsers className="text-xl text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Top Skills in Candidate Pool
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Most common skills among candidates
              </p>
            </div>
          </div>
          <div className="mt-4">
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-cyan-200 dark:border-cyan-900 border-t-cyan-600 dark:border-t-cyan-400 rounded-full animate-spin"></div>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Loading chart...
                  </p>
                </div>
              </div>
            ) : dashboardData?.topSkills &&
              dashboardData.topSkills.length > 0 ? (
              <div className="h-[350px]">
                <Chart
                  options={radarChartOptions}
                  series={radarChartSeries}
                  type="radar"
                  height="100%"
                />
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                <FaUsers className="text-4xl mb-3 opacity-50" />
                <p className="text-sm">No data available</p>
                <p className="text-xs mt-1">
                  Skills data will appear once candidates upload resumes
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity and Quick Actions - 6/6 Grid */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Recent Activity Widget */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <FaClock className="text-xl text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Activity
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Latest applications and updates
                </p>
              </div>
            </div>
            <Link href="/hr/candidates">
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1">
                View All
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </Link>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-600">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Loading activity...
                  </p>
                </div>
              </div>
            ) : dashboardData?.recentActivity &&
              dashboardData.recentActivity.length > 0 ? (
              dashboardData.recentActivity.map((activity, index) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <FaFileAlt className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.candidateName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Applied for{" "}
                          <span className="font-medium text-gray-900 dark:text-white">
                            {activity.jobTitle}
                          </span>
                        </p>
                      </div>
                      <Badge
                        variant={
                          (
                            {
                              PENDING: "warning",
                              REVIEWED: "teal",
                              SHORTLISTED: "info",
                              REJECTED: "danger",
                              ACCEPTED: "success",
                            } as const
                          )[activity.status] || "neutral"
                        }
                        className="text-xs font-medium flex-shrink-0"
                      >
                        {activity.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                      <FaClock className="w-3 h-3" />
                      {new Date(activity.appliedAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
                <FaClock className="text-4xl mb-3 opacity-50" />
                <p className="text-sm">No recent activity</p>
                <p className="text-xs mt-1">
                  Activity will appear once you receive applications
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <FaTrophy className="text-xl text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Quick Actions
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Frequently used features
                </p>
              </div>
            </div>
          </div>
          <div className="grid gap-3 grid-cols-1">
            <Link href="/hr/jobs">
              <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 group-hover:border-blue-200 dark:group-hover:border-blue-800 transition-colors">
                    <FaBriefcase className="text-lg text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Job Management
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Create & manage jobs
                    </p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                </div>
              </div>
            </Link>

            <Link href="/hr/candidates">
              <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:border-cyan-200 dark:hover:border-cyan-800 transition-all duration-300 cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 group-hover:border-cyan-200 dark:group-hover:border-cyan-800 transition-colors">
                    <FaUsers className="text-lg text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                      Candidates
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      View profiles
                    </p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors" />
                </div>
              </div>
            </Link>

            <Link href="/hr/email/templates">
              <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-200 dark:hover:border-orange-800 transition-all duration-300 cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 group-hover:border-orange-200 dark:group-hover:border-orange-800 transition-colors">
                    <FaEnvelope className="text-lg text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                      Email Templates
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Manage emails
                    </p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors" />
                </div>
              </div>
            </Link>

            <Link href="/hr/email/history">
              <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 group-hover:border-blue-200 dark:group-hover:border-blue-800 transition-colors">
                    <FaClock className="text-lg text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Email History
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      View sent emails
                    </p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                </div>
              </div>
            </Link>

            <Link href="/hr/analytics">
              <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-300 cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 group-hover:border-emerald-200 dark:group-hover:border-emerald-800 transition-colors">
                    <FaChartLine className="text-lg text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      Analytics
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      View insights
                    </p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
