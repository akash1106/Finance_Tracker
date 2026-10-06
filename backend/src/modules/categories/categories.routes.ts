import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middleware/validation.middleware.js";
import {
  categoryIdSchema, categoryParentIdSchema, categoryQuerySchema, createCategorySchema, createSubcategorySchema,
  subcategoryIdSchema, updateCategorySchema, updateSubcategorySchema,
} from "./categories.schemas.js";
import {
  createCategory, createSubcategory, deactivateCategory, deactivateSubcategory, getCategory, getSubcategory,
  listCategories, listSubcategories, updateCategory, updateSubcategory,
} from "./categories.controller.js";

export const categoriesRouter = Router();
categoriesRouter.use(authenticate);
categoriesRouter.get("/", validate(categoryQuerySchema, "query"), asyncHandler(listCategories));
categoriesRouter.get("/:id", validate(categoryIdSchema, "params"), asyncHandler(getCategory));
categoriesRouter.post("/", validate(createCategorySchema), asyncHandler(createCategory));
categoriesRouter.patch("/:id", validate(categoryIdSchema, "params"), validate(updateCategorySchema), asyncHandler(updateCategory));
categoriesRouter.delete("/:id", validate(categoryIdSchema, "params"), asyncHandler(deactivateCategory));

export const subcategoriesRouter = Router();
subcategoriesRouter.use(authenticate);
subcategoriesRouter.get("/:id", validate(subcategoryIdSchema, "params"), asyncHandler(getSubcategory));
subcategoriesRouter.patch("/:id", validate(subcategoryIdSchema, "params"), validate(updateSubcategorySchema), asyncHandler(updateSubcategory));
subcategoriesRouter.delete("/:id", validate(subcategoryIdSchema, "params"), asyncHandler(deactivateSubcategory));
categoriesRouter.get("/:categoryId/subcategories", validate(categoryParentIdSchema, "params"), asyncHandler(listSubcategories));
categoriesRouter.post("/:categoryId/subcategories", validate(categoryParentIdSchema, "params"), validate(createSubcategorySchema), asyncHandler(createSubcategory));