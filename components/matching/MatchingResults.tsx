"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CandidateMatchCard } from "./CandidateMatchCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, Users, TrendingUp } from "lucide-react";
import type { MatchResult } from "@/lib/types/fastapi.types";

interface MatchingResultsProps {
  matches: MatchResult[];
  totalCandidates?: number;
  onViewProfile?: (candidateId: string) => void;
  onDownloadResume?: (candidateId: string) => void;
}

type SortOption = "score-desc" | "score-asc" | "name-asc" | "name-desc";

export function MatchingResults({
  matches,
  totalCandidates = 0,
  onViewProfile,
  onDownloadResume,
}: MatchingResultsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [minScore, setMinScore] = useState("0");
  const [sortBy, setSortBy] = useState<SortOption>("score-desc");

  // Filter matches
  const filteredMatches = matches.filter((match) => {
    const matchesSearch =
      match.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesScore = match.match_score >= parseInt(minScore);
    return matchesSearch && matchesScore;
  });

  // Sort matches
  const sortedMatches = [...filteredMatches].sort((a, b) => {
    switch (sortBy) {
      case "score-desc":
        return b.match_score - a.match_score;
      case "score-asc":
        return a.match_score - b.match_score;
      case "name-asc":
        return a.candidate_name.localeCompare(b.candidate_name);
      case "name-desc":
        return b.candidate_name.localeCompare(a.candidate_name);
      default:
        return 0;
    }
  });

  // Calculate statistics
  const avgScore =
    matches.length > 0
      ? matches.reduce((sum, m) => sum + m.match_score, 0) / matches.length
      : 0;

  const highMatches = matches.filter((m) => m.match_score >= 80).length;
  const mediumMatches = matches.filter(
    (m) => m.match_score >= 60 && m.match_score < 80,
  ).length;
  const lowMatches = matches.filter((m) => m.match_score < 60).length;

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{matches.length}</div>
                <div className="text-xs text-gray-600">Total Matches</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{avgScore.toFixed(0)}%</div>
                <div className="text-xs text-gray-600">Avg Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">{highMatches}</span>
              </div>
              <div>
                <div className="text-2xl font-bold">{highMatches}</div>
                <div className="text-xs text-gray-600">High Match (80+)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 font-bold">
                  {mediumMatches}
                </span>
              </div>
              <div>
                <div className="text-2xl font-bold">{mediumMatches}</div>
                <div className="text-xs text-gray-600">Medium (60-79)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div>
              <Select value={minScore} onValueChange={setMinScore}>
                <SelectTrigger>
                  <SelectValue placeholder="Minimum Score" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">All Scores</SelectItem>
                  <SelectItem value="40">40% and above</SelectItem>
                  <SelectItem value="60">60% and above</SelectItem>
                  <SelectItem value="80">80% and above</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select
                value={sortBy}
                onValueChange={(value: SortOption) => setSortBy(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score-desc">Score: High to Low</SelectItem>
                  <SelectItem value="score-asc">Score: Low to High</SelectItem>
                  <SelectItem value="name-asc">Name: A to Z</SelectItem>
                  <SelectItem value="name-desc">Name: Z to A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Badge variant="secondary">
              Showing {sortedMatches.length} of {matches.length} candidates
            </Badge>
            {searchTerm && (
              <Badge variant="outline">Search: "{searchTerm}"</Badge>
            )}
            {parseInt(minScore) > 0 && (
              <Badge variant="outline">Min Score: {minScore}%</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results List */}
      {sortedMatches.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No matches found
            </h3>
            <p className="text-sm text-gray-500">
              Try adjusting your filters or search criteria
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {sortedMatches.map((match) => (
            <CandidateMatchCard
              key={match.candidate_id}
              match={match}
              onViewProfile={onViewProfile}
              onDownloadResume={onDownloadResume}
            />
          ))}
        </div>
      )}
    </div>
  );
}
