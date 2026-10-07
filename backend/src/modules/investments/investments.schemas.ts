import { z } from "zod";

const uuid = z.string().uuid("Must be a valid UUID");
export const investmentIdSchema = z.object({ id: uuid });
export const investmentContributionIdSchema = z.object({ id: uuid, contributionId: uuid });
export const investmentTypeSchema = z.enum([
  "MUTUAL_FUND",
  "MUTUAL_FUNDS",
  "STOCKS",
  "GOLD",
  "FD",
  "RD",
  "CRYPTO",
  "REAL_ESTATE",
  "OTHER",
]);
export const createInvestmentSchema = z.object({
  name: z.string().trim().min(1, "Investment name is required").max(150),
  investmentType: investmentTypeSchema,
  description: z.string().trim().max(1000).optional(),
});
export const updateInvestmentSchema = createInvestmentSchema.partial();
export const createInvestmentContributionSchema = z.object({
  accountId: uuid,
  amount: z.coerce.number().finite().positive().max(9999999999999.99),
  investmentDate: z.coerce.date(),
  notes: z.string().trim().max(2000).optional(),
});

export type CreateInvestmentInput = z.infer<typeof createInvestmentSchema>;
export type UpdateInvestmentInput = z.infer<typeof updateInvestmentSchema>;
export type CreateInvestmentContributionInput = z.infer<typeof createInvestmentContributionSchema>;