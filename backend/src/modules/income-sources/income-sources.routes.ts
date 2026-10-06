import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middleware/validation.middleware.js";
import {
  createIncomeSource,
  deactivateIncomeSource,
  getIncomeSource,
  listIncomeSources,
  updateIncomeSource,
} from "./income-sources.controller.js";
import {
  createIncomeSourceSchema,
  incomeSourceIdSchema,
  updateIncomeSourceSchema,
} from "./income-sources.schemas.js";

export const incomeSourcesRouter = Router();

incomeSourcesRouter.use(authenticate);
incomeSourcesRouter.get("/", asyncHandler(listIncomeSources));
incomeSourcesRouter.get("/:id", validate(incomeSourceIdSchema, "params"), asyncHandler(getIncomeSource));
incomeSourcesRouter.post("/", validate(createIncomeSourceSchema), asyncHandler(createIncomeSource));
incomeSourcesRouter.patch(
  "/:id",
  validate(incomeSourceIdSchema, "params"),
  validate(updateIncomeSourceSchema),
  asyncHandler(updateIncomeSource),
);
incomeSourcesRouter.delete(
  "/:id",
  validate(incomeSourceIdSchema, "params"),
  asyncHandler(deactivateIncomeSource),
);