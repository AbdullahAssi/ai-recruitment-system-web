import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { createDownloadHandler } from "@/lib/resumeDownload";

export interface CandidateResume {
  id: string;
  fileName: string;
  filePath: string;
  uploadDate: string;
  extractedText?: string;
  name?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  skills_json?: string;
  experience_json?: string;
  projects_json?: string;
  certifications_json?: string;
  education_level?: string;
  experience_years?: number;
  summary?: string;
}

export interface CandidateApplication {
  id: string;
  score: number;
  status: string;
  appliedAt: string;
  job: {
    id: string;
    title: string;
    location: string;
    company?: string;
  };
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  experience: number;
  createdAt: string;
  resumes: CandidateResume[];
  applications: CandidateApplication[];
}

export interface CandidateProfile extends Candidate {
  // Extended candidate profile for individual view
}

export interface CandidateFilters {
  searchTerm: string;
  experienceFilter: string;
}

export function useCandidates(companyId?: string) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (companyId) {
        params.append("companyId", companyId);
      }
      const url = `/api/candidates${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setCandidates(data.candidates);
        toast({
          title: "Candidates Loaded",
          description: `Found ${data.candidates.length} candidates`,
        });
      } else {
        toast({
          title: "Failed to Load Candidates",
          description: data.error || "Could not fetch candidate data",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching candidates:", error);
      toast({
        title: "Failed to Load Candidates",
        description: "An error occurred while loading candidate data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [companyId]);

  return {
    candidates,
    loading,
    fetchCandidates,
  };
}

export function useCandidateProfile(candidateId: string) {
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCandidateProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/candidates/${candidateId}`);
      const data = await response.json();

      if (data.success) {
        setCandidate(data.candidate);
      } else {
        toast({
          title: "Failed to Load Profile",
          description: data.error || "Could not fetch candidate profile",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching candidate profile:", error);
      toast({
        title: "Failed to Load Profile",
        description: "An error occurred while loading the profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Use centralized download handler
  const downloadResume = createDownloadHandler(toast);

  useEffect(() => {
    if (candidateId) {
      fetchCandidateProfile();
    }
  }, [candidateId]);

  return {
    candidate,
    loading,
    fetchCandidateProfile,
    downloadResume,
  };
}

export function useCandidateFilters(candidates: Candidate[]) {
  const [filters, setFilters] = useState<CandidateFilters>({
    searchTerm: "",
    experienceFilter: "",
  });
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);

  const updateFilter = (key: keyof CandidateFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: "",
      experienceFilter: "",
    });
  };

  useEffect(() => {
    let filtered = [...candidates];

    // Search by name or email
    if (filters.searchTerm) {
      filtered = filtered.filter(
        (candidate) =>
          candidate.name
            .toLowerCase()
            .includes(filters.searchTerm.toLowerCase()) ||
          candidate.email
            .toLowerCase()
            .includes(filters.searchTerm.toLowerCase()),
      );
    }

    // Filter by experience
    if (filters.experienceFilter) {
      const [min, max] = filters.experienceFilter.split("-").map(Number);
      filtered = filtered.filter((candidate) => {
        if (max) {
          return candidate.experience >= min && candidate.experience <= max;
        } else {
          return candidate.experience >= min;
        }
      });
    }

    setFilteredCandidates(filtered);
  }, [candidates, filters.searchTerm, filters.experienceFilter]);

  return {
    filters,
    filteredCandidates,
    updateFilter,
    clearFilters,
  };
}
