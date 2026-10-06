import * as React from "react";
import { cn } from "@/lib/utils";
import { FolderOpen, type LucideIcon } from "lucide-react";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-border bg-card/40 space-y-4",
        className
      )}
      {...props}
    >
      <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground shadow-inner">
        <Icon className="h-6 w-6 stroke-[1.5]" />
      </div>
      <div className="space-y-1 max-w-sm">
        <h4 className="text-sm font-semibold text-foreground tracking-tight">
          {title}
        </h4>
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
