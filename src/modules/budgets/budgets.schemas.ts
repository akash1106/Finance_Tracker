import { z } from "zod";

const uuid = z.string().uuid("Must be a valid UUID");
export const budgetIdSchema = z.object({ id: uuid });
export const budgetItemIdSchema = z.object({ id: uuid, itemId: uuid });
export const generateBudgetSchema = z.object({ incomeTransactionId: uuid, budgetTemplateId: uuid });
export const budgetQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(9999).optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
});