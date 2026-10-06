import { z } from "zod";

export const transactionSchema = z.object({
  transactionType: z.enum(["EXPENSE", "INCOME", "TRANSFER"]),
  amount: z.number().positive("Amount must be greater than 0"),
  accountId: z.string().min(1, "Please select an account"),
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional(),
  paymentMethod: z.string().optional(),
  transactionDate: z.string().min(1, "Transaction date is required"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(255, "Description cannot exceed 255 characters"),
  notes: z.string().max(1000, "Notes cannot exceed 1000 characters").optional(),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;
