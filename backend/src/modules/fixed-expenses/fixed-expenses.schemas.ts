import { z } from "zod";

const uuid = z.string().uuid("Must be a valid UUID");
export const fixedExpenseIdSchema = z.object({ id: uuid });
export const frequencySchema = z.enum(["WEEKLY", "MONTHLY", "YEARLY"]);
export const createFixedExpenseSchema = z.object({
  name: z.string().trim().min(1, "Expense name is required").max(150),
  amount: z.coerce.number().finite().positive().max(9999999999999.99),
  categoryId: uuid,
  subcategoryId: uuid,
  accountId: uuid,
  frequency: frequencySchema,
  nextDueDate: z.coerce.date(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  autoGenerate: z.boolean().default(true),
  description: z.string().trim().max(1000).optional(),
});
export const updateFixedExpenseSchema = createFixedExpenseSchema.partial();

export type CreateFixedExpenseInput = z.infer<typeof createFixedExpenseSchema>;
export type UpdateFixedExpenseInput = z.infer<typeof updateFixedExpenseSchema>;