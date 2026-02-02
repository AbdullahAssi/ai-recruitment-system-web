"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { CompanyForm } from "@/components/reusables/CompanyForm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Building2, ArrowRight } from "lucide-react";

export default function CompanySetupPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hrProfile, setHrProfile] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (user.role !== "HR") {
      router.push("/");
      return;
    }

    fetchHRProfile();
  }, [user]);

  const fetchHRProfile = async () => {
    try {
      const response = await fetch(`/api/hr/profile/${user?.id}`);
      const data = await response.json();

      if (data.success && data.profile) {
        setHrProfile(data.profile);

        // If company already exists, redirect to company page
        if (data.profile.companyId) {
          router.push("/hr/company");
        }
      }
    } catch (error) {
      console.error("Failed to fetch HR profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = async (company: any) => {
    // Link the HR profile to the company
    try {
      const response = await fetch(`/api/hr/profile/${user?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: company.id }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to dashboard after successful setup
        router.push("/hr");
      }
    } catch (error) {
      console.error("Failed to link company:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Set Up Your Company Profile
          </h1>
          <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
            Complete your company profile to start posting jobs and connecting
            with talented candidates.
          </p>
        </div>

        {/* Progress Indicator */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white">
                  ✓
                </div>
                <div>
                  <p className="font-medium text-sm">Account Created</p>
                  <p className="text-xs text-gray-500">HR account is ready</p>
                </div>
              </div>

              <ArrowRight className="w-5 h-5 text-gray-400" />

              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white">
                  2
                </div>
                <div>
                  <p className="font-medium text-sm">Company Setup</p>
                  <p className="text-xs text-gray-500">In progress</p>
                </div>
              </div>

              <ArrowRight className="w-5 h-5 text-gray-400" />

              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-600">
                  3
                </div>
                <div>
                  <p className="font-medium text-sm">Start Hiring</p>
                  <p className="text-xs text-gray-500">Post your first job</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Form */}
        <CompanyForm onSuccess={handleSuccess} mode="create" />

        {/* Help Text */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-sm text-blue-900">
              Why do we need this information?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  Your company profile helps candidates learn more about your
                  organization
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  Detailed information increases trust and attracts better
                  candidates
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  You can update this information anytime from your dashboard
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
