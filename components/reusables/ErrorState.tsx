import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
  variant?: "card" | "inline" | "banner";
}

export function ErrorState({
  title = "Something went wrong",
  message = "An error occurred while loading the data.",
  onRetry,
  className = "",
  variant = "card",
}: ErrorStateProps) {
  const ErrorContent = () => (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4 max-w-md">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try again
        </Button>
      )}
    </div>
  );

  if (variant === "inline") {
    return (
      <div
        className={`flex items-center gap-2 p-3 text-red-600 bg-red-50 border border-red-200 rounded-md ${className}`}
      >
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm">{message}</span>
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="ghost"
            size="sm"
            className="ml-auto"
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
        )}
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <div
        className={`p-4 bg-red-50 border border-red-200 rounded-md ${className}`}
      >
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-red-800">{title}</h4>
            <p className="text-sm text-red-700 mt-1">{message}</p>
          </div>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <ErrorContent />
      </CardContent>
    </Card>
  );
}
