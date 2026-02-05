"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import type { QuizQuestion } from "@/lib/types/fastapi.types";

interface QuizCardProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer?: string;
  onAnswerSelect: (questionId: number, answer: string) => void;
  showResult?: boolean;
  isCorrect?: boolean;
}

export function QuizCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
  showResult = false,
  isCorrect,
}: QuizCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">
                Question {questionNumber} of {totalQuestions}
              </Badge>
              {question.difficulty && (
                <Badge
                  variant={
                    question.difficulty === "hard"
                      ? "destructive"
                      : question.difficulty === "medium"
                        ? "default"
                        : "secondary"
                  }
                >
                  {question.difficulty}
                </Badge>
              )}
              {question.category && (
                <Badge variant="secondary">{question.category}</Badge>
              )}
            </div>
            <CardTitle className="text-lg font-semibold">
              {question.question}
            </CardTitle>
          </div>
          {showResult && (
            <div className="ml-4">
              {isCorrect ? (
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600" />
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <RadioGroup
          name={`question-${question.id}`}
          value={selectedAnswer}
          onValueChange={(value) => onAnswerSelect(question.id, value)}
          disabled={showResult}
        >
          <div className="space-y-3">
            {Object.entries(question.options).map(([key, value]) => {
              const isSelected = selectedAnswer === key;
              const isCorrectAnswer = key === question.correct_answer;
              const shouldHighlight =
                showResult && (isSelected || isCorrectAnswer);

              return (
                <div
                  key={key}
                  className={`flex items-center space-x-2 p-4 rounded-lg border ${
                    shouldHighlight
                      ? isCorrectAnswer
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <RadioGroupItem
                    value={key}
                    id={`${question.id}-${key}`}
                    className={
                      shouldHighlight
                        ? isCorrectAnswer
                          ? "border-green-600"
                          : "border-red-600"
                        : ""
                    }
                  />
                  <Label
                    htmlFor={`${question.id}-${key}`}
                    className="flex-1 cursor-pointer font-normal"
                  >
                    <span className="font-semibold mr-2">{key}.</span>
                    {value}
                  </Label>
                  {showResult && isCorrectAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  )}
                </div>
              );
            })}
          </div>
        </RadioGroup>

        {showResult && question.explanation && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-semibold text-blue-900 mb-1">
              Explanation:
            </p>
            <p className="text-sm text-blue-800">{question.explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
