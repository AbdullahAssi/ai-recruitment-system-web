import { Card, CardContent } from "@/components/ui/card";

interface StatsCardsProps {
  stats: {
    pending: number;
    reviewed: number;
    shortlisted: number;
    rejected: number;
    averageScore: number;
    highPerformers: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid md:grid-cols-4 gap-4 mb-6">
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {stats.pending}
          </div>
          <div className="text-sm text-yellow-700">Pending</div>
        </CardContent>
      </Card>
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {stats.reviewed}
          </div>
          <div className="text-sm text-blue-700">Reviewed</div>
        </CardContent>
      </Card>
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {stats.shortlisted}
          </div>
          <div className="text-sm text-green-700">Shortlisted</div>
        </CardContent>
      </Card>
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {stats.rejected}
          </div>
          <div className="text-sm text-red-700">Rejected</div>
        </CardContent>
      </Card>
    </div>
  );
}
