import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middleware/validation.middleware.js";
import { createTransaction, deleteTransaction, getTransaction, listTransactions, updateTransaction } from "./transactions.controller.js";
import { createTransactionSchema, transactionIdSchema, transactionQuerySchema, updateTransactionSchema } from "./transactions.schemas.js";

export const transactionsRouter = Router();
transactionsRouter.use(authenticate);
transactionsRouter.get("/", validate(transactionQuerySchema, "query"), asyncHandler(listTransactions));
transactionsRouter.get("/:id", validate(transactionIdSchema, "params"), asyncHandler(getTransaction));
transactionsRouter.post("/", validate(createTransactionSchema), asyncHandler(createTransaction));
transactionsRouter.patch("/:id", validate(transactionIdSchema, "params"), validate(updateTransactionSchema), asyncHandler(updateTransaction));
transactionsRouter.delete("/:id", validate(transactionIdSchema, "params"), asyncHandler(deleteTransaction));