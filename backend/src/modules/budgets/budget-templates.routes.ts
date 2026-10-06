import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middleware/validation.middleware.js";
import {
  addTemplateItem, createTemplate, deleteTemplateItem, deactivateTemplate, getTemplate, listTemplates,
  updateTemplate, updateTemplateItem, validateTemplate,
} from "./budget-templates.controller.js";
import {
  createTemplateItemSchema, createTemplateSchema, itemIdSchema, templateIdSchema,
  updateTemplateItemSchema, updateTemplateSchema,
} from "./budget-templates.schemas.js";

export const budgetTemplatesRouter = Router();
budgetTemplatesRouter.use(authenticate);
budgetTemplatesRouter.get("/", asyncHandler(listTemplates));
budgetTemplatesRouter.get("/:id", validate(templateIdSchema, "params"), asyncHandler(getTemplate));
budgetTemplatesRouter.post("/", validate(createTemplateSchema), asyncHandler(createTemplate));
budgetTemplatesRouter.patch("/:id", validate(templateIdSchema, "params"), validate(updateTemplateSchema), asyncHandler(updateTemplate));
budgetTemplatesRouter.delete("/:id", validate(templateIdSchema, "params"), asyncHandler(deactivateTemplate));
budgetTemplatesRouter.post("/:id/items", validate(templateIdSchema, "params"), validate(createTemplateItemSchema), asyncHandler(addTemplateItem));
budgetTemplatesRouter.patch("/:id/items/:itemId", validate(itemIdSchema, "params"), validate(updateTemplateItemSchema), asyncHandler(updateTemplateItem));
budgetTemplatesRouter.delete("/:id/items/:itemId", validate(itemIdSchema, "params"), asyncHandler(deleteTemplateItem));
budgetTemplatesRouter.post("/:id/validate", validate(templateIdSchema, "params"), asyncHandler(validateTemplate));