"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  TrendingUp,
  Briefcase,
  Mail,
} from "lucide-react";
import Link from "next/link";

export default function HRPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 p-4">
      <div className="max-w-6xl mx-auto py-8">
        {/* <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">HR Portal</h1>
          <p className="text-gray-600">
            Manage your recruitment process efficiently
          </p>
        </div> */}

  {/* Quick Stats Section */}
        <div className="mt-12 text-center">
          <h2 className="text-4xl font-semibold text-gray-900 mb-6">
            Welcome to your HR Dashboard
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-10">
            Use the navigation cards above to access different areas of the HR system. 
            Manage job postings, review candidate applications, set up email communication templates, and track your recruitment metrics all in one place.
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/hr/jobs">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader className="text-center p-8">
                <Briefcase className="w-12 h-12 mx-auto mb-4 text-purple-600 group-hover:text-purple-700 transition-colors" />
                <CardTitle className="text-xl mb-2">Job Management</CardTitle>
                <p className="text-sm text-gray-600">
                  Create, edit, and manage job postings. View applications and update job status.
                </p>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/hr/candidates">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader className="text-center p-8">
                <Users className="w-12 h-12 mx-auto mb-4 text-blue-600 group-hover:text-blue-700 transition-colors" />
                <CardTitle className="text-xl mb-2">Candidates</CardTitle>
                <p className="text-sm text-gray-600">
                  View and manage candidate profiles, resumes, and application history.
                </p>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/hr/email/templates">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader className="text-center p-8">
                <Mail className="w-12 h-12 mx-auto mb-4 text-orange-600 group-hover:text-orange-700 transition-colors" />
                <CardTitle className="text-xl mb-2">Email Templates</CardTitle>
                <p className="text-sm text-gray-600">
                  Manage email templates for candidate communication and automated workflows.
                </p>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/hr/analytics">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader className="text-center p-8">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-green-600 group-hover:text-green-700 transition-colors" />
                <CardTitle className="text-xl mb-2">Analytics</CardTitle>
                <p className="text-sm text-gray-600">
                  View hiring statistics, performance metrics, and recruitment insights.
                </p>
              </CardHeader>
            </Card>
          </Link>
        </div>

      
      </div>
    </div>
  );
}
