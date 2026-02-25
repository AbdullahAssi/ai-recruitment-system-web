"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import {
  FaBriefcase,
  FaFileAlt,
  FaCheckCircle,
  FaClock,
  FaSearch,
  FaUserEdit,
  FaExclamationCircle,
  FaClipboardList,
  FaTrophy,
} from "react-icons/fa";
import Link from "next/link";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface PendingQuiz {
  id: string;
  appliedAt: string;
  job: {
    id: string;
    title: string;
    location: string;
  };
}

interface Application {
  id: string;
  status: string;
  appliedAt: string;
  job: {
    id: string;
    title: string;
    location: string;
  };
}

export default function CandidatePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    interviewScheduled: 0,
    shortlisted: 0,
  });
  const [pendingQuizzes, setPendingQuizzes] = useState<PendingQuiz[]>([]);
  const [recentApplications, setRecentApplications] = useState<Application[]>(
    [],
  );
  const [allApplications, setAllApplications] = useState<Application[]>([]);

  useEffect(() => {
    // Fetch candidate stats
    const fetchStats = async () => {
      if (!user?.candidate?.id) return;

      try {
        // Fetch applications
        const appsResponse = await fetch(
          `/api/applications?candidateId=${user.candidate.id}`,
        );
        const appsData = await appsResponse.json();

        if (appsData.success) {
          const applications: Application[] = appsData.applications || [];
          const pendingApps = applications.filter(
            (app) => app.status === "PENDING" || app.status === "UNDER_REVIEW",
          );
          const interviewApps = applications.filter(
            (app) => app.status === "INTERVIEW",
          );
          const shortlistedApps = applications.filter(
            (app) => app.status === "SHORTLISTED",
          );
          const quizPendingApps = applications.filter(
            (app) => app.status === "QUIZ_PENDING",
          );

          setPendingQuizzes(quizPendingApps);
          setRecentApplications(applications.slice(0, 5));
          setAllApplications(applications);

          setStats({
            totalApplications: applications.length,
            pendingApplications: pendingApps.length,
            interviewScheduled: interviewApps.length,
            shortlisted: shortlistedApps.length,
          });
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };

    fetchStats();
  }, [user]);

  // ── Chart: Application Status Donut ───────────────────────────────────
  const statusOrder = [
    "PENDING",
    "UNDER_REVIEW",
    "REVIEWED",
    "SHORTLISTED",
    "INTERVIEW",
    "QUIZ_PENDING",
    "ACCEPTED",
    "REJECTED",
  ];
  const statusLabels: Record<string, string> = {
    PENDING: "Pending",
    UNDER_REVIEW: "Under Review",
    REVIEWED: "Reviewed",
    SHORTLISTED: "Shortlisted",
    INTERVIEW: "Interview",
    QUIZ_PENDING: "Quiz Pending",
    ACCEPTED: "Accepted",
    REJECTED: "Rejected",
  };
  const statusColors: Record<string, string> = {
    PENDING: "#F59E0B",
    UNDER_REVIEW: "#06B6D4",
    REVIEWED: "#3B82F6",
    SHORTLISTED: "#0a66c2",
    INTERVIEW: "#10B981",
    QUIZ_PENDING: "#F97316",
    ACCEPTED: "#059669",
    REJECTED: "#EF4444",
  };

  const statusCounts = statusOrder
    .map((s) => ({
      status: s,
      count: allApplications.filter((a) => a.status === s).length,
    }))
    .filter((s) => s.count > 0);

  const donutOptions: ApexCharts.ApexOptions = {
    chart: { type: "donut", fontFamily: "inherit", toolbar: { show: false } },
    labels: statusCounts.map((s) => statusLabels[s.status] ?? s.status),
    colors: statusCounts.map((s) => statusColors[s.status] ?? "#6B7280"),
    legend: {
      position: "bottom",
      fontSize: "12px",
      fontWeight: 500,
      markers: { size: 8 },
      itemMargin: { horizontal: 8, vertical: 4 },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              fontSize: "13px",
              fontWeight: 600,
              color: "#6B7280",
              formatter: () => allApplications.length.toString(),
            },
            value: { fontSize: "22px", fontWeight: 700, color: "#111827" },
          },
        },
      },
    },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    tooltip: {
      theme: "light",
      y: { formatter: (v) => `${v} application${v !== 1 ? "s" : ""}` },
    },
  };
  const donutSeries = statusCounts.map((s) => s.count);

  // ── Chart: Application Timeline (last 14 days) ────────────────────────
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return d;
  });
  const timelineCounts = last14Days.map((day) => {
    const key = day.toDateString();
    return allApplications.filter(
      (a) => new Date(a.appliedAt).toDateString() === key,
    ).length;
  });
  const timelineLabels = last14Days.map((d) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  );

  const barOptions: ApexCharts.ApexOptions = {
    chart: {
      type: "bar",
      fontFamily: "inherit",
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    plotOptions: { bar: { columnWidth: "50%", borderRadius: 4 } },
    colors: ["#0a66c2"],
    dataLabels: { enabled: false },
    xaxis: {
      categories: timelineLabels,
      labels: { style: { colors: "#6B7280", fontSize: "11px" }, rotate: -45 },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: "#6B7280", fontSize: "11px" },
        formatter: (v) => Math.floor(v).toString(),
      },
    },
    grid: { borderColor: "#E5E7EB", strokeDashArray: 4 },
    tooltip: {
      theme: "light",
      y: { formatter: (v) => `${v} application${v !== 1 ? "s" : ""}` },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        opacityFrom: 1,
        opacityTo: 0.6,
      },
    },
  };
  const barSeries = [{ name: "Applications", data: timelineCounts }];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track your applications and discover new opportunities.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          <Link href="/candidate/jobs">
            <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
              <FaSearch className="w-4 h-4 mr-2" />
              Browse Jobs
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                My Applications
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalApplications}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Total submitted
              </p>
            </div>
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 group-hover:scale-110 transition-transform duration-300">
              <FaFileAlt className="text-2xl text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Under Review
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.pendingApplications}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                Being reviewed
              </p>
            </div>
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/30 group-hover:scale-110 transition-transform duration-300">
              <FaClock className="text-2xl text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Interviews
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.interviewScheduled}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
                Scheduled
              </p>
            </div>
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 group-hover:scale-110 transition-transform duration-300">
              <FaCheckCircle className="text-2xl text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Shortlisted
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.shortlisted}
              </p>
              <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-2">
                Moving forward
              </p>
            </div>
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-cyan-100 dark:bg-cyan-900/30 group-hover:scale-110 transition-transform duration-300">
              <FaTrophy className="text-2xl text-cyan-600 dark:text-cyan-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Application Timeline Bar Chart */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <FaFileAlt className="text-lg text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Application Activity
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Applications submitted — last 14 days
              </p>
            </div>
          </div>
          {allApplications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[240px] text-gray-400 dark:text-gray-500">
              <FaFileAlt className="text-4xl opacity-30 mb-3" />
              <p className="text-sm font-medium">No applications yet</p>
              <p className="text-xs mt-1">
                Apply to jobs to see your activity chart
              </p>
            </div>
          ) : (
            <Chart
              options={barOptions}
              series={barSeries}
              type="bar"
              height={260}
            />
          )}
        </div>

        {/* Application Status Donut Chart */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
              <FaTrophy className="text-lg text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Application Status
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Breakdown of your application pipeline
              </p>
            </div>
          </div>
          {allApplications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[240px] text-gray-400 dark:text-gray-500">
              <FaTrophy className="text-4xl opacity-30 mb-3" />
              <p className="text-sm font-medium">No data yet</p>
              <p className="text-xs mt-1">
                Your status breakdown will appear here
              </p>
            </div>
          ) : (
            <Chart
              options={donutOptions}
              series={donutSeries}
              type="donut"
              height={280}
            />
          )}
        </div>
      </div>

      {/* Pending Quizzes Alert */}
      {pendingQuizzes.length > 0 && (
        <div className="rounded-xl border border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-500 dark:bg-orange-600">
              <FaExclamationCircle className="text-xl text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-200">
                Pending Quiz Assessments
              </h3>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                {pendingQuizzes.length} quiz
                {pendingQuizzes.length > 1 ? "s" : ""} waiting to be completed
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {pendingQuizzes.map((app) => (
              <div
                key={app.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-gray-900 rounded-lg border border-orange-200 dark:border-orange-800 hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {app.job.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {app.job.location} • Applied{" "}
                    {new Date(app.appliedAt).toLocaleDateString()}
                  </p>
                </div>
                <Link href={`/candidate/quiz/${app.id}`}>
                  <Button
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-800 w-full sm:w-auto"
                  >
                    <FaClipboardList className="w-4 h-4 mr-2" />
                    Take Quiz
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions & Recent Activity - 6/6 Grid */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Recent Activity */}
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
                  Your latest application updates
                </p>
              </div>
            </div>
            <Link href="/candidate/applications">
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1">
                View All
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <div className="text-center py-10 text-gray-400 dark:text-gray-500">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mx-auto mb-4">
                <FaFileAlt className="text-3xl opacity-40" />
              </div>
              <p className="font-medium">No recent activity to display</p>
              <p className="text-sm mt-2">
                Start applying to jobs to see your activity here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentApplications.map((app) => {
                const statusConfig: Record<
                  string,
                  { label: string; color: string; bg: string }
                > = {
                  PENDING: {
                    label: "Pending",
                    color: "text-amber-700 dark:text-amber-300",
                    bg: "bg-amber-100 dark:bg-amber-900/30",
                  },
                  UNDER_REVIEW: {
                    label: "Under Review",
                    color: "text-blue-700 dark:text-blue-300",
                    bg: "bg-blue-100 dark:bg-blue-900/30",
                  },
                  REVIEWED: {
                    label: "Reviewed",
                    color: "text-cyan-700 dark:text-cyan-300",
                    bg: "bg-cyan-100 dark:bg-cyan-900/30",
                  },
                  SHORTLISTED: {
                    label: "Shortlisted",
                    color: "text-cyan-700 dark:text-cyan-300",
                    bg: "bg-cyan-100 dark:bg-cyan-900/30",
                  },
                  INTERVIEW: {
                    label: "Interview",
                    color: "text-emerald-700 dark:text-emerald-300",
                    bg: "bg-emerald-100 dark:bg-emerald-900/30",
                  },
                  QUIZ_PENDING: {
                    label: "Quiz Pending",
                    color: "text-orange-700 dark:text-orange-300",
                    bg: "bg-orange-100 dark:bg-orange-900/30",
                  },
                  ACCEPTED: {
                    label: "Accepted",
                    color: "text-emerald-700 dark:text-emerald-300",
                    bg: "bg-emerald-100 dark:bg-emerald-900/30",
                  },
                  REJECTED: {
                    label: "Rejected",
                    color: "text-red-700 dark:text-red-300",
                    bg: "bg-red-100 dark:bg-red-900/30",
                  },
                };
                const s = statusConfig[app.status] ?? {
                  label: app.status,
                  color: "text-gray-600 dark:text-gray-400",
                  bg: "bg-gray-100 dark:bg-gray-800",
                };
                return (
                  <div
                    key={app.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 shrink-0">
                        <FaBriefcase className="text-sm text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {app.job.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {app.job.location} &bull;{" "}
                          {new Date(app.appliedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${s.bg} ${s.color}`}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <FaCheckCircle className="text-xl text-emerald-600 dark:text-emerald-400" />
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
            <Link href="/candidate/jobs">
              <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 group-hover:border-blue-200 dark:group-hover:border-blue-800 transition-colors">
                    <FaBriefcase className="text-lg text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Browse Jobs
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Find your next opportunity
                    </p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                </div>
              </div>
            </Link>

            <Link href="/candidate/applications">
              <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:border-cyan-200 dark:hover:border-cyan-800 transition-all duration-300 cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 group-hover:border-cyan-200 dark:group-hover:border-cyan-800 transition-colors">
                    <FaFileAlt className="text-lg text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                      My Applications
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Track application status
                    </p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors" />
                </div>
              </div>
            </Link>

            <Link href="/candidate/profile">
              <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-300 cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 group-hover:border-emerald-200 dark:group-hover:border-emerald-800 transition-colors">
                    <FaUserEdit className="text-lg text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      Update Profile
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Keep your profile current
                    </p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                </div>
              </div>
            </Link>

            <Link href="/candidate/scores">
              <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-200 dark:hover:border-orange-800 transition-all duration-300 cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 group-hover:border-orange-200 dark:group-hover:border-orange-800 transition-colors">
                    <FaClipboardList className="text-lg text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                      My Scores
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      View quiz & match scores
                    </p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
