"use client";

import { ResumeUpload } from "@/components/candidates/ResumeUpload";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CandidateDashboard() {
  const [uploadData, setUploadData] = useState<any>(null);

  const handleUploadSuccess = (data: any) => {
    setUploadData(data);
  };

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Candidate Portal</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Upload your resume to get instant insights, take skill assessments,
          and match with the best opportunities.
        </p>
      </div>

      {!uploadData ? (
        <div className="max-w-3xl mx-auto">
          <ResumeUpload onUploadSuccess={handleUploadSuccess} />
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Resume Processed Successfully
              </CardTitle>
              <CardDescription className="text-green-700">
                We've analyzed your resume and extracted your key skills and
                experience.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold mb-2">Extracted Info</h3>
                  <ul className="text-sm space-y-1">
                    <li>
                      <strong>Name:</strong> {uploadData.name}
                    </li>
                    <li>
                      <strong>Email:</strong> {uploadData.email}
                    </li>
                    <li>
                      <strong>Experience:</strong> {uploadData.experience_years}{" "}
                      years
                    </li>
                  </ul>
                </div>
                <div className="flex flex-col justify-center items-start gap-4">
                  <Button asChild className="w-full">
                    <Link href="/candidates/insights">
                      View Detailed Insights{" "}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="secondary" className="w-full">
                    <Link href="/candidates/quizzes">
                      Take Skill Quizzes <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
