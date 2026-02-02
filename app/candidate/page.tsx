"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  FileText,
  CheckCircle,
  Clock,
  TrendingUp,
  Upload,
  ClipboardList,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface PendingQuiz {
  id: string;
  appliedAt: string;
  job: {
    id: string;
    title: string;
    location: string;
  };
}

export default function CandidatePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    interviewScheduled: 0,
    jobsAvailable: 0,
  });
  const [pendingQuizzes, setPendingQuizzes] = useState<PendingQuiz[]>([]);

  useEffect(() => {
    // Fetch candidate stats
    const fetchStats = async () => {
      if (!user?.candidate?.id) return;

      try {
        // Fetch applications
        const appsResponse = await fetch(
          `/api/applications?candidateId=${user.candidate.id}`,
        );
        const appsData = await appsResponse.json();

        // Fetch available jobs
        const jobsResponse = await fetch("/api/jobs");
        const jobsData = await jobsResponse.json();

        if (appsData.success && jobsData.success) {
          const applications = appsData.applications || [];
          const pendingApps = applications.filter(
            (app: any) =>
              app.status === "PENDING" || app.status === "UNDER_REVIEW",
          );
          const interviewApps = applications.filter(
            (app: any) => app.status === "INTERVIEW",
          );

          // Filter applications with pending quizzes
          const quizPendingApps = applications.filter(
            (app: any) => app.status === "QUIZ_PENDING",
          );
          setPendingQuizzes(quizPendingApps);

          setStats({
            totalApplications: applications.length,
            pendingApplications: pendingApps.length,
            interviewScheduled: interviewApps.length,
            jobsAvailable: jobsData.jobs?.length || 0,
          });
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };

    fetchStats();
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track your applications and discover new opportunities.
          </p>
        </div>
        <Link href="/candidate/jobs">
          <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
            <Briefcase className="w-4 h-4 mr-2" />
            Browse Jobs
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                My Applications
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalApplications}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Total submitted
              </p>
            </div>
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 group-hover:scale-110 transition-transform duration-300">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Under Review
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.pendingApplications}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Being reviewed
              </p>
            </div>
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/30 group-hover:scale-110 transition-transform duration-300">
              <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Interviews
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.interviewScheduled}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Scheduled
              </p>
            </div>
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 group-hover:scale-110 transition-transform duration-300">
              <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Available Jobs
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.jobsAvailable}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Open positions
              </p>
            </div>
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Pending Quizzes Alert */}
      {pendingQuizzes.length > 0 && (
        <div className="rounded-xl border border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-500 dark:bg-orange-600">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-200">
                Pending Quiz Assessments
              </h3>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                {pendingQuizzes.length} quiz
                {pendingQuizzes.length > 1 ? "s" : ""} waiting to be completed
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {pendingQuizzes.map((app) => (
              <div
                key={app.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-gray-900 rounded-lg border border-orange-200 dark:border-orange-800 hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {app.job.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {app.job.location} • Applied{" "}
                    {new Date(app.appliedAt).toLocaleDateString()}
                  </p>
                </div>
                <Link href={`/candidate/quiz/${app.id}`}>
                  <Button
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-800 w-full sm:w-auto"
                  >
                    <ClipboardList className="w-4 h-4 mr-2" />
                    Take Quiz
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
          <span>Quick Actions</span>
        </h2>
        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/candidate/jobs">
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 cursor-pointer group text-center">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Briefcase className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
                Browse Jobs
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Find your next opportunity
              </p>
            </div>
          </Link>

          <Link href="/candidate/applications">
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 cursor-pointer group text-center">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
                My Applications
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Track application status
              </p>
            </div>
          </Link>

          <Link href="/candidate/profile">
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-300 cursor-pointer group text-center">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Upload className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mb-2">
                Update Profile
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Keep your profile current
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your latest application updates
            </p>
          </div>
        </div>
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mx-auto mb-4">
            <FileText className="w-8 h-8 opacity-50" />
          </div>
          <p className="font-medium">No recent activity to display</p>
          <p className="text-sm mt-2">
            Start applying to jobs to see your activity here
          </p>
        </div>
      </div>
    </div>
  );
}

// OLD UPLOAD FUNCTIONALITY MOVED TO /candidate/profile
// export default function OldCandidatePage() {
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     experience: "",
//   });
//   const [file, setFile] = useState<File | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState<{
//     candidate: CandidateData;
//     resume: {
//       id: string;
//       fileName: string;
//       uploadDate: string;
//     };
//   } | null>(null);
//   const { toast } = useToast();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!file) {
//       toast({
//         title: "Error",
//         description: "Please select a file to upload",
//         variant: "destructive",
//       });
//       return;
//     }

//     setLoading(true);
//     const formDataToSend = new FormData();
//     formDataToSend.append("name", formData.name);
//     formDataToSend.append("email", formData.email);
//     formDataToSend.append("experience", formData.experience);
//     formDataToSend.append("resume", file);

//     try {
//       const response = await fetch("/api/upload/resume", {
//         method: "POST",
//         body: formDataToSend,
//       });

//       const data = await response.json();
//       if (data.success) {
//         setResult(data);
//         setFormData({ name: "", email: "", experience: "" });
//         setFile(null);
//         toast({
//           title: "Success!",
//           description:
//             "Resume uploaded successfully. Your candidate ID is: " +
//             data.candidate.id,
//         });
//       } else {
//         toast({
//           title: "Upload Failed",
//           description: data.error || "Failed to upload resume",
//           variant: "destructive",
//         });
//       }
//     } catch (error) {
//       console.error("Error uploading resume:", error);
//       toast({
//         title: "Upload Failed",
//         description: "An unexpected error occurred while uploading your resume",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
//       <div className="max-w-4xl mx-auto">
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">
//             Candidate Portal
//           </h1>
//           <p className="text-gray-600">
//             Upload your resume and get your skills analyzed
//           </p>
//         </div>

//         <div className="grid md:grid-cols-2 gap-8">
//           {/* Upload Form */}
//           <Card className="shadow-lg">
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <Upload className="w-5 h-5" />
//                 Upload Your Resume
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <form onSubmit={handleSubmit} className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="name" className="flex items-center gap-2">
//                     <User className="w-4 h-4" />
//                     Full Name
//                   </Label>
//                   <Input
//                     id="name"
//                     value={formData.name}
//                     onChange={(e) =>
//                       setFormData((prev) => ({ ...prev, name: e.target.value }))
//                     }
//                     required
//                     placeholder="Enter your full name"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="email" className="flex items-center gap-2">
//                     <Mail className="w-4 h-4" />
//                     Email Address
//                   </Label>
//                   <Input
//                     id="email"
//                     type="email"
//                     value={formData.email}
//                     onChange={(e) =>
//                       setFormData((prev) => ({
//                         ...prev,
//                         email: e.target.value,
//                       }))
//                     }
//                     required
//                     placeholder="Enter your email address"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label
//                     htmlFor="experience"
//                     className="flex items-center gap-2"
//                   >
//                     <Briefcase className="w-4 h-4" />
//                     Years of Experience
//                   </Label>
//                   <Input
//                     id="experience"
//                     type="number"
//                     min="0"
//                     max="50"
//                     value={formData.experience}
//                     onChange={(e) =>
//                       setFormData((prev) => ({
//                         ...prev,
//                         experience: e.target.value,
//                       }))
//                     }
//                     required
//                     placeholder="Enter years of experience"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="resume" className="flex items-center gap-2">
//                     <FileText className="w-4 h-4" />
//                     Resume File
//                   </Label>
//                   <Input
//                     id="resume"
//                     type="file"
//                     accept=".pdf,.doc,.docx,.txt"
//                     onChange={(e) => setFile(e.target.files?.[0] || null)}
//                     required
//                     className="cursor-pointer"
//                   />
//                   <p className="text-sm text-gray-500">
//                     Supported formats: PDF, DOC, DOCX, TXT (Max 5MB)
//                   </p>
//                 </div>

//                 <Button type="submit" className="w-full" disabled={loading}>
//                   {loading ? "Processing..." : "Upload Resume"}
//                 </Button>
//               </form>
//             </CardContent>
//           </Card>

//           {/* Results */}
//           {result && (
//             <Card className="shadow-lg">
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2 text-green-700">
//                   <CheckCircle className="w-5 h-5" />
//                   Resume Processed Successfully
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div>
//                   <h3 className="font-semibold text-gray-900 mb-2">
//                     Candidate Information
//                   </h3>
//                   <div className="bg-gray-50 p-3 rounded-lg space-y-1">
//                     <p>
//                       <strong>Name:</strong> {result.candidate.name}
//                     </p>
//                     <p>
//                       <strong>Email:</strong> {result.candidate.email}
//                     </p>
//                     <p>
//                       <strong>Experience:</strong> {result.candidate.experience}{" "}
//                       years
//                     </p>
//                   </div>
//                 </div>

//                 <div>
//                   <h3 className="font-semibold text-gray-900 mb-2">
//                     Resume Information
//                   </h3>
//                   <div className="bg-gray-50 p-3 rounded-lg space-y-1">
//                     <p>
//                       <strong>File Name:</strong> {result.resume.fileName}
//                     </p>
//                     <p>
//                       <strong>Upload Date:</strong>{" "}
//                       {new Date(result.resume.uploadDate).toLocaleDateString()}
//                     </p>
//                   </div>
//                   <p className="text-sm text-gray-600 mt-2">
//                     Resume uploaded successfully and ready for processing.
//                   </p>
//                 </div>

//                 <div className="pt-4 border-t">
//                   <p className="text-sm text-gray-600">
//                     Your profile has been created successfully. Share your
//                     Candidate ID with HR for job matching:
//                   </p>
//                   <div className="bg-blue-50 p-2 rounded mt-2">
//                     <code className="text-blue-800 font-mono text-sm">
//                       {result.candidate.id}
//                     </code>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
