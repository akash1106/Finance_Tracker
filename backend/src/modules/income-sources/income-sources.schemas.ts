import { z } from "zod";

export const incomeSourceIdSchema = z.object({
  id: z.string().uuid("Income source ID must be a valid UUID"),
});

export const createIncomeSourceSchema = z.object({
  name: z.string().trim().min(1, "Income source name is required").max(100),
  isSalary: z.boolean().default(false),
});

export const updateIncomeSourceSchema = createIncomeSourceSchema.partial();

export type CreateIncomeSourceInput = z.infer<typeof createIncomeSourceSchema>;
export type UpdateIncomeSourceInput = z.infer<typeof updateIncomeSourceSchema>;