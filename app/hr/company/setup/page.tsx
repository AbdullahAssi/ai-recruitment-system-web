"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { CompanyForm } from "@/components/reusables/CompanyForm";
import { LoadingState } from "@/components/reusables";
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  Rocket,
  Info,
} from "lucide-react";

export default function CompanySetupPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

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

      if (data.success && data.profile?.companyId) {
        router.push("/hr/company");
      }
    } catch (error) {
      console.error("Failed to fetch HR profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = async (company: any) => {
    try {
      const response = await fetch(`/api/hr/profile/${user?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: company.id }),
      });
      const data = await response.json();
      if (data.success) {
        router.push("/hr");
      }
    } catch (error) {
      console.error("Failed to link company:", error);
    }
  };

  if (loading) {
    return (
      <LoadingState variant="page" message="Setting up your workspace..." />
    );
  }

  const steps = [
    {
      label: "Account Created",
      sub: "HR account is ready",
      done: true,
      active: false,
    },
    { label: "Company Setup", sub: "In progress", done: false, active: true },
    {
      label: "Start Hiring",
      sub: "Post your first job",
      done: false,
      active: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top banner */}
 

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Page heading */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand flex items-center justify-center flex-shrink-0">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Set Up Your Company Profile
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Complete your company profile to start posting jobs and connecting
              with talented candidates.
            </p>
          </div>
        </div>

        {/* Progress stepper */}
        <div className="rounded-xl border border-border bg-card px-6 py-5">
          <div className="flex items-center gap-2 sm:gap-0">
            {steps.map((step, idx) => (
              <div
                key={step.label}
                className="flex items-center flex-1 min-w-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {step.done ? (
                    <CheckCircle2 className="w-8 h-8 text-green-500 flex-shrink-0" />
                  ) : (
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                        step.active
                          ? "bg-brand text-white ring-4 ring-brand/20"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {idx + 1}
                    </div>
                  )}
                  <div className="min-w-0 hidden sm:block">
                    <p
                      className={`text-sm font-medium truncate ${step.active ? "text-brand" : step.done ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {step.label}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {step.sub}
                    </p>
                  </div>
                </div>
                {idx < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-muted-foreground mx-2 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Company form */}
        <CompanyForm onSuccess={handleSuccess} mode="create" />

        {/* Info tip */}
        <div className="rounded-xl border border-brand/20 bg-brand/5 p-5 flex gap-3">
          <Info className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-brand">
              Why do we need this?
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>
                Your company profile helps candidates learn more about your
                organization
              </li>
              <li>
                Detailed information increases trust and attracts better
                candidates
              </li>
              <li>
                You can update this information anytime from your dashboard
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
