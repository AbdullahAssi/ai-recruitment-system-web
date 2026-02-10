import React from "react";
import Link from "next/link";
import { Brain } from "lucide-react";

export function HomepageFooter() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="container max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-white" />
              <span className="text-xl font-bold text-white"> Qmindai</span>
            </div>
            <p className="text-gray-400 text-sm">
              Transforming recruitment with intelligent automation and
              data-driven insights.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Pages</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/features"
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-400 hover:text-white text-sm"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/candidate"
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Candidate Portal
                </Link>
              </li>
              <li>
                <Link
                  href="/hr"
                  className="text-gray-400 hover:text-white text-sm"
                >
                  HR Portal
                </Link>
              </li>
              <li>
                <Link
                  href="/jobs"
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Job Board
                </Link>
              </li>
              <li>
                <Link
                  href="/api-docs"
                  className="text-gray-400 hover:text-white text-sm"
                >
                  API Docs
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/security"
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Security
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            © 2025 RecruitAI. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
