/**
 * FastAPI Backend Client
 * Centralized utility for calling FastAPI backend services
 */

const FASTAPI_BASE_URL =
  process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000/api/v1";

export interface FastAPIError {
  detail: string;
  status: number;
}

/**
 * Generic fetch wrapper for FastAPI endpoints
 */
async function fastAPIFetch<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  try {
    const url = `${FASTAPI_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw {
        detail: error.detail || "An error occurred",
        status: response.status,
      } as FastAPIError;
    }

    return response.json();
  } catch (error) {
    if ((error as FastAPIError).detail) {
      throw error;
    }
    throw {
      detail: "Failed to connect to AI services",
      status: 500,
    } as FastAPIError;
  }
}

/**
 * Upload file to FastAPI
 */
async function fastAPIUpload<T>(
  endpoint: string,
  file: File,
  additionalData?: Record<string, any>,
): Promise<T> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const url = `${FASTAPI_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw {
        detail: error.detail || "Upload failed",
        status: response.status,
      } as FastAPIError;
    }

    return response.json();
  } catch (error) {
    if ((error as FastAPIError).detail) {
      throw error;
    }
    throw {
      detail: "Failed to upload file",
      status: 500,
    } as FastAPIError;
  }
}

// ===== PARSING SERVICE =====

export interface ParsedDocument {
  text: string;
  character_count: number;
  method_used: string;
  ocr_used?: boolean;
}

export const parsingService = {
  /**
   * Extract text from PDF
   */
  extractPDF: async (
    file: File,
    useOcrFallback = true,
  ): Promise<ParsedDocument> => {
    return fastAPIUpload<ParsedDocument>("/parsing/extract-pdf", file, {
      use_ocr_fallback: useOcrFallback,
    });
  },

  /**
   * Extract text (auto-detect format)
   */
  extractText: async (file: File): Promise<ParsedDocument> => {
    return fastAPIUpload<ParsedDocument>("/parsing/extract-text", file);
  },

  /**
   * Get available parsing methods
   */
  getMethods: async (): Promise<string[]> => {
    return fastAPIFetch<string[]>("/parsing/methods");
  },
};

// ===== QUIZ GENERATION SERVICE =====

export interface QuizQuestion {
  id: number;
  question: string;
  options: Record<string, string>;
  correct_answer: string;
  explanation?: string;
  difficulty?: string;
  category?: string;
}

export interface QuizGenerationRequest {
  job_description: string;
  resume_data?: {
    name?: string;
    skills?: string[];
    experience_years?: number;
    education_level?: string;
    summary?: string;
  };
  num_questions?: number;
  difficulty?: "easy" | "medium" | "hard";
  question_types?: string[];
}

export interface QuizGenerationResponse {
  questions: QuizQuestion[];
  total_questions: number;
  difficulty: string;
  generated_at: string;
}

export interface QuizSubmissionRequest {
  questions: QuizQuestion[];
  answers: Record<string, string>;
}

export interface QuizSubmissionResponse {
  total_questions: number;
  correct_answers: number;
  score_percentage: number;
  results: Array<{
    question_id: number;
    is_correct: boolean;
    user_answer: string;
    correct_answer: string;
    explanation?: string;
  }>;
  passed: boolean;
  feedback: string;
}

