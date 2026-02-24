import React from "react";
import { FaBriefcase, FaFileAlt, FaClock } from "react-icons/fa";

interface ProfileStatsCardProps {
  totalApplications: number;
  activeApplications: number;
  totalResumes: number;
}

export function ProfileStatsCard({
  totalApplications,
  activeApplications,
  totalResumes,
}: ProfileStatsCardProps) {
  const stats = [
    {
      label: "Total Applications",
      value: totalApplications,
      subtext: "All time submitted",
      subtextColor: "text-blue-600 dark:text-blue-400",
      icon: FaBriefcase,
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      label: "Active Applications",
      value: activeApplications,
      subtext: "In progress",
      subtextColor: "text-emerald-600 dark:text-emerald-400",
      icon: FaClock,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
      label: "Resumes Uploaded",
      value: totalResumes,
      subtext: "Documents on file",
      subtextColor: "text-cyan-600 dark:text-cyan-400",
      icon: FaFileAlt,
      iconColor: "text-cyan-600 dark:text-cyan-400",
      iconBg: "bg-cyan-100 dark:bg-cyan-900/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:shadow-lg transition-all duration-300 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {stat.label}
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </p>
              <p className={`text-xs font-medium mt-2 ${stat.subtextColor}`}>
                {stat.subtext}
              </p>
            </div>
            <div
              className={`flex items-center justify-center w-14 h-14 rounded-full ${stat.iconBg} group-hover:scale-110 transition-transform duration-300`}
            >
              <stat.icon className={`text-2xl ${stat.iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
