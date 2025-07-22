import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import { Home } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CV-JD Matcher - Intelligent Resume Job Matching',
  description: 'AI-powered resume and job description matching system with advanced skill analysis and compatibility scoring.',
  keywords: 'resume matching, job matching, CV analysis, skill extraction, HR tools, recruitment',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CV</span>
              </div>
              <span className="font-bold text-gray-900">CV-JD Matcher</span>
            </Link>
            
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
        </nav>
        
        <main>{children}</main>
        <Toaster />
        
        <footer className="bg-gray-50 border-t border-gray-200 py-8 mt-16">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-gray-600 text-sm">
              © 2025 CV-JD Matcher. Built with Love For Final Project
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