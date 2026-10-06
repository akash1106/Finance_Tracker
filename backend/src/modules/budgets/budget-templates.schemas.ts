import { z } from "zod";

const uuid = z.string().uuid("Must be a valid UUID");
const percentage = z.coerce.number().finite().positive().max(100);

export const templateIdSchema = z.object({ id: uuid });
export const itemIdSchema = z.object({ id: uuid, itemId: uuid });
export const createTemplateSchema = z.object({
  name: z.string().trim().min(1, "Template name is required").max(100),
  description: z.string().trim().max(1000).optional(),
  isActive: z.boolean().default(false),
});
export const updateTemplateSchema = createTemplateSchema.partial();
export const createTemplateItemSchema = z.object({ categoryId: uuid, percentage });
export const updateTemplateItemSchema = z.object({ percentage });

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
export type CreateTemplateItemInput = z.infer<typeof createTemplateItemSchema>;
export type UpdateTemplateItemInput = z.infer<typeof updateTemplateItemSchema>;