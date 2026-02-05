"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuizCard } from "@/components/quiz/QuizCard";
import { QuizTimer } from "@/components/quiz/QuizTimer";
import { QuizProgress } from "@/components/quiz/QuizProgress";
import { QuizNavigation } from "@/components/quiz/QuizNavigation";
import { QuizResults } from "@/components/quiz/QuizResults";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type QuizQuestion = {
  id: number;
  question: string;
  options: Record<string, string>;
  correct_answer: string;
  explanation?: string;
  difficulty?: string;
  category?: string;
};

type QuizState =
  | "loading"
  | "ready"
  | "in-progress"
  | "submitting"
  | "completed";

export default function QuizAssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.applicationId as string;

  const [state, setState] = useState<QuizState>("loading");
  const [quizAttemptId, setQuizAttemptId] = useState<string>("");
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [startTime, setStartTime] = useState<number>(0);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showTimeUpDialog, setShowTimeUpDialog] = useState(false);

  // Prevent duplicate quiz generation calls
  const isGeneratingRef = useRef(false);

  // Generate quiz on mount
  useEffect(() => {
    if (!isGeneratingRef.current) {
      isGeneratingRef.current = true;
      generateQuiz();
    }
  }, []);

  // Quiz Restrictions
  const [showInstructions, setShowInstructions] = useState(false);
  const [violationType, setViolationType] = useState<string | null>(null);

  // Prevention Event Listeners
  useEffect(() => {
    if (state !== "in-progress") return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation("Tab switching/Minimizing window");
      }
    };

    const handleBlur = () => {
      handleViolation("Window focus lost");
    };

    const handleCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      // Optional: Toast warning? Or just silent block as requested "no warnings"
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("copy", handleCopyPaste);
    document.addEventListener("cut", handleCopyPaste);
    document.addEventListener("paste", handleCopyPaste);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("copy", handleCopyPaste);
      document.removeEventListener("cut", handleCopyPaste);
      document.removeEventListener("paste", handleCopyPaste);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [state]);

  const handleViolation = (reason: string) => {
    if (state === "submitting" || state === "completed" || violationType)
      return;

    setViolationType(reason);
    submitQuiz(reason);
  };

  const startQuiz = () => {
    setShowInstructions(false);
    setStartTime(Date.now());
    setState("in-progress");
  };

  const generateQuiz = async () => {
    try {
      setState("loading");
      const response = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          numQuestions: 10,
          difficulty: "medium",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate quiz");
      }

      const data = await response.json();
      setQuizAttemptId(data.quizAttemptId);
      setQuiz(data.quiz);
      setQuestions(data.questions);

      // If quiz is already completed, show results
      if (data.isCompleted) {
        fetchResults(data.quizAttemptId);
        return;
      }

      // Load existing answers if any
      if (
        data.existingAnswers &&
        Object.keys(data.existingAnswers).length > 0
      ) {
        setAnswers(data.existingAnswers);
      }

      // Show instructions before starting
      setShowInstructions(true);
      setState("ready");
    } catch (error: any) {
      console.error("Error generating quiz:", error);
      setError(error.message);
      setState("ready");
    }
  };

  const fetchResults = async (attemptId: string) => {
    try {
      const response = await fetch(`/api/quiz/${attemptId}/results`);
      if (!response.ok) throw new Error("Failed to fetch results");

      const data = await response.json();
      setResults(data.results);
      setState("completed");
    } catch (error) {
      console.error("Error fetching results:", error);
      // If can't fetch results but quiz is completed, show error
      setError(
        "This quiz has already been completed. Results may not be available.",
      );
      setState("ready");
    }
  };

  const handleAnswerSelect = (questionId: number, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));

    // Auto-save progress
    saveProgress({ ...answers, [questionId]: answer });
  };

  const saveProgress = async (currentAnswers: Record<number, string>) => {
    try {
      await fetch(`/api/quiz/${quizAttemptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: currentAnswers }),
      });
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitConfirm = () => {
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < questions.length) {
      setShowSubmitDialog(true);
    } else {
      submitQuiz();
    }
  };

  const handleTimeUp = () => {
    setShowTimeUpDialog(true);
    // Auto-submit after 5 seconds
    setTimeout(() => {
      submitQuiz();
    }, 5000);
  };

  const submitQuiz = async (violationReason?: string) => {
    try {
      setState("submitting");
      setShowSubmitDialog(false);
      setShowTimeUpDialog(false);

      const timeSpent = Math.floor((Date.now() - startTime) / 1000);

      const response = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizAttemptId,
          answers,
          timeSpent,
          violation: violationReason, // Backend might support this, or we just log it
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit quiz");
      }

      const data = await response.json();
      setResults({ ...data.results, timeSpent });
      setState("completed");
    } catch (error: any) {
      console.error("Error submitting quiz:", error);
      setError(error.message);
      setState("in-progress");
    }
  };

  // Loading state
  if (state === "loading") {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium">Generating your assessment...</p>
            <p className="text-sm text-muted-foreground mt-2">
              This may take a few moments
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/candidate")} className="mt-4">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  // Completed state - Show results
  if (state === "completed" && results) {
    return (
      <div className="container mx-auto py-8 max-w-7xl">
        {violationType && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription className="font-semibold">
              Quiz Terminated: {violationType}. Your answers have been submitted
              as-is.
            </AlertDescription>
          </Alert>
        )}
        <QuizResults
          results={results}
          questions={questions}
          timeSpent={results.timeSpent}
        />
      </div>
    );
  }

  // Instructions State
  if (showInstructions) {
    return (
      <div className="container mx-auto py-8 max-w-7xl">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
              Assessment Rules & Regulations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <p className="text-yellow-900 font-medium mb-2">
                Zero Tolerance Policy
              </p>
              <p className="text-yellow-800 text-sm">
                To ensure the integrity of this assessment, strict anti-cheating
                measures are in place. Any violation will result in{" "}
                <strong>immediate termination</strong> of your session.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Please read carefully:</h3>
              <ul className="space-y-3 list-disc list-inside text-gray-700">
                <li>You must keep this tab open and active at all times.</li>
                <li>
                  <strong>Do not</strong> switch tabs or minimize the browser
                  window.
                </li>
                <li>
                  <strong>Do not</strong> attempt to copy questions or paste
                  answers.
                </li>
                <li>Right-click context menu is disabled.</li>
                <li>Once started, the timer cannot be paused.</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={startQuiz}
                className="w-full sm:w-auto bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                I Understand & Start Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // In-progress state
  const currentQuestion = questions[currentQuestionIndex];
  const answeredQuestions = Object.keys(answers).map((id) => parseInt(id));
  const canSubmit = Object.keys(answers).length === questions.length;

  return (
    <div
      className="container mx-auto py-8 max-w-7xl select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">{quiz?.title}</CardTitle>
              <QuizTimer
                duration={10}
                onTimeUp={handleTimeUp}
                isActive={state === "in-progress"}
              />
            </div>
            {quiz?.description && (
              <p className="text-muted-foreground">{quiz.description}</p>
            )}
            <div className="text-xs text-red-500 font-semibold mt-2 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Do not switch tabs or leave this window.
            </div>
          </CardHeader>
        </Card>

        {/* Progress */}
        <Card>
          <CardContent className="pt-6">
            <QuizProgress
              currentQuestion={currentQuestionIndex + 1}
              totalQuestions={questions.length}
              answeredQuestions={answeredQuestions}
            />
          </CardContent>
        </Card>

        {/* Current Question */}
        {currentQuestion && (
          <QuizCard
            key={currentQuestion.id}
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            selectedAnswer={answers[currentQuestion.id]}
            onAnswerSelect={handleAnswerSelect}
          />
        )}

        {/* Navigation */}
        <Card>
          <CardContent className="pt-6">
            <QuizNavigation
              currentQuestion={currentQuestionIndex + 1}
              totalQuestions={questions.length}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onSubmit={handleSubmitConfirm}
              canSubmit={canSubmit}
            />
          </CardContent>
        </Card>

        {/* Unanswered warning */}
        {!canSubmit && (
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              You have {questions.length - Object.keys(answers).length}{" "}
              unanswered questions. Please answer all questions before
              submitting.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              You have {questions.length - Object.keys(answers).length}{" "}
              unanswered questions. Are you sure you want to submit? Unanswered
              questions will be marked as incorrect.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Review Answers</AlertDialogCancel>
            <AlertDialogAction onClick={() => submitQuiz()}>
              Submit Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Time Up Dialog */}
      <AlertDialog open={showTimeUpDialog} onOpenChange={setShowTimeUpDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Time&apos;s Up!</AlertDialogTitle>
            <AlertDialogDescription>
              Your quiz time has expired. Your answers will be submitted
              automatically in 5 seconds.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => submitQuiz()}>
              Submit Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
