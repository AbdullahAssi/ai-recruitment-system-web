import { Application, FilterState } from "../types/application.types";

export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "reviewed":
      return "bg-blue-100 text-blue-800";
    case "shortlisted":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getScoreColor = (score: number) => {
  if (score >= 80) return "text-green-600 bg-green-50";
  if (score >= 60) return "text-yellow-600 bg-yellow-50";
  if (score >= 40) return "text-orange-600 bg-orange-50";
  return "text-red-600 bg-red-50";
};

export const getScoreBadgeColor = (score: number) => {
  if (score >= 80) return "bg-green-100 text-green-800 border-green-300";
  if (score >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-300";
  if (score >= 40) return "bg-orange-100 text-orange-800 border-orange-300";
  return "bg-red-100 text-red-800 border-red-300";
};

export const getApplicationBorderColor = (
  application: Application,
  isSelected: boolean
) => {
  if (isSelected) {
    return "ring-2 ring-purple-500 bg-gradient-to-r from-purple-50 to-blue-50 border-l-purple-500";
  }

  if (application.aiAnalysis) {
    const score = application.aiAnalysis.overallScore;
    if (score >= 80)
      return "border-l-green-500 bg-gradient-to-r from-green-50 to-emerald-50";
    if (score >= 60)
      return "border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-orange-50";
    if (score >= 40)
      return "border-l-orange-500 bg-gradient-to-r from-orange-50 to-red-50";
    return "border-l-red-500 bg-gradient-to-r from-red-50 to-pink-50";
  }

  return "border-l-gray-300 bg-white";
};

export const filterAndSortApplications = (
  applications: Application[],
  filters: FilterState
) => {
  return applications
    .filter((app) => {
      const matchesSearch =
        app.candidate.name
          .toLowerCase()
          .includes(filters.searchTerm.toLowerCase()) ||
        app.candidate.email
          .toLowerCase()
          .includes(filters.searchTerm.toLowerCase());

      const matchesStatus =
        filters.statusFilter === "all" ||
        app.status.toLowerCase() === filters.statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case "newest":
          return (
            new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime()
          );
        case "score-high":
          return b.score - a.score;
        case "score-low":
          return a.score - b.score;
        case "name":
          return a.candidate.name.localeCompare(b.candidate.name);
        default:
          return 0;
      }
    });
};

export const downloadResume = async (resumeId: string, fileName: string) => {
  try {
    const response = await fetch(`/api/resumes/${resumeId}/download`);
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      return { success: true };
    } else {
      throw new Error("Download failed");
    }
  } catch (error) {
    console.error("Error downloading resume:", error);
    return { success: false, error };
  }
};
