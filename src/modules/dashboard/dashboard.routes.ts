import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middleware/validation.middleware.js";
import { getBudgetUtilization, getCashFlow, getDashboard, getExpenseBreakdown, getIncomeBreakdown, getInvestmentHistory, getNetWorth, getSavingsHistory } from "./dashboard.controller.js";
import { dashboardQuerySchema } from "./dashboard.schemas.js";

export const dashboardRouter = Router();
dashboardRouter.use(authenticate);
dashboardRouter.get("/", validate(dashboardQuerySchema, "query"), asyncHandler(getDashboard));
dashboardRouter.get("/cash-flow", validate(dashboardQuerySchema, "query"), asyncHandler(getCashFlow));
dashboardRouter.get("/expense-breakdown", validate(dashboardQuerySchema, "query"), asyncHandler(getExpenseBreakdown));
dashboardRouter.get("/income-breakdown", validate(dashboardQuerySchema, "query"), asyncHandler(getIncomeBreakdown));
dashboardRouter.get("/budget-utilization", validate(dashboardQuerySchema, "query"), asyncHandler(getBudgetUtilization));
dashboardRouter.get("/savings", asyncHandler(getSavingsHistory));
dashboardRouter.get("/investments", asyncHandler(getInvestmentHistory));
dashboardRouter.get("/net-worth", validate(dashboardQuerySchema, "query"), asyncHandler(getNetWorth));