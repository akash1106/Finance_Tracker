import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middleware/validation.middleware.js";
import { getBudget, getBudgetItem, getBudgetItems, getBudgetSummary, generateBudget, listBudgets } from "./budgets.controller.js";
import { budgetIdSchema, budgetItemIdSchema, budgetQuerySchema, generateBudgetSchema } from "./budgets.schemas.js";

export const budgetsRouter = Router();
budgetsRouter.use(authenticate);
budgetsRouter.get("/", validate(budgetQuerySchema, "query"), asyncHandler(listBudgets));
budgetsRouter.post("/generate", validate(generateBudgetSchema), asyncHandler(generateBudget));
budgetsRouter.get("/:id", validate(budgetIdSchema, "params"), asyncHandler(getBudget));
budgetsRouter.get("/:id/summary", validate(budgetIdSchema, "params"), asyncHandler(getBudgetSummary));
budgetsRouter.get("/:id/items", validate(budgetIdSchema, "params"), asyncHandler(getBudgetItems));
budgetsRouter.get("/:id/items/:itemId", validate(budgetItemIdSchema, "params"), asyncHandler(getBudgetItem));