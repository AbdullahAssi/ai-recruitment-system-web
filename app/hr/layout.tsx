"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Mail,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Building2,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const navigation = [
  { name: "Dashboard", href: "/hr", icon: LayoutDashboard },
  { name: "Jobs", href: "/hr/jobs", icon: Briefcase },
  { name: "Candidates", href: "/hr/candidates", icon: Users },
  { name: "Email Templates", href: "/hr/email/templates", icon: Mail },
  { name: "Email History", href: "/hr/email/history", icon: Inbox },
  { name: "Analytics", href: "/hr/analytics", icon: BarChart3 },
  { name: "Company", href: "/hr/company", icon: Building2 },
];

export default function HRLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [checkingCompany, setCheckingCompany] = useState(true);

  useEffect(() => {
    checkCompanySetup();
  }, [user]);

  const checkCompanySetup = async () => {
    if (!user || user.role !== "HR") {
      setCheckingCompany(false);
      return;
    }

    // Skip check if already on company setup page
    if (pathname?.startsWith("/hr/company")) {
      setCheckingCompany(false);
      return;
    }

    try {
      const response = await fetch(`/api/hr/profile/${user.id}`);
      const data = await response.json();

      if (data.success && data.profile) {
        // If no company, redirect to setup
        if (!data.profile.companyId) {
          router.push("/hr/company/setup");
          return;
        }
      }
    } catch (error) {
      console.error("Failed to check company setup:", error);
    } finally {
      setCheckingCompany(false);
    }
  };

  if (checkingCompany) {
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
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${sidebarCollapsed ? "lg:w-20" : "lg:w-64"} w-64`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <Link href="/hr" className="flex items-center min-w-0">
              <Building2 className="w-8 h-8 text-blue-600 flex-shrink-0" />
              {!sidebarCollapsed && (
                <span className="text-xl font-bold text-gray-900 ml-2 truncate">
                  HR Portal
                </span>
              )}
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-label={
                  sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
                }
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-5 h-5" />
                ) : (
                  <ChevronLeft className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <div key={item.name} className="relative">
                  <Link
                    href={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    } ${sidebarCollapsed ? "justify-center" : ""}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon
                      className={`w-5 h-5 flex-shrink-0 ${!sidebarCollapsed && "mr-3"}`}
                    />
                    {!sidebarCollapsed && <span>{item.name}</span>}
                  </Link>

                  {/* Tooltip for collapsed state */}
                  {sidebarCollapsed && (
                    <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-[9999]">
                      <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap shadow-lg">
                        {item.name}
                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* User info and logout */}
          <div className="p-4 border-t border-gray-200">
            {!sidebarCollapsed ? (
              <>
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={logout}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"
                  title={user?.name}
                >
                  <span className="text-blue-600 font-semibold text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <Button
                  onClick={logout}
                  variant="outline"
                  size="icon"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="text-lg font-semibold text-gray-900">
              HR Portal
            </span>
            <div className="w-6" /> {/* Spacer for alignment */}
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
