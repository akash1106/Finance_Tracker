import { z } from "zod";

export const incomeSchema = z.object({
  incomeSourceId: z.string().min(1, "Please select an income source"),
  accountId: z.string().min(1, "Please select a deposit account"),
  amount: z.number().positive("Amount must be greater than 0"),
  receivedDate: z.string().min(1, "Received date is required"),
  description: z.string().max(255).optional(),
  isRecurring: z.boolean(),
  notes: z.string().max(1000).optional(),
});

export const newSourceSchema = z.object({
  name: z.string().min(1, "Source name is required").max(100),
  isSalary: z.boolean(),
});

export type IncomeFormData = z.infer<typeof incomeSchema>;
export type NewSourceFormData = z.infer<typeof newSourceSchema>;
