"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useQuiz } from "@/hooks/useQuiz";
import { Loader2, Sparkles } from "lucide-react";
import type {
  QuizGenerationRequest,
  QuizQuestion,
} from "@/lib/types/fastapi.types";

interface QuizGeneratorProps {
  jobDescription?: string;
  onQuizGenerated: (questions: QuizQuestion[]) => void;
}

export function QuizGenerator({
  jobDescription = "",
  onQuizGenerated,
}: QuizGeneratorProps) {
  const [jobDesc, setJobDesc] = useState(jobDescription);
  const [numQuestions, setNumQuestions] = useState("5");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium",
  );

  const { loading, error, generateQuiz } = useQuiz();

  const handleGenerate = async () => {
    if (!jobDesc.trim()) {
      return;
    }

    const request: QuizGenerationRequest = {
      job_description: jobDesc,
      num_questions: parseInt(numQuestions),
      difficulty,
      question_types: ["technical", "behavioral"],
    };

    const result = await generateQuiz(request);
    if (result) {
      onQuizGenerated(result.questions);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Generate Assessment Quiz
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="job-description">Job Description</Label>
          <Textarea
            id="job-description"
            placeholder="Enter the job description or requirements..."
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
            rows={6}
            className="resize-none"
          />
          <p className="text-xs text-gray-500">
            The AI will generate relevant questions based on this description
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="num-questions">Number of Questions</Label>
            <Input
              id="num-questions"
              type="number"
              min="1"
              max="20"
              value={numQuestions}
              onChange={(e) => setNumQuestions(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty Level</Label>
            <Select
              value={difficulty}
              onValueChange={(value: "easy" | "medium" | "hard") =>
                setDifficulty(value)
              }
            >
              <SelectTrigger id="difficulty">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <Button
          onClick={handleGenerate}
          disabled={loading || !jobDesc.trim()}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Quiz...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Quiz
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
