"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, Award, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface QuizAttemptViewProps {
  quizAttempt: {
    id: string;
    score: number;
    passed: boolean;
    totalQuestions: number;
    correctAnswers: number;
    startedAt: string;
    completedAt: string | null;
    timeSpent: number | null;
    questions: any[];
    answers: Record<string, string>;
  };
  quiz: {
    title: string;
    passingScore: number;
  };
  showDetails?: boolean;
}

export function QuizAttemptView({
  quizAttempt,
  quiz,
  showDetails = true,
}: QuizAttemptViewProps) {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card
        className={
          quizAttempt.passed ? "border-green-500" : "border-yellow-500"
        }
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              {quizAttempt.passed ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-yellow-600" />
              )}
              {quiz.title}
            </CardTitle>
            <Badge
              variant={quizAttempt.passed ? "default" : "secondary"}
              className="text-base px-3 py-1"
            >
              {quizAttempt.score?.toFixed(1) || 0}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-background">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <div>
                <div className="text-xl font-bold">
                  {quizAttempt.correctAnswers}/{quizAttempt.totalQuestions}
                </div>
                <div className="text-xs text-muted-foreground">Correct</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg bg-background">
              <Award className="w-6 h-6 text-yellow-600" />
              <div>
                <div className="text-xl font-bold">
                  {quizAttempt.score?.toFixed(1) || 0}%
                </div>
                <div className="text-xs text-muted-foreground">
                  Pass: {quiz.passingScore}%
                </div>
              </div>
            </div>

            {quizAttempt.timeSpent && (
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-background">
                <Clock className="w-6 h-6 text-purple-600" />
                <div>
                  <div className="text-xl font-bold">
                    {formatTime(quizAttempt.timeSpent)}
                  </div>
                  <div className="text-xs text-muted-foreground">Duration</div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-3 border rounded-lg bg-background">
              {quizAttempt.passed ? (
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              ) : (
                <XCircle className="w-6 h-6 text-yellow-600" />
              )}
              <div>
                <div className="text-xl font-bold">
                  {quizAttempt.passed ? "Passed" : "Failed"}
                </div>
                <div className="text-xs text-muted-foreground">Status</div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Score</span>
              <span>{quizAttempt.score?.toFixed(1) || 0}%</span>
            </div>
            <Progress value={quizAttempt.score || 0} className="h-2" />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Started:</span>
              <div className="font-medium">
                {formatDate(quizAttempt.startedAt)}
              </div>
            </div>
            {quizAttempt.completedAt && (
              <div>
                <span className="text-muted-foreground">Completed:</span>
                <div className="font-medium">
                  {formatDate(quizAttempt.completedAt)}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Questions (Optional) */}
      {showDetails && quizAttempt.questions && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Question Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quizAttempt.questions.map((question: any, index: number) => {
              const userAnswer = quizAttempt.answers[question.id];
              const isCorrect = userAnswer === question.correct_answer;

              return (
                <div
                  key={question.id}
                  className={`p-3 border rounded-lg text-sm ${
                    isCorrect
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="font-medium mb-1">
                        Q{index + 1}: {question.question}
                      </div>
                      {question.category && (
                        <Badge variant="outline" className="text-xs mb-2">
                          {question.category}
                        </Badge>
                      )}
                      <div className="space-y-1 text-xs">
                        <div>
                          <span className="text-muted-foreground">
                            Candidate:{" "}
                          </span>
                          <span
                            className={
                              isCorrect ? "text-green-700" : "text-red-700"
                            }
                          >
                            {question.options[userAnswer] || "Not answered"}
                          </span>
                        </div>
                        {!isCorrect && (
                          <div>
                            <span className="text-muted-foreground">
                              Correct:{" "}
                            </span>
                            <span className="text-green-700">
                              {question.options[question.correct_answer]}
                            </span>
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
      )}
    </div>
  );
}
