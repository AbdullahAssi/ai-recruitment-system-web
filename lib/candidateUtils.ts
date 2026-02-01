export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "reviewed":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "shortlisted":
      return "bg-green-100 text-green-800 border-green-200";
    case "interviewed":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "rejected":
      return "bg-red-100 text-red-800 border-red-200";
    case "quiz_pending":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "quiz_completed":
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export const getScoreColor = (score: number) => {
  if (score >= 80) return "text-green-600 bg-green-50";
  if (score >= 60) return "text-yellow-600 bg-yellow-50";
  return "text-red-600 bg-red-50";
};

export const parseJsonField = (jsonString: string | undefined) => {
  if (!jsonString) return [];
  try {
    const parsed = JSON.parse(jsonString);
    // Handle case where parsed data is null or not an array
    if (!parsed || !Array.isArray(parsed)) return [];
    // Filter out null, undefined, or empty strings
    return parsed.filter(
      (item) => item !== null && item !== undefined && item !== "",
    );
  } catch {
    return [];
  }
};

export const parseWorkExperienceField = (jsonString: string | undefined) => {
  if (!jsonString) return [];
  try {
    const parsed = JSON.parse(jsonString);
    // Handle case where parsed data is null or not an array
    if (!parsed || !Array.isArray(parsed)) return [];

    // Filter out null, undefined, or empty objects for work experience
    // But also handle string format like other fields
    return parsed.filter((item) => {
      if (!item) return false;

      // If it's a string (like projects/certifications), treat it as valid
      if (typeof item === "string" && item.trim() !== "") return true;

      // If it's an object, check if it has meaningful content
      if (typeof item === "object" && Object.keys(item).length > 0) return true;

      return false;
    });
  } catch {
    return [];
  }
};

export const getExperienceLabel = (experience: number) => {
  if (experience === 0) return "No experience";
  if (experience === 1) return "1 year";
  return `${experience} years`;
};

export const formatExperienceFilter = (filter: string) => {
  switch (filter) {
    case "0-2":
      return "0-2 years (Junior)";
    case "3-5":
      return "3-5 years (Mid-level)";
    case "6-10":
      return "6-10 years (Senior)";
    case "10":
      return "10+ years (Expert)";
    default:
      return "All Experience Levels";
  }
};
