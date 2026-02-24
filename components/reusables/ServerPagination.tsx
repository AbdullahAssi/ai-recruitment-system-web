/**
 * ServerPagination Component
 * @example
 * ```tsx
 * <ServerPagination
 *   pagination={{ page, limit, total, totalPages }}
 *   onPageChange={setPage}
 *   onLimitChange={(limit) => { setLimit(limit); setPage(1); }}
 *   loading={loading}
 * />
 * ```
 */

"use client";

import React from "react";
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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Pagination metadata returned by the server */
interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ServerPaginationProps {
  /** Pagination metadata from the server */
  pagination: PaginationMeta;

  /** Called with the new page number when the user navigates */
  onPageChange: (page: number) => void;

  /** Called with the new limit when the user changes rows-per-page */
  onLimitChange: (limit: number) => void;

  loading?: boolean;
  className?: string;

  /** Show the rows-per-page selector (default true) */
  showItemsPerPage?: boolean;

  /** @deprecated no-op — kept for API compatibility */
  showPageInput?: boolean;

  /** @deprecated no-op — kept for API compatibility */
  showFirstLast?: boolean;

  /** Options shown in the rows-per-page selector */
  itemsPerPageOptions?: number[];
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

/**
 * Build the list of page-button values (numbers + "…" ellipsis sentinels).
 * Always surfaces the first and last page; collapses long gaps with "…".
 */
function buildPageRange(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const delta = 2; // pages shown either side of current
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);

  const range: (number | "…")[] = [1];

  if (left > 2) range.push("…");
  for (let i = left; i <= right; i++) range.push(i);
  if (right < total - 1) range.push("…");

  range.push(total);
  return range;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ServerPagination({
  pagination,
  onPageChange,
  onLimitChange,
  loading = false,
  className = "",
  showItemsPerPage = true,
  itemsPerPageOptions = [5, 10, 25, 50, 100],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showPageInput: _spi,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showFirstLast: _sfl,
}: ServerPaginationProps) {
  const { page, limit, total, totalPages } = pagination;

  const startItem = total > 0 ? (page - 1) * limit + 1 : 0;
  const endItem = Math.min(page * limit, total);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  // Shared button class fragments
  const btnBase =
    "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none h-9 min-w-[2.25rem] px-2";
  const btnInactive =
    "border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800";
  const btnActive =
    "border border-blue-600 bg-blue-600 text-white shadow-sm";

  const pageRange = buildPageRange(page, totalPages);

  return (
    <div
      className={`border-t border-gray-100 dark:border-gray-800 pt-4 ${className}`}
      role="navigation"
      aria-label="Pagination"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* ── Left: result summary ── */}
        <p className="text-sm text-gray-500 dark:text-gray-400 shrink-0">
          {total > 0 ? (
            <>
              Showing{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                {startItem}
              </span>{" "}
              –{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                {endItem}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                {total}
              </span>{" "}
              results
            </>
          ) : (
            "No results found"
          )}

          {/* inline loading indicator */}
          {loading && (
            <span className="ml-2 inline-flex items-center gap-1 text-blue-600 dark:text-blue-400">
              <span
                className="inline-block h-3 w-3 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"
                aria-hidden="true"
              />
              Loading…
            </span>
          )}
        </p>

        {/* ── Right: rows-per-page + page buttons ── */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Rows-per-page selector */}
          {showItemsPerPage && (
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                Rows per page
              </span>
              <Select
                value={limit.toString()}
                onValueChange={(val) => {
                  onLimitChange(parseInt(val));
                  onPageChange(1);
                }}
                disabled={loading}
              >
                <SelectTrigger
                  className="h-9 w-20 text-sm border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                  aria-label="Rows per page"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {itemsPerPageOptions.map((opt) => (
                    <SelectItem key={opt} value={opt.toString()}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Page navigation buttons */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              {/* First */}
              <button
                className={`${btnBase} ${btnInactive} disabled:opacity-40`}
                onClick={() => onPageChange(1)}
                disabled={!hasPrev || loading}
                aria-label="First page"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>

              {/* Prev */}
              <button
                className={`${btnBase} ${btnInactive} disabled:opacity-40`}
                onClick={() => onPageChange(page - 1)}
                disabled={!hasPrev || loading}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Prev</span>
              </button>

              {/* Numbered pages + ellipsis */}
              {pageRange.map((p, idx) =>
                p === "…" ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-1 text-gray-400 dark:text-gray-600 select-none"
                    aria-hidden="true"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    className={`${btnBase} ${p === page ? btnActive : btnInactive} disabled:opacity-40`}
                    onClick={() => p !== page && onPageChange(p as number)}
                    disabled={loading}
                    aria-label={`Page ${p}`}
                    aria-current={p === page ? "page" : undefined}
                  >
                    {p}
                  </button>
                )
              )}

              {/* Next */}
              <button
                className={`${btnBase} ${btnInactive} disabled:opacity-40`}
                onClick={() => onPageChange(page + 1)}
                disabled={!hasNext || loading}
                aria-label="Next page"
              >
                <span className="hidden sm:inline mr-1">Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>

              {/* Last */}
              <button
                className={`${btnBase} ${btnInactive} disabled:opacity-40`}
                onClick={() => onPageChange(totalPages)}
                disabled={!hasNext || loading}
                aria-label="Last page"
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
