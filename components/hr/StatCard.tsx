import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBgColor = "bg-blue-500",
  iconColor = "text-white",
  trend,
  className = "",
}: StatCardProps) {
  return (
    <Card
      className={`shadow-xl border-0 bg-white/70 backdrop-blur-sm ${className}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className={`p-2 ${iconBgColor} rounded-lg`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        {trend && (
          <div
            className={`text-xs ${
              trend.isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend.isPositive ? "+" : ""}
            {trend.value}% {trend.label}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div
          className={`text-3xl font-bold ${
            iconBgColor.includes("blue")
              ? "text-blue-900"
              : iconBgColor.includes("green")
              ? "text-green-900"
              : iconBgColor.includes("purple")
              ? "text-purple-900"
              : iconBgColor.includes("orange")
              ? "text-orange-900"
              : "text-gray-900"
          }`}
        >
          {value}
        </div>
        <p
          className={`text-sm ${
            iconBgColor.includes("blue")
              ? "text-blue-600"
              : iconBgColor.includes("green")
              ? "text-green-600"
              : iconBgColor.includes("purple")
              ? "text-purple-600"
              : iconBgColor.includes("orange")
              ? "text-orange-600"
              : "text-gray-600"
          } flex items-center mt-1`}
        >
          {subtitle && (
            <>
              <Icon className="w-4 h-4 mr-1" />
              {subtitle}
            </>
          )}
        </p>
      </CardContent>
    </Card>
  );
}
