import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "success"
    | "warning"
    | "destructive"
    | "outline";
}

const variantClasses = {
  default: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  warning: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  destructive: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20",
  outline: "text-foreground border border-border",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide transition-colors uppercase",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
