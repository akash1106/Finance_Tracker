import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "info" | "success" | "warning" | "destructive";
}

const variantClasses = {
  default: "bg-card text-foreground border-border",
  info: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30",
  success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  warning: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
  destructive: "bg-destructive/10 text-destructive border-destructive/30",
};

const defaultIcons = {
  default: Info,
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  destructive: AlertCircle,
};

export function Alert({
  className,
  variant = "default",
  children,
  ...props
}: AlertProps) {
  const Icon = defaultIcons[variant];

  return (
    <div
      role="alert"
      className={cn(
        "relative w-full rounded-xl border p-4 text-xs [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:h-4 [&>svg]:w-4",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      <Icon className="shrink-0" />
      <div>{children}</div>
    </div>
  );
}

export function AlertTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5
      className={cn("mb-1 font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  );
}

export function AlertDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div
      className={cn("text-xs [&_p]:leading-relaxed opacity-90", className)}
      {...props}
    />
  );
}
