import { Clock, Eye, Star, XCircle, LucideIcon } from "lucide-react";

interface StatsCardsProps {
  stats: {
    pending: number;
    reviewed: number;
    shortlisted: number;
    rejected: number;
    averageScore?: number;
    highPerformers?: number;
  };
}

interface StatCardItemProps {
  value: number;
  label: string;
  sublabel?: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}

function StatCardItem({
  value,
  label,
  sublabel,
  icon: Icon,
  iconBg,
  iconColor,
}: StatCardItemProps) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {label}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          {sublabel && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {sublabel}
            </p>
          )}
        </div>
        <div
          className={`flex items-center justify-center w-14 h-14 rounded-full ${iconBg} group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCardItem
        value={stats.pending}
        label="Pending Review"
        sublabel="Needs attention"
        icon={Clock}
        iconBg="bg-amber-100 dark:bg-amber-900/30"
        iconColor="text-amber-600 dark:text-amber-400"
      />
      <StatCardItem
        value={stats.reviewed}
        label="Reviewed"
        sublabel="Processed"
        icon={Eye}
        iconBg="bg-blue-100 dark:bg-blue-900/30"
        iconColor="text-blue-600 dark:text-blue-400"
      />
      <StatCardItem
        value={stats.shortlisted}
        label="Shortlisted"
        sublabel="Top candidates"
        icon={Star}
        iconBg="bg-emerald-100 dark:bg-emerald-900/30"
        iconColor="text-emerald-600 dark:text-emerald-400"
      />
      <StatCardItem
        value={stats.rejected}
        label="Rejected"
        sublabel="Not suitable"
        icon={XCircle}
        iconBg="bg-red-100 dark:bg-red-900/30"
        iconColor="text-red-600 dark:text-red-400"
      />
    </div>
  );
}
