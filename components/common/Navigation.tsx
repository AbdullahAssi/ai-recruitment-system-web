import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Brain, BarChart3 } from "lucide-react";

interface NavigationProps {
  className?: string;
}

export function Navigation({ className = "" }: NavigationProps) {
  return (
    <nav
      className={`border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50 ${className}`}
    >
      <div className="container max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-black" />
            <span className="text-2xl font-bold text-gray-900">Recruit.ai</span>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
            <Link href="/candidate">
              <Button variant="ghost" size="sm">
                Candidate
              </Button>
            </Link>
            <Link href="/hr">
              <Button variant="ghost" size="sm">
                HR Portal
              </Button>
            </Link>
            <Link href="/jobs">
              <Button variant="ghost" size="sm">
                Browse Jobs
              </Button>
            </Link>
            <Link href="/scores">
              <Button variant="ghost" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                AI Scores
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
