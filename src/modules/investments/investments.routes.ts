import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middleware/validation.middleware.js";
import { createInvestment, createInvestmentContribution, deactivateInvestment, deleteInvestmentContribution, getInvestment, listInvestmentContributions, listInvestments, updateInvestment } from "./investments.controller.js";
import { createInvestmentContributionSchema, createInvestmentSchema, investmentContributionIdSchema, investmentIdSchema, updateInvestmentSchema } from "./investments.schemas.js";

export const investmentsRouter = Router();
investmentsRouter.use(authenticate);
investmentsRouter.get("/", asyncHandler(listInvestments));
investmentsRouter.get("/:id", validate(investmentIdSchema, "params"), asyncHandler(getInvestment));
investmentsRouter.post("/", validate(createInvestmentSchema), asyncHandler(createInvestment));
investmentsRouter.patch("/:id", validate(investmentIdSchema, "params"), validate(updateInvestmentSchema), asyncHandler(updateInvestment));
investmentsRouter.delete("/:id", validate(investmentIdSchema, "params"), asyncHandler(deactivateInvestment));
investmentsRouter.get("/:id/contributions", validate(investmentIdSchema, "params"), asyncHandler(listInvestmentContributions));
investmentsRouter.post("/:id/contributions", validate(investmentIdSchema, "params"), validate(createInvestmentContributionSchema), asyncHandler(createInvestmentContribution));
investmentsRouter.delete("/:id/contributions/:contributionId", validate(investmentContributionIdSchema, "params"), asyncHandler(deleteInvestmentContribution));