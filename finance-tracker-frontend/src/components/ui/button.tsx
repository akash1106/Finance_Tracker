import * as React from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "destructive"
    | "link";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm focus-visible:ring-primary",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm focus-visible:ring-secondary",
  outline:
    "border border-border bg-transparent hover:bg-accent hover:text-accent-foreground text-foreground shadow-sm",
  ghost:
    "hover:bg-accent hover:text-accent-foreground text-foreground",
  destructive:
    "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm focus-visible:ring-destructive",
  link:
    "text-primary underline-offset-4 hover:underline p-0 h-auto font-normal",
};

const sizeClasses = {
  sm: "h-8 px-3 text-xs rounded-md gap-1.5",
  md: "h-9 px-4 text-xs font-medium rounded-lg gap-2",
  lg: "h-11 px-6 text-sm font-medium rounded-lg gap-2.5",
  icon: "h-9 w-9 p-0 rounded-lg justify-center",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Spinner size="sm" className="shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && (
          <span className="shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
