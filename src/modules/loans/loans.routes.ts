import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middleware/validation.middleware.js";
import { createLoan, createLoanPayment, deactivateLoan, deleteLoanPayment, getLoan, listLoanPayments, listLoans, updateLoan } from "./loans.controller.js";
import { createLoanPaymentSchema, createLoanSchema, loanIdSchema, loanPaymentIdSchema, updateLoanSchema } from "./loans.schemas.js";

export const loansRouter = Router();
loansRouter.use(authenticate);
loansRouter.get("/", asyncHandler(listLoans));
loansRouter.get("/:id", validate(loanIdSchema, "params"), asyncHandler(getLoan));
loansRouter.post("/", validate(createLoanSchema), asyncHandler(createLoan));
loansRouter.patch("/:id", validate(loanIdSchema, "params"), validate(updateLoanSchema), asyncHandler(updateLoan));
loansRouter.delete("/:id", validate(loanIdSchema, "params"), asyncHandler(deactivateLoan));
loansRouter.get("/:id/payments", validate(loanIdSchema, "params"), asyncHandler(listLoanPayments));
loansRouter.post("/:id/payments", validate(loanIdSchema, "params"), validate(createLoanPaymentSchema), asyncHandler(createLoanPayment));
loansRouter.delete("/:id/payments/:paymentId", validate(loanPaymentIdSchema, "params"), asyncHandler(deleteLoanPayment));