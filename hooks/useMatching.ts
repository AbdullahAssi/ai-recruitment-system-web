import { useState } from "react";
import type {
  MatchingResponse,
  SemanticSearchResponse,
} from "@/lib/types/fastapi.types";

interface CandidateForMatching {
  id: string;
  name: string;
  skills: string[];
  experience_years: number;
  education_level?: string;
  summary?: string;
}

export function useMatching() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const matchCandidates = async (
    jobDescription: string,
    candidates: CandidateForMatching[],
    options?: { top_k?: number; min_score?: number },
  ): Promise<MatchingResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/fastapi/matching/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_description: jobDescription,
          candidates,
          top_k: options?.top_k || 10,
          min_score: options?.min_score || 0.5,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("[useMatching] Error response:", errorData);
        throw new Error(
          errorData.error || errorData.details || "Failed to match candidates",
        );
      }

      const data = await response.json();
      console.log("[useMatching] Success response:", data);
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to match candidates";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const semanticSearch = async (
    query: string,
    documents: Array<{ id: string; text: string }>,
    options?: { top_k?: number; score_threshold?: number },
  ): Promise<SemanticSearchResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/fastapi/matching/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          documents,
          top_k: options?.top_k || 5,
          score_threshold: options?.score_threshold || 0.3,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to perform semantic search");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to perform semantic search";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    matchCandidates,
    semanticSearch,
  };
}
