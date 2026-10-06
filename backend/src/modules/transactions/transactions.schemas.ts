import { z } from "zod";

const uuid = z.string().uuid("Must be a valid UUID");
export const transactionIdSchema = z.object({ id: uuid });
export const transactionTypeSchema = z.enum(["EXPENSE", "TRANSFER", "SAVING", "INVESTMENT", "LOAN_PAYMENT"]);
export const paymentMethodSchema = z.enum(["CASH", "UPI", "DEBIT_CARD", "BANK_TRANSFER", "OTHER"]);

export const createTransactionSchema = z.object({
  transactionType: transactionTypeSchema,
  amount: z.coerce.number().finite().positive().max(9999999999999.99),
  categoryId: uuid.optional(),
  subcategoryId: uuid.optional(),
  accountId: uuid,
  transactionDate: z.coerce.date(),
  paymentMethod: paymentMethodSchema.optional(),
  description: z.string().trim().max(1000).optional(),
  notes: z.string().trim().max(2000).optional(),
});
export const updateTransactionSchema = createTransactionSchema.partial();
export const transactionQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  type: transactionTypeSchema.optional(),
  category: uuid.optional(),
  subcategory: uuid.optional(),
  account: uuid.optional(),
  paymentMethod: paymentMethodSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionQuery = z.infer<typeof transactionQuerySchema>;