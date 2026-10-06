import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  variant?: "default" | "success" | "warning" | "destructive";
}

const variantIndicatorClasses = {
  default: "bg-primary",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  destructive: "bg-rose-500",
};

export function Progress({
  className,
  value = 0,
  max = 100,
  variant = "default",
  ...props
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full w-full flex-1 transition-all duration-300",
          variantIndicatorClasses[variant]
        )}
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </div>
  );
}
