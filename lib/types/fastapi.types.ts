/**
 * TypeScript types for FastAPI service responses
 */

// ===== QUIZ TYPES =====

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

export interface QuizSubmissionResult {
  question_id: number;
  is_correct: boolean;
  user_answer: string;
  correct_answer: string;
  explanation?: string;
}

export interface QuizSubmissionResponse {
  total_questions: number;
  correct_answers: number;
  score_percentage: number;
  results: QuizSubmissionResult[];
  passed: boolean;
  feedback: string;
}

// ===== MATCHING TYPES =====

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
  match_score: number; // Percentage 0-100
  score?: number; // Alternative field name
  email?: string;
  phone?: string;
  location?: string;
  matched_skills: string[];
  missing_skills: string[];
  explanation: string;
  similarity_score?: number; // 0-1 decimal
  rank?: number;
}

export interface MatchingResponse {
  job_description: string;
  total_candidates: number;
  matches_found: number;
  matches: MatchResult[];
  processing_time: number;
}

export interface SemanticSearchResult {
  id: string;
  score: number;
  text: string;
  rank: number;
}

export interface SemanticSearchResponse {
  query: string;
  results: SemanticSearchResult[];
  processing_time: number;
}

// ===== PARSING TYPES =====

export interface ParsedDocument {
  text: string;
  character_count: number;
  method_used: string;
  ocr_used?: boolean;
}

// ===== SCORING TYPES =====

export interface ResumeData {
  name: string;
  email?: string;
  phone?: string;
  skills: string[];
  experience_years: number;
  education_level?: string;
  work_experience?: WorkExperience[];
  summary?: string;
}

export interface WorkExperience {
  title: string;
  company: string;
  duration: string;
  description: string;
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
