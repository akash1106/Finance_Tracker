import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middleware/validation.middleware.js";
import { createFixedExpense, deactivateFixedExpense, generateFixedExpense, getFixedExpense, listFixedExpenses, updateFixedExpense } from "./fixed-expenses.controller.js";
import { createFixedExpenseSchema, fixedExpenseIdSchema, updateFixedExpenseSchema } from "./fixed-expenses.schemas.js";

export const fixedExpensesRouter = Router();
fixedExpensesRouter.use(authenticate);
fixedExpensesRouter.get("/", asyncHandler(listFixedExpenses));
fixedExpensesRouter.get("/:id", validate(fixedExpenseIdSchema, "params"), asyncHandler(getFixedExpense));
fixedExpensesRouter.post("/", validate(createFixedExpenseSchema), asyncHandler(createFixedExpense));
fixedExpensesRouter.patch("/:id", validate(fixedExpenseIdSchema, "params"), validate(updateFixedExpenseSchema), asyncHandler(updateFixedExpense));
fixedExpensesRouter.delete("/:id", validate(fixedExpenseIdSchema, "params"), asyncHandler(deactivateFixedExpense));
fixedExpensesRouter.post("/:id/generate", validate(fixedExpenseIdSchema, "params"), asyncHandler(generateFixedExpense));