"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  HiOutlineViewGrid,
  HiOutlineBriefcase,
  HiOutlineUsers,
  HiOutlineMail,
  HiOutlineChartBar,
  HiOutlineLogout,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineInbox,
  HiOutlineOfficeBuilding,
} from "react-icons/hi";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { LoadingState } from "@/components/reusables";

const navigation = [
  { name: "Dashboard", href: "/hr", icon: HiOutlineViewGrid },
  { name: "Jobs", href: "/hr/jobs", icon: HiOutlineBriefcase },
  { name: "Candidates", href: "/hr/candidates", icon: HiOutlineUsers },
  { name: "Email Templates", href: "/hr/email/templates", icon: HiOutlineMail },
  { name: "Email History", href: "/hr/email/history", icon: HiOutlineInbox },
  { name: "Analytics", href: "/hr/analytics", icon: HiOutlineChartBar },
  { name: "Company", href: "/hr/company", icon: HiOutlineOfficeBuilding },
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
    return <LoadingState variant="page" message="Loading..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-gradient-to-b from-white to-gray-50 shadow-xl border-r border-gray-200 transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${sidebarCollapsed ? "lg:w-20" : "lg:w-64"} w-64 overflow-visible`}
      >
        <div className="flex flex-col h-full overflow-visible">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <Link href="/hr" className="flex items-center gap-3 min-w-0">
              <img
                src="/blue.png"
                alt="Qmindai"
                className=" flex-shrink-0 object-contain"
              />
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
                  <HiOutlineChevronRight className="w-5 h-5" />
                ) : (
                  <HiOutlineChevronLeft className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto overflow-x-visible">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative ${
                    isActive
                      ? "bg-gradient-to-r from-blue-50 to-blue-50/50 text-blue-700 shadow-sm"
                      : "text-gray-700 hover:bg-gray-100 hover:shadow-sm"
                  } ${sidebarCollapsed ? "justify-center" : ""}`}
                  onClick={() => setSidebarOpen(false)}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <div className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors flex-shrink-0">
                    <item.icon className="w-5 h-5" />
                  </div>
                  {!sidebarCollapsed && (
                    <span className="ml-3">{item.name}</span>
                  )}

                  {/* Tooltip for collapsed state */}
                  {sidebarCollapsed && (
                    <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-[100]">
                      {item.name}
                      <span className="absolute right-full top-1/2 -translate-y-1/2 -mr-1 border-4 border-transparent border-r-gray-900"></span>
                    </span>
                  )}
                </Link>
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
                  <HiOutlineLogout className="w-4 h-4 mr-2" />
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
                  <HiOutlineLogout className="w-4 h-4" />
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
              <HiOutlineMenu className="w-6 h-6" />
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
