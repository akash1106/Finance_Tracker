import { z } from "zod";

export const transactionExportSchema = z.object({
  format: z.enum(["CSV", "XLSX"]).default("CSV"),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});
export const monthlyExportSchema = z.object({ year: z.coerce.number().int().min(2000).max(9999), month: z.coerce.number().int().min(1).max(12) });
export const yearlyExportSchema = z.object({ year: z.coerce.number().int().min(2000).max(9999) });

export type TransactionExportQuery = z.infer<typeof transactionExportSchema>;
export type MonthlyExportQuery = z.infer<typeof monthlyExportSchema>;
export type YearlyExportQuery = z.infer<typeof yearlyExportSchema>;