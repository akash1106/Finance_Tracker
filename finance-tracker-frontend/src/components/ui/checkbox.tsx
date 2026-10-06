import * as React from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="flex items-start gap-2.5">
        <input
          type="checkbox"
          id={inputId}
          ref={ref}
          className={cn(
            "h-4 w-4 rounded border-input text-primary focus:ring-primary focus:ring-offset-background transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 mt-0.5",
            className
          )}
          {...props}
        />
        {(label || description) && (
          <div className="space-y-0.5 text-left">
            {label && (
              <label
                htmlFor={inputId}
                className="block text-xs font-medium text-foreground cursor-pointer select-none"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-[11px] text-muted-foreground select-none">
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
