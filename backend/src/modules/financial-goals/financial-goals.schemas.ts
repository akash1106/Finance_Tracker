import { z } from "zod";

const uuid = z.string().uuid("Must be a valid UUID");
export const financialGoalIdSchema = z.object({ id: uuid });
export const financialGoalContributionIdSchema = z.object({ id: uuid, contributionId: uuid });
export const financialGoalStatusSchema = z.enum(["ACTIVE", "COMPLETED", "CANCELLED"]);
export const createFinancialGoalSchema = z.object({
  name: z.string().trim().min(1, "Goal name is required").max(150),
  targetAmount: z.coerce.number().finite().positive().max(9999999999999.99),
  targetDate: z.coerce.date().optional(),
  description: z.string().trim().max(1000).optional(),
});
export const updateFinancialGoalSchema = createFinancialGoalSchema.partial().extend({ status: financialGoalStatusSchema.optional() });
export const createFinancialGoalContributionSchema = z.object({
  amount: z.coerce.number().finite().positive().max(9999999999999.99),
  contributionDate: z.coerce.date(),
  notes: z.string().trim().max(2000).optional(),
});

export type CreateFinancialGoalInput = z.infer<typeof createFinancialGoalSchema>;
export type UpdateFinancialGoalInput = z.infer<typeof updateFinancialGoalSchema>;
export type CreateFinancialGoalContributionInput = z.infer<typeof createFinancialGoalContributionSchema>;