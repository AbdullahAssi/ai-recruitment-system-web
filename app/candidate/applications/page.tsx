"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function CandidateApplicationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-600 mt-2">
          Track the status of your job applications
        </p>
      </div>

      <Card>
        <CardContent className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No applications yet</p>
          <p className="text-sm text-gray-400 mt-2">
            Start applying to jobs to see them here
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
