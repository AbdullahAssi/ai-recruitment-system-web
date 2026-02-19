"use client";

import { HeroSection, HomepageFooter } from "@/components/common";
import HiringAutomationSection from "./card";
import HiringStepsSection from "./anothercard";
import FAQSection from "./faqs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Building2, Users, ArrowRight, LogOut } from "lucide-react";

export default function HomePage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  const handlePortalNavigation = (portal: "hr" | "candidate") => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    router.push(`/${portal}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/blue.svg" alt="Qmindai" className="h-16 mt-4 w-auto" />
            </div>
            <div className="flex items-center gap-4">
              {!loading && (
                <>
                  {user ? (
                    <>
                      <span className="text-sm text-gray-600">
                        Welcome, {user.name}
                      </span>
                      <Button
                        onClick={() =>
                          router.push(
                            user.role === "HR" || user.role === "ADMIN"
                              ? "/hr"
                              : "/candidate"
                          )
                        }
                        variant="outline"
                      >
                        Go to Dashboard
                      </Button>
                      <Button onClick={logout} variant="ghost" size="sm">
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={() => router.push("/auth/login")}
                        variant="ghost"
                      >
                        Login
                      </Button>
                      <Button onClick={() => router.push("/auth/register")}>
                        Sign Up
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content with top padding for fixed nav */}
      <div className="pt-16">
        <HeroSection />

        {/* Portal Cards Section */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Choose Your Portal
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Access the platform based on your role
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* HR Portal Card */}
              <div
                onClick={() => handlePortalNavigation("hr")}
                className="group cursor-pointer bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-blue-500"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-500 transition-colors">
                    <Building2 className="w-10 h-10 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    HR Portal
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Manage job postings, review candidates, track applications,
                    and streamline your recruitment process
                  </p>
                  <div className="flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all">
                    Access HR Portal
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>

              {/* Candidate Portal Card */}
              <div
                onClick={() => handlePortalNavigation("candidate")}
                className="group cursor-pointer bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-blue-500"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-500 transition-colors">
                    <Users className="w-10 h-10 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Candidate Portal
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Browse job openings, submit applications, track your
                    application status, and manage your profile
                  </p>
                  <div className="flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all">
                    Access Candidate Portal
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <HiringAutomationSection />
        <HiringStepsSection />
        <FAQSection />
        <HomepageFooter />
      </div>
    </div>
  );
}
