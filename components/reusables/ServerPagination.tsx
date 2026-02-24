/**
 * ServerPagination Component
 *
 * Reusable server-side pagination component that handles:
 * - Page navigation (Previous/Next/Direct page input)
 * - Items per page selection
 * - Results information display
 * - Loading states
 *
 * @example
 * ```tsx
 * <ServerPagination
 *   pagination={pagination}
 *   onPageChange={(page) => setPaginationState(prev => ({ ...prev, currentPage: page }))}
 *   onLimitChange={(limit) => setPaginationState(prev => ({ ...prev, itemsPerPage: limit, currentPage: 1 }))}
 *   loading={loading}
 * />
 * ```
 */

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
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { PaginationData } from "@/lib/types";

interface ServerPaginationProps {
  /** Pagination metadata from the server */
  pagination: PaginationData;

  /** Callback when page changes */
  onPageChange: (page: number) => void;

  /** Callback when items per page changes */
  onLimitChange: (limit: number) => void;

  /** Loading state to disable controls */
  loading?: boolean;

  /** Additional CSS classes */
  className?: string;

  /** Show items per page dropdown */
  showItemsPerPage?: boolean;

  /** Show direct page input */
  showPageInput?: boolean;

  /** Show first/last page buttons */
  showFirstLast?: boolean;

  /** Available options for items per page */
  itemsPerPageOptions?: number[];
}

export function ServerPagination({
  pagination,
  onPageChange,
  onLimitChange,
  loading = false,
  className = "",
  showItemsPerPage = true,
  showPageInput = true,
  showFirstLast = false,
  itemsPerPageOptions = [5, 10, 25, 50, 100],
}: ServerPaginationProps) {
  const { page, limit, total, totalPages } = pagination;

  const [pageInput, setPageInput] = React.useState(page.toString());

  // Update page input when external page changes
  React.useEffect(() => {
    setPageInput(page.toString());
  }, [page]);

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const handlePageInputBlur = () => {
    const newPage = parseInt(pageInput);
    if (!isNaN(newPage) && newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
    } else {
      // Reset to current page if invalid
      setPageInput(page.toString());
    }
  };

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handlePageInputBlur();
    }
  };

  const startItem = total > 0 ? (page - 1) * limit + 1 : 0;
  const endItem = Math.min(page * limit, total);

  const hasPrevious = page > 1;
  const hasNext = page < totalPages;

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 ${className}`}
      role="navigation"
      aria-label="Pagination"
    >
      {/* Results Information */}
      <div className="text-sm text-gray-600">
        {total > 0 ? (
          <>
            Showing <span className="font-semibold">{startItem}</span> to{" "}
            <span className="font-semibold">{endItem}</span> of{" "}
            <span className="font-semibold">{total}</span> results
          </>
        ) : (
          "No results found"
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Items Per Page Selector */}
        {showItemsPerPage && (
          <div className="flex items-center gap-2">
            <label htmlFor="items-per-page" className="text-sm text-gray-600">
              Show:
            </label>
            <Select
              value={limit.toString()}
              onValueChange={(value) => {
                onLimitChange(parseInt(value));
                // Reset to page 1 when changing limit
                onPageChange(1);
              }}
              disabled={loading}
            >
              <SelectTrigger
                id="items-per-page"
                className="w-20"
                aria-label="Items per page"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {itemsPerPageOptions.map((option) => (
                  <SelectItem key={option} value={option.toString()}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 0 && (
          <div className="flex items-center gap-2">
            {/* First Page Button */}
            {showFirstLast && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(1)}
                disabled={!hasPrevious || loading}
                aria-label="Go to first page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>
            )}

            {/* Previous Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={!hasPrevious || loading}
              aria-label="Go to previous page"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            {/* Page Input */}
            {showPageInput && totalPages > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Page</span>
                <Input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={pageInput}
                  onChange={handlePageInputChange}
                  onBlur={handlePageInputBlur}
                  onKeyDown={handlePageInputKeyDown}
                  disabled={loading}
                  className="w-16 text-center"
                  aria-label="Current page"
                />
                <span className="text-sm text-gray-600">of {totalPages}</span>
              </div>
            )}

            {/* Next Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={!hasNext || loading}
              aria-label="Go to next page"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>

            {/* Last Page Button */}
            {showFirstLast && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(totalPages)}
                disabled={!hasNext || loading}
                aria-label="Go to last page"
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand"></div>
            <span>Loading...</span>
          </div>
        )}
      </div>
    </div>
  );
}
