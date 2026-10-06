"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  className?: string;
  id?: string;
}

export function Switch({
  checked,
  onCheckedChange,
  disabled = false,
  label,
  description,
  className,
  id,
}: SwitchProps) {
  const switchId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="flex items-center justify-between gap-4">
      {(label || description) && (
        <div className="space-y-0.5 text-left">
          {label && (
            <label
              htmlFor={switchId}
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
      <button
        type="button"
        role="switch"
        id={switchId}
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onCheckedChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "bg-primary" : "bg-muted",
          className
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
            checked ? "translate-x-4" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}