export const quizService = {
  /**
   * Generate quiz questions
   */
  generate: async (
    request: QuizGenerationRequest,
  ): Promise<QuizGenerationResponse> => {
    return fastAPIFetch<QuizGenerationResponse>("/quiz/generate", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  /**
   * Validate single answer
   */
  validateAnswer: async (
    question: QuizQuestion,
    userAnswer: string,
  ): Promise<{ is_correct: boolean; explanation: string }> => {
    return fastAPIFetch("/quiz/validate-answer", {
      method: "POST",
      body: JSON.stringify({ question, user_answer: userAnswer }),
    });
  },

  /**
   * Submit complete quiz
   */
  submit: async (
    request: QuizSubmissionRequest,
  ): Promise<QuizSubmissionResponse> => {
    return fastAPIFetch<QuizSubmissionResponse>("/quiz/submit", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  /**
   * Generate personalized feedback
   */
  generateFeedback: async (
    resumeData: any,
    jobDescription: string,
  ): Promise<{ feedback: string; suggestions: string[] }> => {
    return fastAPIFetch("/quiz/feedback", {
      method: "POST",
      body: JSON.stringify(resumeData),
      headers: {
        "Content-Type": "application/json",
      },
    });
  },
};

// ===== MATCHING SERVICE =====

export interface CandidateProfile {
  id: string;
  name: string;
  skills: string[];
  experience_years: number;
  education_level?: string;
  summary?: string;
}

export interface MatchResult {
  candidate_id: string;
  candidate_name: string;
  score: number;
  matched_skills: string[];
  missing_skills: string[];
  explanation: string;
  rank: number;
}

export interface MatchingRequest {
  job_description: string;
  candidates: CandidateProfile[];
  top_k?: number;
  min_score?: number;
}

export interface MatchingResponse {
  job_description: string;
  total_candidates: number;
  matches_found: number;
  matches: MatchResult[];
  processing_time: number;
}

export interface SemanticSearchRequest {
  query: string;
  documents: Array<{ id: string; text: string }>;
  top_k?: number;
  score_threshold?: number;
}

export interface SemanticSearchResponse {
  query: string;
  results: Array<{
    id: string;
    score: number;
    text: string;
    rank: number;
  }>;
  processing_time: number;
}

export const matchingService = {
  /**
   * Match candidates to job
   */
  matchCandidates: async (
    request: MatchingRequest,
  ): Promise<MatchingResponse> => {
    return fastAPIFetch<MatchingResponse>("/match/jobs", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  /**
   * Create candidate index
   */
  createIndex: async (
    candidates: CandidateProfile[],
  ): Promise<{ indexed_count: number; message: string }> => {
    return fastAPIFetch("/match/index", {
      method: "POST",
      body: JSON.stringify({ candidates }),
    });
  },

  /**
   * Semantic search
   */
  search: async (
    request: SemanticSearchRequest,
  ): Promise<SemanticSearchResponse> => {
    return fastAPIFetch<SemanticSearchResponse>("/match/search", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  /**
   * Health check
   */
  healthCheck: async (): Promise<{ status: string; message: string }> => {
    return fastAPIFetch("/match/health");
  },
};

// ===== SCORING SERVICE =====

export interface ScoringRequest {
  resume_data: {
    name: string;
    email?: string;
    phone?: string;
    skills: string[];
    experience_years: number;
    education_level?: string;
    work_experience?: any[];
    summary?: string;
  };
  job_description: string;
  job_id?: string;
}

export interface ScoringResponse {
  score: number;
  explanation: string;
  matched_skills: string[];
  missing_skills: string[];
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
}

export const scoringService = {
  /**
   * Score resume by ID
   */
  scoreById: async (
    resumeId: string,
    jobDescription: string,
    jobId?: string,
    applicationId?: string,
  ): Promise<ScoringResponse> => {
    const response = await fastAPIFetch<any>("/scoring/score-by-id", {
      method: "POST",
      body: JSON.stringify({
        resume_id: resumeId,
        job_description: jobDescription,
        job_id: jobId,
        application_id: applicationId,
      }),
    });

    // Map FastAPI response (nested) to Client Interface (flat)
    const result = response.result || {};
    const breakdown = result.breakdown || {};
    const analysis = result.detailed_analysis || {};

    return {
      score: result.overall_score || 0,
      explanation: result.summary || "No summary available",
      matched_skills: analysis.key_matches || [],
      missing_skills: analysis.missing_requirements || [],
      strengths: analysis.strengths || [],
      weaknesses: analysis.weaknesses || [],
      recommendation: result.recommendation || "CONSIDER",
    };
  },

  /**
   * Score resume with data
   */
  scoreWithData: async (request: ScoringRequest): Promise<ScoringResponse> => {
    return fastAPIFetch<ScoringResponse>("/scoring/score-with-data", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },
};

// ===== HEALTH CHECK =====

export const healthService = {
  /**
   * Check API health
   */
  check: async (): Promise<{
    status: string;
    services: Record<string, boolean>;
  }> => {
    return fastAPIFetch("/health");
  },
};
