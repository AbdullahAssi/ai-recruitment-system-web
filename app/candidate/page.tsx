"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  User,
  Mail,
  Briefcase,
  FileText,
  CheckCircle,
} from "lucide-react";

interface CandidateData {
  id: string;
  name: string;
  email: string;
  experience: number;
}

export default function CandidatePage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    experience: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    candidate: CandidateData;
    resume: {
      id: string;
      fileName: string;
      uploadDate: string;
    };
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("experience", formData.experience);
    formDataToSend.append("resume", file);

    try {
      const response = await fetch("/api/upload/resume", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();
      if (data.success) {
        setResult(data);
        setFormData({ name: "", email: "", experience: "" });
        setFile(null);
      } else {
        alert(data.error || "Failed to upload resume");
      }
    } catch (error) {
      console.error("Error uploading resume:", error);
      alert("Failed to upload resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Candidate Portal
          </h1>
          <p className="text-gray-600">
            Upload your resume and get your skills analyzed
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Upload Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Your Resume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    required
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    required
                    placeholder="Enter your email address"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="experience"
                    className="flex items-center gap-2"
                  >
                    <Briefcase className="w-4 h-4" />
                    Years of Experience
                  </Label>
                  <Input
                    id="experience"
                    type="number"
                    min="0"
                    max="50"
                    value={formData.experience}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        experience: e.target.value,
                      }))
                    }
                    required
                    placeholder="Enter years of experience"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resume" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Resume File
                  </Label>
                  <Input
                    id="resume"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    required
                    className="cursor-pointer"
                  />
                  <p className="text-sm text-gray-500">
                    Supported formats: PDF, DOC, DOCX, TXT (Max 5MB)
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Processing..." : "Upload Resume"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  Resume Processed Successfully
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Candidate Information
                  </h3>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                    <p>
                      <strong>Name:</strong> {result.candidate.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {result.candidate.email}
                    </p>
                    <p>
                      <strong>Experience:</strong> {result.candidate.experience}{" "}
                      years
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Resume Information
                  </h3>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                    <p>
                      <strong>File Name:</strong> {result.resume.fileName}
                    </p>
                    <p>
                      <strong>Upload Date:</strong>{" "}
                      {new Date(result.resume.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Resume uploaded successfully and ready for processing.
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    Your profile has been created successfully. Share your
                    Candidate ID with HR for job matching:
                  </p>
                  <div className="bg-blue-50 p-2 rounded mt-2">
                    <code className="text-blue-800 font-mono text-sm">
                      {result.candidate.id}
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
