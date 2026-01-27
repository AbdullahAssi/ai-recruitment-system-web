"use client";

import { useState } from "react";
import { QuizGenerator } from "@/components/quiz/QuizGenerator";
import { QuizAttempt } from "@/components/quiz/QuizAttempt";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type {
  QuizQuestion,
  QuizSubmissionResponse,
} from "@/lib/types/fastapi.types";

export default function QuizzesPage() {
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [activeQuiz, setActiveQuiz] = useState(false);

  const handleQuizGenerated = (generatedQuestions: QuizQuestion[]) => {
    setQuestions(generatedQuestions);
    setActiveQuiz(true);
  };

  const handleQuizComplete = (result: QuizSubmissionResponse) => {
    // We can save the result or show a summary
    // The QuizAttempt component handles showing the immediate result
  };

  const resetQuiz = () => {
    setQuestions(null);
    setActiveQuiz(false);
  };

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link href="/candidates/dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Skill Assessment</h1>
        <p className="text-muted-foreground">
          Generate a custom quiz based on a job description to test your
          readiness.
        </p>
      </div>

      {!activeQuiz ? (
        <QuizGenerator onQuizGenerated={handleQuizGenerated} />
      ) : (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button variant="outline" onClick={resetQuiz}>
              Start New Quiz
            </Button>
          </div>
          {questions && (
            <QuizAttempt
              questions={questions}
              onComplete={handleQuizComplete}
            />
          )}
        </div>
      )}
    </div>
  );
}
