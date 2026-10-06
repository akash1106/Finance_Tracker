import { z } from "zod";

export const dashboardQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  year: z.coerce.number().int().min(2000).max(9999).optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
});

export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;