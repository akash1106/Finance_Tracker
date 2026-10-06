import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middleware/validation.middleware.js";
import { budgetPerformance, categoryTrends, fixedExpenseRatio, incomeGrowth, savingsRate, spendingAnomalies, spendingTrends } from "./analytics.controller.js";
import { reportQuerySchema } from "./analytics.schemas.js";

export const analyticsRouter = Router();
analyticsRouter.use(authenticate);
analyticsRouter.get("/spending-trends", validate(reportQuerySchema, "query"), asyncHandler(spendingTrends));
analyticsRouter.get("/budget-performance", validate(reportQuerySchema, "query"), asyncHandler(budgetPerformance));
analyticsRouter.get("/category-trends", validate(reportQuerySchema, "query"), asyncHandler(categoryTrends));
analyticsRouter.get("/savings-rate", validate(reportQuerySchema, "query"), asyncHandler(savingsRate));
analyticsRouter.get("/fixed-expense-ratio", validate(reportQuerySchema, "query"), asyncHandler(fixedExpenseRatio));
analyticsRouter.get("/income-growth", validate(reportQuerySchema, "query"), asyncHandler(incomeGrowth));
analyticsRouter.get("/spending-anomalies", validate(reportQuerySchema, "query"), asyncHandler(spendingAnomalies));