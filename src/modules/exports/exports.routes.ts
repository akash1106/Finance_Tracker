import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middleware/validation.middleware.js";
import { exportMonthlyReport, exportTransactions, exportYearlyReport } from "./exports.controller.js";
import { monthlyExportSchema, transactionExportSchema, yearlyExportSchema } from "./exports.schemas.js";

export const exportsRouter = Router();
exportsRouter.use(authenticate);
exportsRouter.get("/transactions", validate(transactionExportSchema, "query"), asyncHandler(exportTransactions));
exportsRouter.get("/monthly-report", validate(monthlyExportSchema, "query"), asyncHandler(exportMonthlyReport));
exportsRouter.get("/yearly-report", validate(yearlyExportSchema, "query"), asyncHandler(exportYearlyReport));