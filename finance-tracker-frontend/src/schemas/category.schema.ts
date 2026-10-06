import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required").max(100),
  categoryType: z.enum(["EXPENSE", "INCOME", "SAVING", "INVESTMENT"]),
  description: z.string().trim().max(1000).optional(),
});

export const subcategorySchema = z.object({
  name: z.string().trim().min(1, "Subcategory name is required").max(100),
  description: z.string().trim().max(1000).optional(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
export type SubcategoryFormData = z.infer<typeof subcategorySchema>;
