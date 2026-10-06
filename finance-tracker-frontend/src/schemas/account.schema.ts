import { z } from "zod";

export const accountSchema = z.object({
  name: z.string().trim().min(1, "Account name is required").max(100),
  accountType: z.enum(["BANK", "CASH", "OTHER"]),
  openingBalance: z.number().min(0, "Opening balance cannot be negative"),
});

export type AccountFormData = z.infer<typeof accountSchema>;
