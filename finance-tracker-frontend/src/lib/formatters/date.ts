import { format, parseISO, isValid } from "date-fns";

/**
 * Format ISO date string or Date object into human-readable date.
 */
export function formatDate(
  date: string | Date | null | undefined,
  formatString: string = "dd MMM yyyy"
): string {
  if (!date) return "-";
  try {
    const parsed = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(parsed)) return "-";
    return format(parsed, formatString);
  } catch {
    return "-";
  }
}

/**
 * Formats date into standard form input format YYYY-MM-DD.
 */
export function toInputDate(date: string | Date | null | undefined = new Date()): string {
  if (!date) return new Date().toISOString().split("T")[0];
  try {
    const parsed = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(parsed)) return new Date().toISOString().split("T")[0];
    return format(parsed, "yyyy-MM-dd");
  } catch {
    return new Date().toISOString().split("T")[0];
  }
}
