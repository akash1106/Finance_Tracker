import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middleware/validation.middleware.js";
import { createRecurringTransaction, deactivateRecurringTransaction, generateRecurringTransaction, getRecurringTransaction, listRecurringTransactions, updateRecurringTransaction } from "./recurring-transactions.controller.js";
import { createRecurringTransactionSchema, recurringTransactionIdSchema, updateRecurringTransactionSchema } from "./recurring-transactions.schemas.js";

export const recurringTransactionsRouter = Router();
recurringTransactionsRouter.use(authenticate);
recurringTransactionsRouter.get("/", asyncHandler(listRecurringTransactions));
recurringTransactionsRouter.get("/:id", validate(recurringTransactionIdSchema, "params"), asyncHandler(getRecurringTransaction));
recurringTransactionsRouter.post("/", validate(createRecurringTransactionSchema), asyncHandler(createRecurringTransaction));
recurringTransactionsRouter.patch("/:id", validate(recurringTransactionIdSchema, "params"), validate(updateRecurringTransactionSchema), asyncHandler(updateRecurringTransaction));
recurringTransactionsRouter.delete("/:id", validate(recurringTransactionIdSchema, "params"), asyncHandler(deactivateRecurringTransaction));
recurringTransactionsRouter.post("/:id/generate", validate(recurringTransactionIdSchema, "params"), asyncHandler(generateRecurringTransaction));