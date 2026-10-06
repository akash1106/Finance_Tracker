import { z } from "zod";

const uuid = z.string().uuid("Must be a valid UUID");
export const categoryIdSchema = z.object({ id: uuid });
export const categoryTypeSchema = z.enum(["EXPENSE", "INCOME", "SAVING", "INVESTMENT"]);

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required").max(100),
  categoryType: categoryTypeSchema,
  description: z.string().trim().max(1000).optional(),
});
export const updateCategorySchema = createCategorySchema.partial();
export const categoryQuerySchema = z.object({
  type: categoryTypeSchema.optional(),
  includeInactive: z.enum(["true", "false"]).transform((value) => value === "true").default(false),
});

export const subcategoryIdSchema = z.object({ id: uuid });
export const categoryParentIdSchema = z.object({ categoryId: uuid });
export const createSubcategorySchema = z.object({
  name: z.string().trim().min(1, "Subcategory name is required").max(100),
  description: z.string().trim().max(1000).optional(),
});
export const updateSubcategorySchema = createSubcategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryQuery = z.infer<typeof categoryQuerySchema>;
export type CreateSubcategoryInput = z.infer<typeof createSubcategorySchema>;
export type UpdateSubcategoryInput = z.infer<typeof updateSubcategorySchema>;