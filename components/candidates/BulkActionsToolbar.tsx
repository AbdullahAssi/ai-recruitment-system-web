import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Send } from "lucide-react";

interface BulkActionsToolbarProps {
  totalCandidates: number;
  selectedCount: number;
  onSelectAll: (checked: boolean) => void;
  onOpenBulkEmail: () => void;
}

export function BulkActionsToolbar({
  totalCandidates,
  selectedCount,
  onSelectAll,
  onOpenBulkEmail,
}: BulkActionsToolbarProps) {
  return (
    <div
      className={`flex justify-between items-center rounded-xl border px-4 py-3 transition-colors ${
        selectedCount > 0
          ? "bg-primary/5 border-primary/30"
          : "bg-card border-border"
      }`}
    >
      <div className="flex items-center gap-3">
        <Checkbox
          id="select-all"
          checked={selectedCount === totalCandidates && totalCandidates > 0}
          onCheckedChange={onSelectAll}
        />
        <Label
          htmlFor="select-all"
          className="text-sm text-muted-foreground cursor-pointer"
        >
          Select all
        </Label>
        {selectedCount > 0 && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground">
            {selectedCount} selected
          </span>
        )}
      </div>

      {selectedCount > 0 && (
        <Button
          size="sm"
          onClick={onOpenBulkEmail}
          className="h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Send className="w-3.5 h-3.5 mr-1.5" />
          Send Bulk Email
        </Button>
      )}
    </div>
  );
}
