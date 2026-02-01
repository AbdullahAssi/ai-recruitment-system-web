"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface QuizNavigationProps {
  currentQuestion: number;
  totalQuestions: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
}

export function QuizNavigation({
  currentQuestion,
  totalQuestions,
  onPrevious,
  onNext,
  onSubmit,
  canSubmit,
}: QuizNavigationProps) {
  const isFirstQuestion = currentQuestion === 1;
  const isLastQuestion = currentQuestion === totalQuestions;

  return (
    <div className="flex items-center justify-between gap-4">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={isFirstQuestion}
        className="flex items-center gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </Button>

      <div className="text-sm text-muted-foreground">
        {currentQuestion} / {totalQuestions}
      </div>

      {isLastQuestion ? (
        <Button
          onClick={onSubmit}
          disabled={!canSubmit}
          className="flex items-center gap-2"
        >
          Submit Quiz
        </Button>
      ) : (
        <Button onClick={onNext} className="flex items-center gap-2">
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
