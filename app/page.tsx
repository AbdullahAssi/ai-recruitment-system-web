import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  FileText,
  TrendingUp,
  Zap,
  Briefcase,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Target,
  Brain,
  Clock,
  Star,
  ChevronRight,
  Play,
  Shield,
  Award,
  BarChart3,
  Home,
} from "lucide-react";
import HiringAutomationSection from "./card";
import HiringStepsSection from "./anothercard";
import FAQSection from "./faqs";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white ">
      {/* Header */}
  
      {/* Hero Section */}
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

      <HiringAutomationSection />

      <HiringStepsSection />
      {/* Features Section */}
      {/* <div className="bg-slate-800/50 backdrop-blur-sm border-t border-slate-800">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Changing the Norm
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              We have simplified hiring with AI automation and data-driven
              insights.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300 group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-white">
                  AI-Powered Screening
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-400 text-sm leading-relaxed">
                  Unlock faster, smarter screening with automated resume
                  analysis.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300 group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-white">
                  Interview Scheduling
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-400 text-sm leading-relaxed">
                  Automate interview coordination and eliminate back-and-forth.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300 group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-white">
                  Candidate Skill Matching
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-400 text-sm leading-relaxed">
                  Match candidates to roles based on skills and experience using
                  AI.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300 group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-white">
                  Real-Time Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-400 text-sm leading-relaxed">
                  View candidate funnel performance and hiring KPIs instantly.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div> */}

      {/* How It Works Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-purple-600 mb-4">
            Getting Started
          </h2>
          <p className="text-2xl text-gray-300 mb-2">
            Effortless Hiring with AI
          </p>
          <p className="text-xl text-purple-400 mb-4">
            Screen, Evaluate & Hire Faster
          </p>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            Streamline your hiring process with AI tools built for speed,
            accuracy, and smarter decisions.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 border-slate-700 relative overflow-hidden">
            <div className="absolute top-4 left-4 bg-purple-500 text-white text-sm font-bold px-3 py-1 rounded-full">
              Step 01
            </div>
            <CardHeader className="pt-12">
              <CardTitle className="text-2xl text-white mb-4">
                Book a Screening
              </CardTitle>
              <p className="text-gray-400 mb-6">
                Easily schedule an AI-driven candidate screening with our system
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  Automate interview scheduling
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  Integrate with calendars
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  Choose from partner recruitment platforms
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 border-slate-700 relative overflow-hidden">
            <div className="absolute top-4 left-4 bg-purple-500 text-white text-sm font-bold px-3 py-1 rounded-full">
              Step 02
            </div>
            <CardHeader className="pt-16">
              <CardTitle className="text-2xl text-white mb-4">
                Review AI Insights
              </CardTitle>
              <p className="text-gray-400 mb-6">
                Gain deep candidate insights with our powerful AI engine.
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  View top skill matches and candidate fit
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  Understand location and role preferences
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  Get data-backed recommendations
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 border-slate-700 relative overflow-hidden">
            <div className="absolute top-4 left-4 bg-purple-500 text-white text-sm font-bold px-3 py-1 rounded-full">
              Step 03
            </div>
            <CardHeader className="pt-16">
              <CardTitle className="text-2xl text-white mb-4">
                Select the Best Match
              </CardTitle>
              <p className="text-gray-400 mb-6">
                Quickly choose from top-matched candidates with confidence.
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  Use smart filters and compatibility scores
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  Access interview-ready profiles
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  Make decisions backed by real data
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      {/* <div className="bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Your hiring process, reimagined with AI.
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
            Join thousands of companies already using AI to transform their
            recruitment process.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/candidate">
              <Button
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto bg-white text-purple-600 hover:bg-gray-100 h-14 px-8 text-lg font-semibold"
              >
                <Users className="w-5 h-5 mr-2" />
                Start As Candidate
              </Button>
            </Link>
            <Link href="/hr">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-purple-600 h-14 px-8 text-lg"
              >
                <Briefcase className="w-5 h-5 mr-2" />
                HR Portal Access
              </Button>
            </Link>
          </div>
        </div>
      </div> */}


        <FAQSection />
      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800">
        <div className="container max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                {/* <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center"> */}
                  <Brain className="w-5 h-5 text-white" />
                {/* </div> */}
                <span className="text-xl font-bold text-white"> Recruit.ai</span>
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
    </div>
  );
}
