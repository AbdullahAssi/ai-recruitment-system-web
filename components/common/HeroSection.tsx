import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Play } from 'lucide-react';

export function HeroSection() {
  return (
    <div className="relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>

      <div className="relative container mx-auto px-4 py-10 lg:py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-6 py-3 mb-8">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <span className="text-blue-700 text-sm font-semibold">
              AI-Powered Recruitment Platform
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-gray-900 mb-8 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Hire Smarter
            </span>
            <br />
            <span className="text-gray-900">With AI</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-6 max-w-4xl mx-auto font-light leading-relaxed">
            Transform your recruitment process with intelligent automation.
            <br />
            <span className="text-blue-600 font-semibold">
              Find the perfect candidates 10x faster.
            </span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/candidate">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl h-14 px-8 text-lg font-semibold"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-50 h-14 px-8 text-lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">10x</div>
              <div className="text-sm text-gray-600">Faster Hiring</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">95%</div>
              <div className="text-sm text-gray-600">Match Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">50k+</div>
              <div className="text-sm text-gray-600">Hires Made</div>
            </div>
          </div>
        </div>

        {/* Trusted By Section */}
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-8 font-medium">
            Trusted by leading companies worldwide
          </p>
          <div className="flex items-center justify-center gap-12 opacity-60">
            <div className="text-2xl font-bold text-gray-400">CyMaxTech</div>
            <div className="text-2xl font-bold text-gray-400">TechCorp</div>
            <div className="text-2xl font-bold text-gray-400">
              InnovateLab
            </div>
            <div className="text-2xl font-bold text-gray-400">DataFlow</div>
          </div>
        </div>
      </div>
    </div>
  );
}
