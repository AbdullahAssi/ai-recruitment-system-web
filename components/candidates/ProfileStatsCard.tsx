import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FaBriefcase, FaFileAlt, FaCheckCircle, FaClock } from "react-icons/fa";

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
      icon: FaBriefcase,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Active Applications",
      value: activeApplications,
      icon: FaClock,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Resumes Uploaded",
      value: totalResumes,
      icon: FaFileAlt,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className="shadow-md hover:shadow-lg transition-shadow"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-4 rounded-full ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
