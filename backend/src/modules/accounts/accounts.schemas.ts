import { z } from "zod";

export const accountTypeSchema = z.enum(["BANK", "CASH", "OTHER"]);

const openingBalanceSchema = z.coerce.number().finite().min(0).max(9999999999999.99);

export const createAccountSchema = z.object({
  name: z.string().trim().min(1, "Account name is required").max(100),
  accountType: accountTypeSchema,
  openingBalance: openingBalanceSchema.default(0),
});

export const updateAccountSchema = createAccountSchema.partial();

export const accountIdSchema = z.object({
  id: z.string().uuid("Account ID must be a valid UUID"),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;