import { z } from "zod";

const uuid = z.string().uuid("Must be a valid UUID");

export const incomeIdSchema = z.object({ id: uuid });

export const createIncomeSchema = z.object({
  incomeSourceId: uuid,
  accountId: uuid,
  amount: z.coerce.number().finite().positive().max(9999999999999.99),
  receivedDate: z.coerce.date(),
  description: z.string().trim().max(1000).optional(),
  isRecurring: z.boolean().default(false),
  notes: z.string().trim().max(2000).optional(),
});

export const updateIncomeSchema = createIncomeSchema.partial();

export const incomeQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  incomeSource: uuid.optional(),
  account: uuid.optional(),
  isSalary: z.enum(["true", "false"]).transform((value) => value === "true").optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateIncomeInput = z.infer<typeof createIncomeSchema>;
export type UpdateIncomeInput = z.infer<typeof updateIncomeSchema>;
export type IncomeQuery = z.infer<typeof incomeQuerySchema>;