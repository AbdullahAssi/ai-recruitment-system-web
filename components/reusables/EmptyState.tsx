import React from "react";
import { FileX, Plus, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ElementType;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  variant?: "card" | "inline";
}

export function EmptyState({
  title = "No data found",
  message = "There are no items to display.",
  icon: Icon = FileX,
  actionLabel,
  onAction,
  className = "",
  variant = "card",
}: EmptyStateProps) {
  const EmptyContent = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="w-16 h-16 text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-6 max-w-md">{message}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          {actionLabel}
        </Button>
      )}
    </div>
  );

  if (variant === "inline") {
    return (
      <div className={`py-8 text-center ${className}`}>
        <Icon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 text-sm">{message}</p>
        {actionLabel && onAction && (
          <Button
            onClick={onAction}
            variant="outline"
            size="sm"
            className="mt-3"
          >
            {actionLabel}
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <EmptyContent />
      </CardContent>
    </Card>
  );
}
