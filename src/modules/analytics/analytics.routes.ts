import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middleware/validation.middleware.js";
import { budgetPerformance, spendingTrends } from "./analytics.controller.js";
import { reportQuerySchema } from "./analytics.schemas.js";

export const analyticsRouter = Router();
analyticsRouter.use(authenticate);
analyticsRouter.get("/spending-trends", validate(reportQuerySchema, "query"), asyncHandler(spendingTrends));
analyticsRouter.get("/budget-performance", validate(reportQuerySchema, "query"), asyncHandler(budgetPerformance));