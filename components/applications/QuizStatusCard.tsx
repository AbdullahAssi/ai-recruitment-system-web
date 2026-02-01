"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, FileQuestion } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ApplicationWithQuiz {
  id: string;
  status: string;
  quizCompleted: boolean;
  quizAttempt?: any;
}

interface QuizStatusCardProps {
  applicationId: string;
}

export function QuizStatusCard({ applicationId }: QuizStatusCardProps) {
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<ApplicationWithQuiz | null>(
    null,
  );
  const [error, setError] = useState("");

  useEffect(() => {
    fetchApplicationWithQuiz();
  }, [applicationId]);

  const fetchApplicationWithQuiz = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/applications/${applicationId}/quiz`);

      if (!response.ok) {
        throw new Error("Failed to fetch quiz status");
      }

      const data = await response.json();
      setApplication(data.application);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error || !application) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="w-4 h-4" />
        <AlertDescription>
          {error || "Quiz information not available"}
        </AlertDescription>
      </Alert>
    );
  }

  const getStatusBadge = () => {
    if (application.quizCompleted) {
      return (
        <Badge variant="default" className="bg-green-600">
          Completed
        </Badge>
      );
    } else if (application.status === "QUIZ_PENDING") {
      return <Badge variant="secondary">Pending</Badge>;
    } else {
      return <Badge variant="outline">Not Started</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileQuestion className="w-5 h-5" />
            Assessment Status
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        {application.quizCompleted && application.quizAttempt ? (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Score:</span>
              <span className="font-semibold">
                {application.quizAttempt.score?.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Correct Answers:</span>
              <span className="font-semibold">
                {application.quizAttempt.correctAnswers}/
                {application.quizAttempt.totalQuestions}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Result:</span>
              <span
                className={`font-semibold ${
                  application.quizAttempt.passed
                    ? "text-green-600"
                    : "text-yellow-600"
                }`}
              >
                {application.quizAttempt.passed ? "Passed" : "Failed"}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Assessment not yet completed
          </p>
        )}
      </CardContent>
    </Card>
  );
}
