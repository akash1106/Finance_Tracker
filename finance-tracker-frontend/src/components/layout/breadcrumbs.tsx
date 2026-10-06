"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-1 text-xs text-muted-foreground">
      <Link
        href="/dashboard"
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>

      {segments.map((segment, index) => {
        const path = `/${segments.slice(0, index + 1).join("/")}`;
        const isLast = index === segments.length - 1;
        const formatted = segment
          .replace(/-/g, " ")
          .replace(/^\w/, (c) => c.toUpperCase());

        return (
          <div key={path} className="flex items-center space-x-1">
            <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
            {isLast ? (
              <span className="font-medium text-foreground capitalize">{formatted}</span>
            ) : (
              <Link
                href={path}
                className="hover:text-foreground transition-colors capitalize"
              >
                {formatted}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
