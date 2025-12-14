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
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CandidatePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    interviewScheduled: 0,
    jobsAvailable: 0,
  });

  useEffect(() => {
    // Fetch candidate stats
    const fetchStats = async () => {
      try {
        // API endpoints to be implemented
        setStats({
          totalApplications: 0,
          pendingApplications: 0,
          interviewScheduled: 0,
          jobsAvailable: 0,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Track your applications and discover new opportunities.
          </p>
        </div>
        <Link href="/candidate/jobs">
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Briefcase className="w-4 h-4 mr-2" />
            Browse Jobs
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              My Applications
            </CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplications}</div>
            <p className="text-xs text-muted-foreground">Total submitted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.pendingApplications}
            </div>
            <p className="text-xs text-muted-foreground">Being reviewed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Interviews</CardTitle>
            <CheckCircle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.interviewScheduled}</div>
            <p className="text-xs text-muted-foreground">Scheduled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Available Jobs
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.jobsAvailable}</div>
            <p className="text-xs text-muted-foreground">Open positions</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Link href="/candidate/jobs">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="text-center p-6">
              <Briefcase className="w-10 h-10 mx-auto mb-3 text-purple-600 group-hover:text-purple-700 transition-colors" />
              <CardTitle className="text-lg">Browse Jobs</CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Find your next opportunity
              </p>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/candidate/applications">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="text-center p-6">
              <FileText className="w-10 h-10 mx-auto mb-3 text-blue-600 group-hover:text-blue-700 transition-colors" />
              <CardTitle className="text-lg">My Applications</CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Track application status
              </p>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/candidate/profile">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="text-center p-6">
              <Upload className="w-10 h-10 mx-auto mb-3 text-green-600 group-hover:text-green-700 transition-colors" />
              <CardTitle className="text-lg">Update Profile</CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Keep your profile current
              </p>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Recent Activity or Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>No recent activity to display</p>
            <p className="text-sm mt-2">
              Start applying to jobs to see your activity here
            </p>
          </div>
        </CardContent>
      </Card>
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
