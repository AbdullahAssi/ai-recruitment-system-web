"use client";

import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle } from "lucide-react";

interface QuizProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  answeredQuestions: number[];
}

export function QuizProgress({
  currentQuestion,
  totalQuestions,
  answeredQuestions,
}: QuizProgressProps) {
  const progressPercentage = (answeredQuestions.length / totalQuestions) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">
          Question {currentQuestion} of {totalQuestions}
        </span>
        <span className="text-muted-foreground">
          {answeredQuestions.length} answered
        </span>
      </div>
      <Progress value={progressPercentage} className="h-2" />
      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: totalQuestions }, (_, i) => {
          const questionNumber = i + 1;
          const isAnswered = answeredQuestions.includes(questionNumber);
          const isCurrent = questionNumber === currentQuestion;

          return (
            <div
              key={questionNumber}
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium ${
                isCurrent
                  ? "border-primary bg-primary text-primary-foreground"
                  : isAnswered
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-300 bg-gray-50 text-gray-500"
              }`}
            >
              {isAnswered && !isCurrent ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                questionNumber
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
