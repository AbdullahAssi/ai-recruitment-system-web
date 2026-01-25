"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { QuizCard } from "./QuizCard";
import { useQuiz } from "@/hooks/useQuiz";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  ArrowRight,
  ArrowLeft,
  Send,
} from "lucide-react";
import type {
  QuizQuestion,
  QuizSubmissionResponse,
} from "@/lib/types/fastapi.types";

interface QuizAttemptProps {
  questions: QuizQuestion[];
  candidateId?: string;
  onComplete?: (result: QuizSubmissionResponse) => void;
}

export function QuizAttempt({
  questions,
  candidateId,
  onComplete,
}: QuizAttemptProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<QuizSubmissionResponse | null>(null);

  const { loading, error, submitQuiz } = useQuiz();

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  const handleAnswerSelect = (questionId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId.toString()]: answer }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    const submissionResult = await submitQuiz(questions, answers);
    if (submissionResult) {
      setResult(submissionResult);
      setSubmitted(true);
      onComplete?.(submissionResult);
    }
  };

  if (submitted && result) {
    return (
      <div className="space-y-6">
        <Card className="border-2 border-purple-200">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
            <CardTitle className="flex items-center gap-3">
              <Award className="w-8 h-8 text-purple-600" />
              <div>
                <div className="text-2xl">Quiz Completed!</div>
                <div className="text-sm font-normal text-gray-600 mt-1">
                  Your assessment results
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-4xl font-bold text-blue-600">
                  {result.score_percentage.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600 mt-1">Overall Score</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-4xl font-bold text-green-600">
                  {result.correct_answers}/{result.total_questions}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Correct Answers
                </div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-4xl font-bold text-purple-600">
                  {result.passed ? "PASS" : "FAIL"}
                </div>
                <div className="text-sm text-gray-600 mt-1">Status</div>
              </div>
            </div>

            {result.feedback && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-semibold text-blue-900 mb-1">
                  Feedback:
                </p>
                <p className="text-sm text-blue-800">{result.feedback}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Detailed Results</h3>
          {questions.map((question, index) => {
            const resultItem = result.results.find(
              (r) => r.question_id === question.id,
            );
            return (
              <QuizCard
                key={question.id}
                question={question}
                questionNumber={index + 1}
                totalQuestions={questions.length}
                selectedAnswer={answers[question.id.toString()]}
                onAnswerSelect={() => {}}
                showResult
                isCorrect={resultItem?.is_correct}
              />
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span className="text-gray-600">{answeredCount} answered</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Current Question */}
      <QuizCard
        question={questions[currentQuestion]}
        questionNumber={currentQuestion + 1}
        totalQuestions={questions.length}
        selectedAnswer={answers[questions[currentQuestion].id.toString()]}
        onAnswerSelect={handleAnswerSelect}
      />

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          variant="outline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        {currentQuestion === questions.length - 1 ? (
          <Button
            onClick={handleSubmit}
            disabled={loading || answeredCount !== questions.length}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {loading ? (
              "Submitting..."
            ) : (
              <>
                Submit Quiz
                <Send className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        ) : (
          <Button onClick={handleNext}>
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>

      {/* Summary */}
      <Card className="bg-gray-50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {questions.length}
              </div>
              <div className="text-xs text-gray-600">Total Questions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {answeredCount}
              </div>
              <div className="text-xs text-gray-600">Answered</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {questions.length - answeredCount}
              </div>
              <div className="text-xs text-gray-600">Remaining</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {progress.toFixed(0)}%
              </div>
              <div className="text-xs text-gray-600">Progress</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
