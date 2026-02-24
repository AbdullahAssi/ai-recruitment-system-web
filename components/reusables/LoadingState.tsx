import React from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface LoadingStateProps {
  message?: string;
  className?: string;
  variant?: "card" | "inline" | "overlay";
}

export function LoadingState({
  message = "Loading...",
  className = "",
  variant = "card",
}: LoadingStateProps) {
  const LoadingContent = () => (
    <div className="flex flex-col items-center justify-center py-8">
      <Loader2 className="w-8 h-8 animate-spin text-brand mb-3" />
      <p className="text-gray-600 text-sm">{message}</p>
    </div>
  );

  if (variant === "inline") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin text-brand" />
        <span className="text-gray-600 text-sm">{message}</span>
      </div>
    );
  }

  if (variant === "overlay") {
    return (
      <div
        className={`absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 ${className}`}
      >
        <LoadingContent />
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <LoadingContent />
      </CardContent>
    </Card>
  );
}
