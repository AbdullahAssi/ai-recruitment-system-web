"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface QuizTimerProps {
  duration: number; // Duration in minutes
  onTimeUp?: () => void;
  isActive: boolean;
}

export function QuizTimer({ duration, onTimeUp, isActive }: QuizTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(duration * 60); // Convert to seconds

  useEffect(() => {
    if (!isActive || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeRemaining, onTimeUp]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  const isWarning = timeRemaining < 300; // Less than 5 minutes
  const isCritical = timeRemaining < 60; // Less than 1 minute

  return (
    <div className="flex items-center gap-2">
      <Clock className="w-5 h-5" />
      <Badge
        variant={
          isCritical ? "destructive" : isWarning ? "default" : "secondary"
        }
        className="text-base font-mono"
      >
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </Badge>
    </div>
  );
}
