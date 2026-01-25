import { useState } from "react";
import type {
  QuizGenerationRequest,
  QuizGenerationResponse,
  QuizSubmissionResponse,
  QuizQuestion,
} from "@/lib/types/fastapi.types";

export function useQuiz() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateQuiz = async (
    request: QuizGenerationRequest,
  ): Promise<QuizGenerationResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/fastapi/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate quiz");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to generate quiz";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const submitQuiz = async (
    questions: QuizQuestion[],
    answers: Record<string, string>,
  ): Promise<QuizSubmissionResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/fastapi/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions, answers }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit quiz");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to submit quiz";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const validateAnswer = async (
    question: QuizQuestion,
    userAnswer: string,
  ): Promise<{ is_correct: boolean; explanation: string } | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/fastapi/quiz/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, user_answer: userAnswer }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to validate answer");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to validate answer";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    generateQuiz,
    submitQuiz,
    validateAnswer,
  };
}
