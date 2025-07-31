import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PaginationData } from "@/lib/types";

interface PaginationControlsProps {
  pagination: PaginationData;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  className?: string;
  showItemsPerPage?: boolean;
  showPageInput?: boolean;
}

export function PaginationControls({
  pagination,
  onPageChange,
  onLimitChange,
  className = "",
  showItemsPerPage = true,
  showPageInput = true,
}: PaginationControlsProps) {
  const { page, limit, total, totalPages } = pagination;

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPage = parseInt(e.target.value);
    if (!isNaN(newPage) && newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
    }
  };

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}
    >
      {/* Items info */}
      <div className="text-sm text-gray-600">
        Showing {total > 0 ? startItem : 0} to {endItem} of {total} results
      </div>

      <div className="flex items-center gap-4">
        {/* Items per page */}
        {showItemsPerPage && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show:</span>
            <Select
              value={limit.toString()}
              onValueChange={(value) => onLimitChange(parseInt(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Page controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          {/* Page input */}
          {showPageInput && totalPages > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Page</span>
              <Input
                type="number"
                min={1}
                max={totalPages}
                value={page}
                onChange={handlePageInputChange}
                className="w-16 text-center"
              />
              <span className="text-sm text-gray-600">of {totalPages}</span>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
