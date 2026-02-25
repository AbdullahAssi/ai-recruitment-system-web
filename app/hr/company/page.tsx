"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { CompanyForm } from "@/components/reusables/CompanyForm";
import { LoadingState } from "@/components/reusables";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  Briefcase,
  MapPin,
  Calendar,
  Globe,
  Mail,
  Phone,
  Linkedin,
  Twitter,
  ArrowLeft,
  Pencil,
} from "lucide-react";

export default function CompanyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [company, setCompany] = useState<any>(null);
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

    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch HR profile first
      const profileResponse = await fetch(`/api/hr/profile/${user?.id}`);
      const profileData = await profileResponse.json();

      if (profileData.success && profileData.profile) {
        setHrProfile(profileData.profile);

        // If no company, redirect to setup
        if (!profileData.profile.companyId) {
          router.push("/hr/company/setup");
          return;
        }

        // Fetch company details
        const companyResponse = await fetch(
          `/api/company/${profileData.profile.companyId}`,
        );
        const companyData = await companyResponse.json();

        if (companyData.success) {
          setCompany(companyData.company);
        }
      }
    } catch (error) {
      console.error("Failed to fetch company:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSuccess = (updatedCompany: any) => {
    setCompany(updatedCompany);
    setEditing(false);
  };

  if (loading) {
    return <LoadingState variant="page" message="Loading company profile..." />;
  }

  if (!company) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center py-24 rounded-xl border border-dashed border-border bg-card">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Building2 className="w-7 h-7 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            No Company Found
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Your account is not linked to a company yet.
          </p>
          <Button
            size="sm"
            onClick={() => router.push("/hr/company/setup")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Set Up Company
          </Button>
        </div>
      </div>
    );
  }

  if (editing) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditing(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
            <Building2 className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Edit Company Profile
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Update your company information
            </p>
          </div>
        </div>
        <CompanyForm
          initialData={company}
          companyId={company.id}
          onSuccess={handleUpdateSuccess}
          mode="edit"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
            <Building2 className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Company Profile
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage your company information
            </p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => setEditing(true)}
          className="h-9 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Pencil className="w-3.5 h-3.5 mr-1.5" />
          Edit Profile
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Overview */}
          <div className="rounded-xl border border-border bg-card">
            {/* Banner area */}
            <div className="h-24 rounded-t-xl bg-gradient-to-r from-primary to-blue-400" />
            <div className="px-6 pb-6">
              {/* Logo + name row */}
              <div className="flex items-end justify-between -mt-8 mb-4">
                <div className="w-16 h-16 rounded-xl border-4 border-card bg-white dark:bg-gray-900 flex items-center justify-center shadow-sm overflow-hidden flex-shrink-0">
                  {company.logo ? (
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-8 h-8 text-primary" />
                  )}
                </div>
                <div className="flex items-center gap-2 mb-1">
                  {company.industry && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                      {company.industry}
                    </span>
                  )}
                  {company.isVerified && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400">
                      ✓ Verified
                    </span>
                  )}
                </div>
              </div>

              <h2 className="text-xl font-bold text-foreground">
                {company.name}
              </h2>

              {company.description && (
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  {company.description}
                </p>
              )}

              {/* Meta pills */}
              {(company.location || company.size || company.foundedYear) && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
                  {company.location && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      {company.location}
                    </span>
                  )}
                  {company.size && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      {company.size} employees
                    </span>
                  )}
                  {company.foundedYear && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      Founded {company.foundedYear}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Contact Information
            </h3>
            <div className="space-y-3">
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100">
                    <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="hover:underline truncate">
                    {company.website}
                  </span>
                </a>
              )}
              {company.email && (
                <a
                  href={`mailto:${company.email}`}
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100">
                    <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="hover:underline">{company.email}</span>
                </a>
              )}
              {company.phone && (
                <a
                  href={`tel:${company.phone}`}
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100">
                    <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="hover:underline">{company.phone}</span>
                </a>
              )}
              {company.linkedin && (
                <a
                  href={company.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100">
                    <Linkedin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="hover:underline">LinkedIn Profile</span>
                </a>
              )}
              {company.twitter && (
                <a
                  href={company.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100">
                    <Twitter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="hover:underline">Twitter Profile</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Company Stats
            </h3>
            <div className="space-y-3">
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 hover:shadow-md transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Active Jobs
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {company._count?.jobs || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 hover:shadow-md transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      HR Members
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {company._count?.hrProfiles || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full h-9 justify-start text-xs border-border text-foreground hover:bg-muted"
                onClick={() => router.push("/hr/jobs/new")}
              >
                <Briefcase className="w-3.5 h-3.5 mr-2 text-primary" />
                Post a New Job
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full h-9 justify-start text-xs border-border text-foreground hover:bg-muted"
                onClick={() => router.push("/hr/jobs")}
              >
                <Briefcase className="w-3.5 h-3.5 mr-2 text-primary" />
                View All Jobs
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
