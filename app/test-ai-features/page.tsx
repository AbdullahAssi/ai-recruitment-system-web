"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuizGenerator, QuizAttempt } from "@/components/quiz";
import { MatchingResults } from "@/components/matching";
import { useQuiz } from "@/hooks/useQuiz";
import { useMatching } from "@/hooks/useMatching";
import { useParsing } from "@/hooks/useParsing";
import { Sparkles, Upload, Users, FileText } from "lucide-react";
import type { QuizQuestion, MatchResult } from "@/lib/types/fastapi.types";

export default function AIFeaturesTestPage() {
  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [showQuizAttempt, setShowQuizAttempt] = useState(false);

  // Matching state
  const [matches, setMatches] = useState<MatchResult[]>([]);

  // Parsing state
  const [parseResult, setParseResult] = useState<any>(null);

  // Connection status
  const [fastapiStatus, setFastapiStatus] = useState<
    "checking" | "connected" | "disconnected"
  >("checking");

  const { loading: quizLoading } = useQuiz();
  const { matchCandidates, loading: matchingLoading } = useMatching();
  const { extractPDF, loading: parsingLoading } = useParsing();

  // Check FastAPI connection on mount
  useEffect(() => {
    checkFastAPIConnection();
  }, []);

  const checkFastAPIConnection = async () => {
    try {
      const response = await fetch("/api/fastapi/status");
      const data = await response.json();
      setFastapiStatus(
        data.status === "connected" ? "connected" : "disconnected",
      );
    } catch {
      setFastapiStatus("disconnected");
    }
  };

  const handleQuizGenerated = (questions: QuizQuestion[]) => {
    setQuizQuestions(questions);
    setShowQuizAttempt(false);
  };

  const handleStartQuiz = () => {
    setShowQuizAttempt(true);
  };

  const handleQuizComplete = (result: any) => {
    console.log("Quiz completed:", result);
    alert(`Quiz completed! Score: ${result.score_percentage}%`);
    setShowQuizAttempt(false);
  };

  const handleTestMatching = async () => {
    try {
      // Fetch candidates from database
      const candidatesResponse = await fetch("/api/candidates");
      const candidatesData = await candidatesResponse.json();

      if (!candidatesData.success || !candidatesData.candidates) {
        alert("Failed to fetch candidates from database");
        return;
      }

      if (candidatesData.candidates.length === 0) {
        alert(
          "No candidates found in database. Please run the seeder: npx ts-node prisma/seed.ts",
        );
        return;
      }

      // Transform candidates to match FastAPI schema
      const formattedCandidates = candidatesData.candidates.map((c: any) => ({
        id: c.id,
        name: c.name,
        skills: c.candidateSkills?.map((cs: any) => cs.skill.name) || [],
        experience_years: c.experience || 0,
        education_level: c.resumes?.[0]?.education_level || "Bachelor",
        summary: c.bio || c.resumes?.[0]?.summary || "Experienced professional",
      }));

      console.log("Formatted candidates:", formattedCandidates.length);

      // Test with sample job data
      const result = await matchCandidates(
        "We are looking for a Senior Full Stack Developer with 5+ years experience in React, Node.js, and PostgreSQL. Must have experience with TypeScript, REST APIs, and modern frontend frameworks.",
        formattedCandidates,
        { top_k: 10, min_score: 0.3 },
      );

      console.log("Matching result:", result);

      if (result && result.matches) {
        // Transform matches if needed - convert score to match_score
        const transformedMatches = result.matches.map((match: any) => ({
          ...match,
          match_score: match.match_score || match.score || 0,
        }));

        console.log("Transformed matches:", transformedMatches);
        setMatches(transformedMatches);
        alert(`Successfully matched ${transformedMatches.length} candidates!`);
      } else {
        console.error("No matches in result:", result);
        alert(
          "Matching completed but no results returned. Check console for details.",
        );
      }
    } catch (error: any) {
      console.error("Matching error:", error);
      console.error("Full error details:", {
        message: error.message,
        stack: error.stack,
      });

      let errorMessage = "Failed to match candidates.\n\n";

      // Check for specific error messages
      if (
        error.message?.includes("fvec_renorm") ||
        error.message?.includes("FAISS")
      ) {
        errorMessage += "⚠️ FastAPI Backend - Vector/Embedding Error\n\n";
        errorMessage +=
          "The FastAPI backend has an issue with FAISS/embeddings:\n\n";
        errorMessage += "1. Check if OpenAI API key is set in FastAPI .env\n";
        errorMessage +=
          "2. Or use local embeddings (install sentence-transformers)\n";
        errorMessage += "3. Check FastAPI logs for detailed error\n\n";
        errorMessage +=
          "FastAPI Error: " + (error.message || "Vector processing failed");
      } else if (error.message?.includes("Cannot connect to AI backend")) {
        errorMessage += "❌ FastAPI Backend Not Running\n\n";
        errorMessage += "Please start the FastAPI backend:\n";
        errorMessage += "1. Navigate to FastAPI directory\n";
        errorMessage += "2. Run: uvicorn main:app --reload\n";
        errorMessage += "3. Ensure it starts on http://localhost:8000";
      } else if (error.message?.includes("timeout")) {
        errorMessage += "⏱️ Request Timeout\n\n";
        errorMessage +=
          "FastAPI took too long to respond. This might happen if:\n";
        errorMessage += "- Processing large number of candidates\n";
        errorMessage += "- OpenAI API is slow\n";
        errorMessage += "- First request (model loading)";
      } else {
        errorMessage += "Error: " + (error.message || "Unknown error") + "\n\n";
        errorMessage += "Check browser console and FastAPI logs for details.";
      }

      alert(errorMessage);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await extractPDF(file);
    if (result) {
      setParseResult(result.extracted_data);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-purple-600" />
          AI Features Test Page
        </h1>
        <p className="text-gray-600 mt-2">
          Test all AI-powered features: Quiz Generation, Resume Parsing, and
          Candidate Matching
        </p>
      </div>

      {/* FastAPI Connection Status */}
      <Card
        className={
          fastapiStatus === "connected"
            ? "bg-green-50 border-green-200"
            : fastapiStatus === "disconnected"
              ? "bg-red-50 border-red-200"
              : "bg-yellow-50 border-yellow-200"
        }
      >
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  fastapiStatus === "connected"
                    ? "bg-green-500 animate-pulse"
                    : fastapiStatus === "disconnected"
                      ? "bg-red-500"
                      : "bg-yellow-500 animate-pulse"
                }`}
              />
              <span className="font-medium">
                FastAPI Backend:{" "}
                {fastapiStatus === "connected"
                  ? "✓ Connected"
                  : fastapiStatus === "disconnected"
                    ? "✗ Disconnected"
                    : "⟳ Checking..."}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={checkFastAPIConnection}
              disabled={fastapiStatus === "checking"}
            >
              Recheck
            </Button>
          </div>
          {fastapiStatus === "disconnected" && (
            <p className="text-sm text-red-700 mt-2">
              AI features require FastAPI backend. Please start it with:{" "}
              <code className="bg-red-100 px-2 py-1 rounded">
                uvicorn main:app --reload
              </code>
            </p>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="quiz" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="quiz">
            <FileText className="w-4 h-4 mr-2" />
            Quiz Generation
          </TabsTrigger>
          <TabsTrigger value="parsing">
            <Upload className="w-4 h-4 mr-2" />
            Resume Parsing
          </TabsTrigger>
          <TabsTrigger value="matching">
            <Users className="w-4 h-4 mr-2" />
            Candidate Matching
          </TabsTrigger>
        </TabsList>

        {/* Quiz Generation Tab */}
        <TabsContent value="quiz" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>🎯 Quiz Generation Demo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Generate AI-powered assessment quizzes based on job
                descriptions. The quiz will test both technical and behavioral
                skills.
              </p>

              {!showQuizAttempt ? (
                <>
                  <QuizGenerator onQuizGenerated={handleQuizGenerated} />

                  {quizQuestions.length > 0 && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">
                          Generated {quizQuestions.length} Questions
                        </h3>
                        <Button onClick={handleStartQuiz}>Start Quiz</Button>
                      </div>
                      <p className="text-sm text-gray-600">
                        Preview first question:
                      </p>
                      <Card className="bg-gray-50">
                        <CardContent className="pt-6">
                          <p className="font-medium">
                            {quizQuestions[0]?.question}
                          </p>
                          <div className="mt-3 space-y-2">
                            {Object.entries(
                              quizQuestions[0]?.options || {},
                            ).map(([key, value]) => (
                              <div key={key} className="text-sm text-gray-700">
                                <span className="font-semibold">{key}.</span>{" "}
                                {value}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </>
              ) : (
                <QuizAttempt
                  questions={quizQuestions}
                  onComplete={handleQuizComplete}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resume Parsing Tab */}
        <TabsContent value="parsing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>📄 Resume Parsing Demo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Upload a resume (PDF) to extract structured information using
                AI.
              </p>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="resume-upload"
                    className="block text-sm font-medium mb-2"
                  >
                    Upload Resume (PDF)
                  </label>
                  <input
                    id="resume-upload"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    disabled={parsingLoading}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  />
                </div>

                {parsingLoading && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-2">
                      Parsing resume...
                    </p>
                  </div>
                )}

                {parseResult && (
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-lg font-semibold">
                      Extracted Information:
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-sm font-medium text-gray-600 mb-2">
                            Name
                          </p>
                          <p className="font-semibold">
                            {parseResult.name || "N/A"}
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-sm font-medium text-gray-600 mb-2">
                            Email
                          </p>
                          <p className="font-semibold">
                            {parseResult.email || "N/A"}
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-sm font-medium text-gray-600 mb-2">
                            Phone
                          </p>
                          <p className="font-semibold">
                            {parseResult.phone || "N/A"}
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-sm font-medium text-gray-600 mb-2">
                            Experience
                          </p>
                          <p className="font-semibold">
                            {parseResult.experience_years || 0} years
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {parseResult.skills && parseResult.skills.length > 0 && (
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-sm font-medium text-gray-600 mb-2">
                            Skills
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {parseResult.skills.map(
                              (skill: string, index: number) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                                >
                                  {skill}
                                </span>
                              ),
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {parseResult.summary && (
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-sm font-medium text-gray-600 mb-2">
                            Summary
                          </p>
                          <p className="text-sm text-gray-700">
                            {parseResult.summary}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Candidate Matching Tab */}
        <TabsContent value="matching" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>🎯 Candidate Matching Demo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Match candidates to jobs using AI-powered semantic analysis.
                Shows match scores, matched/missing skills, and AI explanations.
              </p>

              <Button
                onClick={handleTestMatching}
                disabled={matchingLoading || fastapiStatus !== "connected"}
                className="w-full"
              >
                {matchingLoading
                  ? "Matching Candidates..."
                  : "Run Test Matching"}
              </Button>

              {fastapiStatus !== "connected" && (
                <p className="text-sm text-red-600">
                  ⚠️ FastAPI backend must be connected to run matching
                </p>
              )}

              <p className="text-xs text-gray-500">
                This will match all candidates in the database against a sample
                Senior Full Stack Developer job.
              </p>

              {matches.length > 0 && (
                <div className="pt-4 border-t">
                  <MatchingResults
                    matches={matches}
                    totalCandidates={matches.length}
                    onViewProfile={(id) => alert(`View profile: ${id}`)}
                    onDownloadResume={(id) => alert(`Download resume: ${id}`)}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">📚 How to Use</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p>
            <strong>Quiz Generation:</strong> Enter a job description to
            generate assessment questions. You can then take the quiz to test
            the scoring system.
          </p>
          <p>
            <strong>Resume Parsing:</strong> Upload a PDF resume to see how the
            AI extracts structured information like skills, experience, and
            contact details.
          </p>
          <p>
            <strong>Candidate Matching:</strong> Test the AI matching algorithm
            to see how candidates are ranked against a sample job description.
          </p>
          <p className="pt-2 border-t border-blue-300">
            <strong>Note:</strong> Make sure your FastAPI backend is running on{" "}
            <code>http://localhost:8000</code> for these features to work.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
