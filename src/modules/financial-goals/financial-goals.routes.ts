import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middleware/validation.middleware.js";
import { createFinancialGoal, createFinancialGoalContribution, deactivateFinancialGoal, deleteFinancialGoalContribution, getFinancialGoal, listFinancialGoalContributions, listFinancialGoals, updateFinancialGoal } from "./financial-goals.controller.js";
import { createFinancialGoalContributionSchema, createFinancialGoalSchema, financialGoalContributionIdSchema, financialGoalIdSchema, updateFinancialGoalSchema } from "./financial-goals.schemas.js";

export const financialGoalsRouter = Router();
financialGoalsRouter.use(authenticate);
financialGoalsRouter.get("/", asyncHandler(listFinancialGoals));
financialGoalsRouter.get("/:id", validate(financialGoalIdSchema, "params"), asyncHandler(getFinancialGoal));
financialGoalsRouter.post("/", validate(createFinancialGoalSchema), asyncHandler(createFinancialGoal));
financialGoalsRouter.patch("/:id", validate(financialGoalIdSchema, "params"), validate(updateFinancialGoalSchema), asyncHandler(updateFinancialGoal));
financialGoalsRouter.delete("/:id", validate(financialGoalIdSchema, "params"), asyncHandler(deactivateFinancialGoal));
financialGoalsRouter.get("/:id/contributions", validate(financialGoalIdSchema, "params"), asyncHandler(listFinancialGoalContributions));
financialGoalsRouter.post("/:id/contributions", validate(financialGoalIdSchema, "params"), validate(createFinancialGoalContributionSchema), asyncHandler(createFinancialGoalContribution));
financialGoalsRouter.delete("/:id/contributions/:contributionId", validate(financialGoalContributionIdSchema, "params"), asyncHandler(deleteFinancialGoalContribution));