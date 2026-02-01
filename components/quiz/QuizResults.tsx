"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Award, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";

interface QuizResultDetail {
  question_id: number;
  is_correct: boolean;
  user_answer: string;
  correct_answer: string;
  explanation?: string;
}

interface QuizResultsProps {
  results: {
    totalQuestions: number;
    correctAnswers: number;
    score: number;
    passed: boolean;
    passingScore: number;
    feedback: string;
    details: QuizResultDetail[];
  };
  questions: any[];
  timeSpent?: number;
  onReturnToDashboard?: () => void;
}

export function QuizResults({
  results,
  questions,
  timeSpent,
  onReturnToDashboard,
}: QuizResultsProps) {
  const router = useRouter();

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  return (
    <div className="space-y-6">
      {/* Overall Result Card */}
      <Card className={results.passed ? "border-green-500" : "border-red-500"}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {results.passed ? (
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600" />
              )}
              {results.passed ? "Congratulations!" : "Keep Trying!"}
            </CardTitle>
            <Badge
              variant={results.passed ? "default" : "destructive"}
              className="text-lg px-4 py-2"
            >
              {results.score.toFixed(1)}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{results.feedback}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">
                  {results.correctAnswers}/{results.totalQuestions}
                </div>
                <div className="text-sm text-muted-foreground">
                  Correct Answers
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Award className="w-8 h-8 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">
                  {results.score.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Passing: {results.passingScore}%
                </div>
              </div>
            </div>

            {timeSpent && (
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <Clock className="w-8 h-8 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold">
                    {formatTime(timeSpent)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Time Spent
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Your Score</span>
              <span>{results.score.toFixed(1)}%</span>
            </div>
            <Progress value={results.score} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      <Card>
        <CardHeader>
          <CardTitle>Question by Question Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {results.details.map((detail, index) => {
            const question = questions.find((q) => q.id === detail.question_id);
            if (!question) return null;

            return (
              <div
                key={detail.question_id}
                className={`p-4 border rounded-lg ${
                  detail.is_correct
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  {detail.is_correct ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-1" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 mt-1" />
                  )}
                  <div className="flex-1 space-y-2">
                    <div className="font-medium">
                      Q{index + 1}: {question.question}
                    </div>
                    <div className="text-sm space-y-1">
                      <div>
                        <span className="font-medium">Your answer: </span>
                        <span
                          className={
                            detail.is_correct
                              ? "text-green-700"
                              : "text-red-700"
                          }
                        >
                          {question.options[detail.user_answer]}
                        </span>
                      </div>
                      {!detail.is_correct && (
                        <div>
                          <span className="font-medium">Correct answer: </span>
                          <span className="text-green-700">
                            {question.options[detail.correct_answer]}
                          </span>
                        </div>
                      )}
                      {detail.explanation && (
                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded text-blue-900">
                          <span className="font-medium">Explanation: </span>
                          {detail.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={() => router.push("/candidate")}
          variant="outline"
          size="lg"
        >
          Return to Dashboard
        </Button>
        <Button onClick={() => router.push("/candidate/jobs")} size="lg">
          Browse More Jobs
        </Button>
      </div>
    </div>
  );
}
