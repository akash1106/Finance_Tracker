import { z } from "zod";

export const reportQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  year: z.coerce.number().int().min(2000).max(9999).optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  category: z.string().uuid().optional(),
});

export type ReportQuery = z.infer<typeof reportQuerySchema>;