import { z } from "zod";

const uuid = z.string().uuid("Must be a valid UUID");
export const loanIdSchema = z.object({ id: uuid });
export const loanPaymentIdSchema = z.object({ id: uuid, paymentId: uuid });
export const loanStatusSchema = z.enum(["ACTIVE", "COMPLETED", "CANCELLED"]);
export const createLoanSchema = z.object({
  name: z.string().trim().min(1, "Loan name is required").max(150),
  principalAmount: z.coerce.number().finite().positive().max(9999999999999.99),
  interestRate: z.coerce.number().finite().nonnegative().max(100),
  emiAmount: z.coerce.number().finite().positive().max(9999999999999.99),
  tenureMonths: z.coerce.number().int().positive().max(1200),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  description: z.string().trim().max(1000).optional(),
});
export const updateLoanSchema = createLoanSchema.partial().extend({ status: loanStatusSchema.optional() });
export const createLoanPaymentSchema = z.object({
  accountId: uuid,
  amount: z.coerce.number().finite().positive().max(9999999999999.99),
  paymentDate: z.coerce.date(),
  notes: z.string().trim().max(2000).optional(),
});

export type CreateLoanInput = z.infer<typeof createLoanSchema>;
export type UpdateLoanInput = z.infer<typeof updateLoanSchema>;
export type CreateLoanPaymentInput = z.infer<typeof createLoanPaymentSchema>;