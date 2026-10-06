import { z } from "zod";

const uuid = z.string().uuid("Must be a valid UUID");
export const savingsGoalIdSchema = z.object({ id: uuid });
export const savingsContributionIdSchema = z.object({ id: uuid, contributionId: uuid });
export const savingsStatusSchema = z.enum(["ACTIVE", "COMPLETED", "PAUSED", "CANCELLED"]);

export const createSavingsGoalSchema = z.object({
  name: z.string().trim().min(1, "Goal name is required").max(150),
  targetAmount: z.coerce.number().finite().positive().max(9999999999999.99),
  targetDate: z.coerce.date().optional(),
  description: z.string().trim().max(1000).optional(),
});
export const updateSavingsGoalSchema = createSavingsGoalSchema.partial().extend({ status: savingsStatusSchema.optional() });
export const createSavingsContributionSchema = z.object({
  accountId: uuid,
  amount: z.coerce.number().finite().positive().max(9999999999999.99),
  contributionDate: z.coerce.date(),
  notes: z.string().trim().max(2000).optional(),
});

export type CreateSavingsGoalInput = z.infer<typeof createSavingsGoalSchema>;
export type UpdateSavingsGoalInput = z.infer<typeof updateSavingsGoalSchema>;
export type CreateSavingsContributionInput = z.infer<typeof createSavingsContributionSchema>;