import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middleware/validation.middleware.js";
import { categoryReport, cashFlowReport, monthlyReport, netWorthReport, yearlyReport } from "./reports.controller.js";
import { reportQuerySchema } from "./reports.schemas.js";

export const reportsRouter = Router();
reportsRouter.use(authenticate);
reportsRouter.get("/monthly", validate(reportQuerySchema, "query"), asyncHandler(monthlyReport));
reportsRouter.get("/yearly", validate(reportQuerySchema, "query"), asyncHandler(yearlyReport));
reportsRouter.get("/net-worth", validate(reportQuerySchema, "query"), asyncHandler(netWorthReport));
reportsRouter.get("/category", validate(reportQuerySchema, "query"), asyncHandler(categoryReport));
reportsRouter.get("/cash-flow", validate(reportQuerySchema, "query"), asyncHandler(cashFlowReport));