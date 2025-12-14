"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  TrendingUp,
  Briefcase,
  Mail,
  FileText,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function HRPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalCandidates: 0,
    totalApplications: 0,
  });

  useEffect(() => {
    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        // You can implement these API endpoints later
        // For now, using placeholder data
        setStats({
          totalJobs: 0,
          activeJobs: 0,
          totalCandidates: 0,
          totalApplications: 0,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening with your recruitment today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeJobs} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Candidates</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCandidates}</div>
            <p className="text-xs text-muted-foreground">Total registered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplications}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Pending Review
            </CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/hr/jobs">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="text-center p-6">
              <Briefcase className="w-10 h-10 mx-auto mb-3 text-purple-600 group-hover:text-purple-700 transition-colors" />
              <CardTitle className="text-lg">Job Management</CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Create and manage job postings
              </p>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/hr/candidates">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="text-center p-6">
              <Users className="w-10 h-10 mx-auto mb-3 text-blue-600 group-hover:text-blue-700 transition-colors" />
              <CardTitle className="text-lg">Candidates</CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                View candidate profiles
              </p>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/hr/email/templates">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="text-center p-6">
              <Mail className="w-10 h-10 mx-auto mb-3 text-orange-600 group-hover:text-orange-700 transition-colors" />
              <CardTitle className="text-lg">Email Templates</CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Manage email communications
              </p>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/hr/analytics">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="text-center p-6">
              <TrendingUp className="w-10 h-10 mx-auto mb-3 text-green-600 group-hover:text-green-700 transition-colors" />
              <CardTitle className="text-lg">Analytics</CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                View recruitment insights
              </p>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
