// Score-related types
export interface ScoringData {
  id: string;
  score: number;
  scoredAt: string;
  explanation: ScoreExplanation;
  skillsMatch: any;
  requirements: any;
  candidate: Candidate | null;
  job: Job | null;
  application: Application | null;
}

export interface ScoreExplanation {
  skills?: number;
  experience?: number;
  education?: number;
  fit?: number;
  summary?: string;
  recommendation?:
    | "HIGHLY_RECOMMENDED"
    | "RECOMMENDED"
    | "CONSIDER"
    | "NOT_RECOMMENDED";
  strengths?: string[];
  weaknesses?: string[];
  keySkillsMatch?: string[];
  missingSkills?: string[];
}

export interface Candidate {
  id?: string;
  name: string;
  filename: string;
  email: string;
  phone?: string;
  skills: string[];
  experience: Experience[];
  education?: Education[];
  location?: string;
  portfolio?: string;
  linkedin?: string;
  github?: string;
}

export interface Experience {
  company: string;
  position: string;
  duration: string;
  description: string;
  skills?: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  year: string;
  grade?: string;
}

export interface Job {
  id?: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  company: string;
  salary?: string;
  type?: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "REMOTE";
  postedDate?: string;
  experienceLevel?: "ENTRY" | "MID" | "SENIOR" | "LEAD";
}

export interface Application {
  id: string;
  appliedAt: string;
  status?: "PENDING" | "REVIEWED" | "SHORTLISTED" | "REJECTED";
  candidateId?: string;
  jobId?: string;
}

// Filters specific to scores
export interface ScoreFilters {
  applicationId: string;
  jobId: string;
  resumeId: string;
  candidateName: string;
  jobTitle: string;
  minScore: string;
  maxScore: string;
  recommendation: string;
  dateFrom: string;
  dateTo: string;
  [key: string]: string; // Index signature to make it compatible with FilterParams
}
