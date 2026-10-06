import { z } from "zod";

const uuid = z.string().uuid("Must be a valid UUID");
export const recurringTransactionIdSchema = z.object({ id: uuid });
export const recurringFrequencySchema = z.enum(["WEEKLY", "MONTHLY", "YEARLY"]);
export const recurringTypeSchema = z.enum(["EXPENSE", "TRANSFER", "SAVING", "INVESTMENT", "LOAN_PAYMENT"]);
export const paymentMethodSchema = z.enum(["CASH", "UPI", "DEBIT_CARD", "BANK_TRANSFER", "OTHER"]);

export const createRecurringTransactionSchema = z.object({
  name: z.string().trim().min(1, "Recurring transaction name is required").max(150),
  transactionType: recurringTypeSchema,
  amount: z.coerce.number().finite().positive().max(9999999999999.99),
  categoryId: uuid.optional(),
  subcategoryId: uuid.optional(),
  accountId: uuid,
  paymentMethod: paymentMethodSchema.optional(),
  frequency: recurringFrequencySchema,
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  nextRunDate: z.coerce.date(),
  notes: z.string().trim().max(2000).optional(),
});
export const updateRecurringTransactionSchema = createRecurringTransactionSchema.partial();

export type CreateRecurringTransactionInput = z.infer<typeof createRecurringTransactionSchema>;
export type UpdateRecurringTransactionInput = z.infer<typeof updateRecurringTransactionSchema>;