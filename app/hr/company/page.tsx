"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { CompanyForm } from "@/components/reusables/CompanyForm";
import { LoadingState } from "@/components/reusables";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  if (editing) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setEditing(false)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>
          <h1 className="text-2xl font-bold mb-6">Edit Company Profile</h1>
          <CompanyForm
            initialData={company}
            companyId={company.id}
            onSuccess={handleUpdateSuccess}
            mode="edit"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Company Profile
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your company information
            </p>
          </div>
          <Button onClick={() => setEditing(true)}>Edit Profile</Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Overview */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    {company.logo ? (
                      <img
                        src={company.logo}
                        alt={company.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-primary" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-2xl">{company.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        {company.industry && (
                          <Badge variant="secondary">{company.industry}</Badge>
                        )}
                        {company.isVerified && (
                          <Badge className="bg-green-500">Verified</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {company.description && (
                  <div>
                    <h3 className="font-semibold mb-2">About</h3>
                    <p className="text-gray-600">{company.description}</p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                  {company.location && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{company.location}</span>
                    </div>
                  )}
                  {company.size && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{company.size} employees</span>
                    </div>
                  )}
                  {company.foundedYear && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Founded in {company.foundedYear}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-600 hover:text-primary transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    <span className="hover:underline">{company.website}</span>
                  </a>
                )}
                {company.email && (
                  <a
                    href={`mailto:${company.email}`}
                    className="flex items-center gap-3 text-gray-600 hover:text-primary transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <span className="hover:underline">{company.email}</span>
                  </a>
                )}
                {company.phone && (
                  <a
                    href={`tel:${company.phone}`}
                    className="flex items-center gap-3 text-gray-600 hover:text-primary transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span className="hover:underline">{company.phone}</span>
                  </a>
                )}
                {company.linkedin && (
                  <a
                    href={company.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-600 hover:text-primary transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                    <span className="hover:underline">LinkedIn Profile</span>
                  </a>
                )}
                {company.twitter && (
                  <a
                    href={company.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-600 hover:text-primary transition-colors"
                  >
                    <Twitter className="w-4 h-4" />
                    <span className="hover:underline">Twitter Profile</span>
                  </a>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Company Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Active Jobs</span>
                  </div>
                  <span className="text-2xl font-bold">
                    {company._count?.jobs || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">HR Members</span>
                  </div>
                  <span className="text-2xl font-bold">
                    {company._count?.hrProfiles || 0}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push("/hr/jobs/new")}
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Post a New Job
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push("/hr/jobs")}
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  View All Jobs
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
