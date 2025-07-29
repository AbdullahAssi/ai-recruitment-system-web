import "./globals.css";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { Home, Brain } from "lucide-react";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CV-JD Matcher - Intelligent Resume Job Matching",
  description:
    "AI-powered resume and job description matching system with advanced skill analysis and compatibility scoring.",
  keywords:
    "resume matching, job matching, CV analysis, skill extraction, HR tools, recruitment",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
          <div className="container max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center"> */}
                  <Brain className="w-6 h-6 text-black" />
                {/* </div> */}
                <span className="text-2xl font-bold text-gray-900">
                  Recruit.ai
                </span>
              </div>
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
              </div>
            </div>
          </div>
        </nav>

        <main>{children}</main>
        <Toaster />

        <footer className="bg-gray-50 border-t border-gray-200 py-8 mt-16">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} AI Recruitment System. Built with
              Love For Final Project
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Intelligent resume matching for modern recruitment.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
