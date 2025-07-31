export interface Application {
  id: string;
  score: number;
  status: string;
  appliedAt: string;
  candidate: {
    id: string;
    name: string;
    email: string;
    experience: number;
    resumes: Array<{
      id: string;
      fileName: string;
      uploadDate: string;
    }>;
  };
  aiAnalysis?: {
    overallScore: number;
    strengths: string[];
    weaknesses: string[];
    keyMatches: string[];
    recommendation:
      | "HIGHLY_RECOMMENDED"
      | "RECOMMENDED"
      | "CONSIDER"
      | "NOT_RECOMMENDED";
    skillsMatch: {
      required: number;
      preferred: number;
      matchedSkills: string[];
      missingSkills: string[];
    };
    scores: {
      skills: number;
      experience: number;
      education: number;
      fit: number;
    };
  };
}

export interface JobData {
  id: string;
  title: string;
  description: string;
  location: string;
  requirements: string;
  postedDate: string;
  isActive: boolean;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface JobApplicationsData {
  job: JobData;
  applications: Application[];
  totalApplications: number;
  pagination: PaginationData;
  stats: {
    pending: number;
    reviewed: number;
    shortlisted: number;
    rejected: number;
    averageScore: number;
    highPerformers: number;
  };
}

export interface AIScoresData {
  id: string;
  score: number;
  scoredAt: string;
  explanation: {
    summary: string;
    aiAnalysis: {
      strengths: string[];
      weaknesses: string[];
      key_matches: string[];
      missing_requirements: string[];
    };
    scores: {
      overall: number;
      skills: number;
      experience: number;
      education: number;
      fit: number;
    };
    recommendation: string;
  };
  skillsMatch: {
    requiredScore: number;
    preferredScore: number;
    totalJobSkills: number;
    matchedRequired: string[];
    missingRequired: string[];
    matchedPreferred: string[];
    overallSkillScore: number;
    totalResumeSkills: number;
  };
  candidate: {
    name: string;
    filename: string | null;
    email: string;
    phone: string;
    skills: string[];
    experience: string[];
  };
  job: {
    title: string;
    description: string;
    requirements: string;
    location: string;
    company: string | null;
  };
  application: {
    id: string;
    appliedAt: string;
  };
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export interface FilterState {
  searchTerm: string;
  statusFilter: string;
  sortBy: string;
}

export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
}

export interface BulkEmailState {
  selectedApplications: string[];
  emailTemplates: EmailTemplate[];
  selectedTemplate: string;
  customSubject: string;
  customBody: string;
  emailDialogOpen: boolean;
  sendingEmail: boolean;
}

export interface AIAnalysisDialogState {
  profileDialogOpen: boolean;
  selectedApplication: Application | null;
  aiScoresData: AIScoresData | null;
  loadingScores: boolean;
}
