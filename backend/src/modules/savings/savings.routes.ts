import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middleware/validation.middleware.js";
import { createContribution, createSavingsGoal, deactivateSavingsGoal, deleteContribution, getSavingsGoal, listContributions, listSavingsGoals, updateSavingsGoal } from "./savings.controller.js";
import { createSavingsContributionSchema, createSavingsGoalSchema, savingsContributionIdSchema, savingsGoalIdSchema, updateSavingsGoalSchema } from "./savings.schemas.js";

export const savingsRouter = Router();
savingsRouter.use(authenticate);
savingsRouter.get("/", asyncHandler(listSavingsGoals));
savingsRouter.get("/:id", validate(savingsGoalIdSchema, "params"), asyncHandler(getSavingsGoal));
savingsRouter.post("/", validate(createSavingsGoalSchema), asyncHandler(createSavingsGoal));
savingsRouter.patch("/:id", validate(savingsGoalIdSchema, "params"), validate(updateSavingsGoalSchema), asyncHandler(updateSavingsGoal));
savingsRouter.delete("/:id", validate(savingsGoalIdSchema, "params"), asyncHandler(deactivateSavingsGoal));
savingsRouter.get("/:id/contributions", validate(savingsGoalIdSchema, "params"), asyncHandler(listContributions));
savingsRouter.post("/:id/contributions", validate(savingsGoalIdSchema, "params"), validate(createSavingsContributionSchema), asyncHandler(createContribution));
savingsRouter.delete("/:id/contributions/:contributionId", validate(savingsContributionIdSchema, "params"), asyncHandler(deleteContribution));