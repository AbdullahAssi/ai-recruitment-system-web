"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
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
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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

  const COLORS = ["#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EF4444"];

  const statusColors: Record<string, string> = {
    PENDING: "#F59E0B",
    REVIEWED: "#06B6D4",
    SHORTLISTED: "#8B5CF6",
    INTERVIEW: "#10B981",
    REJECTED: "#EF4444",
    ACCEPTED: "#059669",
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your recruitment today.
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Jobs Card */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-purple-700 mb-1">
                  Total Jobs
                </p>
                <p className="text-3xl font-bold text-purple-900">
                  {loading ? (
                    <span className="animate-pulse">--</span>
                  ) : (
                    stats.totalJobs
                  )}
                </p>
                <p className="text-xs text-purple-600 mt-2">
                  {stats.activeJobs} currently active
                </p>
              </div>
              <div className="bg-purple-200 p-4 rounded-full">
                <FaBriefcase className="text-3xl text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Candidates Card */}
        <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200 hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-cyan-700 mb-1">
                  Total Candidates
                </p>
                <p className="text-3xl font-bold text-cyan-900">
                  {loading ? (
                    <span className="animate-pulse">--</span>
                  ) : (
                    stats.totalCandidates
                  )}
                </p>
                <p className="text-xs text-cyan-600 mt-2">Registered users</p>
              </div>
              <div className="bg-cyan-200 p-4 rounded-full">
                <FaUserTie className="text-3xl text-cyan-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications Card */}
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-emerald-700 mb-1">
                  Applications
                </p>
                <p className="text-3xl font-bold text-emerald-900">
                  {loading ? (
                    <span className="animate-pulse">--</span>
                  ) : (
                    stats.totalApplications
                  )}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  {stats.applicationsGrowth >= 0 ? (
                    <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 text-red-600" />
                  )}
                  <p
                    className={`text-xs font-medium ${
                      stats.applicationsGrowth >= 0
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {Math.abs(stats.applicationsGrowth)}% vs last week
                  </p>
                </div>
              </div>
              <div className="bg-emerald-200 p-4 rounded-full">
                <FaFileAlt className="text-3xl text-emerald-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Review Card */}
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-700 mb-1">
                  Pending Review
                </p>
                <p className="text-3xl font-bold text-amber-900">
                  {loading ? (
                    <span className="animate-pulse">--</span>
                  ) : (
                    stats.pendingApplications
                  )}
                </p>
                <p className="text-xs text-amber-600 mt-2">Needs attention</p>
              </div>
              <div className="bg-amber-200 p-4 rounded-full">
                <FaClock className="text-3xl text-amber-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Applications Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaChartLine className="text-purple-600" />
              Applications Trend (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-pulse text-gray-400">
                  Loading chart...
                </div>
              </div>
            ) : dashboardData?.applicationsTrend &&
              dashboardData.applicationsTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={dashboardData.applicationsTrend.map((item: any) => ({
                    date: new Date(item.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    }),
                    count: Number(item.count),
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    name="Applications"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Applications by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaTrophy className="text-emerald-600" />
              Applications by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-pulse text-gray-400">
                  Loading chart...
                </div>
              </div>
            ) : dashboardData?.applicationsByStatus &&
              dashboardData.applicationsByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dashboardData.applicationsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, count }) => `${status}: ${count}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {dashboardData.applicationsByStatus.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          statusColors[entry.status] ||
                          COLORS[index % COLORS.length]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Skills Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FaUsers className="text-cyan-600" />
            Top 10 Skills in Candidate Pool
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-pulse text-gray-400">
                Loading chart...
              </div>
            </div>
          ) : dashboardData?.topSkills && dashboardData.topSkills.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={dashboardData.topSkills.map((item: any) => ({
                  skill: item.skill,
                  count: Number(item.count),
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="skill"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#06B6D4" name="Candidates" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="mt-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/hr/jobs">
            <Card className="hover:shadow-lg transition-all cursor-pointer group ">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-purple-100 p-3 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <FaBriefcase className="text-2xl text-purple-700" />
                  </div>
                  <div>
                    <CardTitle className="text-lg group-hover:text-purple-700 transition-colors">
                      Job Management
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Create & manage jobs
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/hr/candidates">
            <Card className="hover:shadow-lg transition-all cursor-pointer group ">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-cyan-100 p-3 rounded-lg group-hover:bg-cyan-200 transition-colors">
                    <FaUsers className="text-2xl text-cyan-700" />
                  </div>
                  <div>
                    <CardTitle className="text-lg group-hover:text-cyan-700 transition-colors">
                      Candidates
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">View profiles</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/hr/email/templates">
            <Card className="hover:shadow-lg transition-all cursor-pointer group ">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-orange-100 p-3 rounded-lg group-hover:bg-orange-200 transition-colors">
                    <FaEnvelope className="text-2xl text-orange-700" />
                  </div>
                  <div>
                    <CardTitle className="text-lg group-hover:text-orange-700 transition-colors">
                      Email Templates
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">Manage emails</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/hr/analytics">
            <Card className="hover:shadow-lg transition-all cursor-pointer group ">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-100 p-3 rounded-lg group-hover:bg-emerald-200 transition-colors">
                    <FaChartLine className="text-2xl text-emerald-700" />
                  </div>
                  <div>
                    <CardTitle className="text-lg group-hover:text-emerald-700 transition-colors">
                      Analytics
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">View insights</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
