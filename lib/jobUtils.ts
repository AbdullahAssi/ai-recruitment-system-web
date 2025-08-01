export const getScoreColor = (score: number): string => {
  if (score >= 80) return "text-green-600 bg-green-100";
  if (score >= 60) return "text-yellow-600 bg-yellow-100";
  return "text-red-600 bg-red-100";
};

export const getStatusBadgeColor = (isActive: boolean): string => {
  return isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800";
};

export const formatJobPostedDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  });
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
