import * as React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-7 w-7 text-[10px]",
  md: "h-9 w-9 text-xs",
  lg: "h-12 w-12 text-sm",
};

export function Avatar({
  src,
  alt = "",
  name,
  size = "md",
  className,
  ...props
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  const getInitials = (text?: string) => {
    if (!text) return "U";
    const parts = text.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return text.slice(0, 2).toUpperCase();
  };

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-semibold border border-border select-none",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {src && !imageError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          onError={() => setImageError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{getInitials(name || alt)}</span>
      )}
    </div>
  );
}
