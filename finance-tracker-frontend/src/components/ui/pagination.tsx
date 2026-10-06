"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  totalItems?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  totalItems,
}: PaginationProps) {
  if (totalPages <= 1 && totalItems === undefined) return null;

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4 py-3 text-xs text-muted-foreground",
        className
      )}
    >
      {totalItems !== undefined && (
        <div>
          Showing page <span className="font-semibold text-foreground">{currentPage}</span> of{" "}
          <span className="font-semibold text-foreground">{totalPages || 1}</span> ({totalItems} total items)
        </div>
      )}

      <div className="flex items-center space-x-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-8 w-8 rounded-lg flex items-center justify-center border border-border bg-card text-foreground hover:bg-accent disabled:opacity-40 disabled:pointer-events-none transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {Array.from({ length: Math.min(totalPages, 5) }).map((_, idx) => {
          let pageNum: number;
          if (totalPages <= 5) {
            pageNum = idx + 1;
          } else if (currentPage <= 3) {
            pageNum = idx + 1;
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + idx;
          } else {
            pageNum = currentPage - 2 + idx;
          }

          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={cn(
                "h-8 min-w-[32px] px-2 rounded-lg flex items-center justify-center font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border border-border bg-card text-foreground hover:bg-accent"
              )}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-8 w-8 rounded-lg flex items-center justify-center border border-border bg-card text-foreground hover:bg-accent disabled:opacity-40 disabled:pointer-events-none transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
