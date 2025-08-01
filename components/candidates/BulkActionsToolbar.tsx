import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    <Card className="mb-6 shadow-lg">
      <CardContent className="py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="select-all"
                checked={
                  selectedCount === totalCandidates && totalCandidates > 0
                }
                onCheckedChange={onSelectAll}
              />
              <Label htmlFor="select-all" className="text-sm text-gray-600">
                Select All ({selectedCount} selected)
              </Label>
            </div>
            {selectedCount > 0 && (
              <Badge variant="secondary" className="px-3 py-1">
                {selectedCount} candidates selected
              </Badge>
            )}
          </div>

          {selectedCount > 0 && (
            <Button
              onClick={onOpenBulkEmail}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Bulk Email
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
