import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middleware/validation.middleware.js";
import { createIncome, deleteIncome, getIncome, listIncome, updateIncome } from "./income.controller.js";
import { createIncomeSchema, incomeIdSchema, incomeQuerySchema, updateIncomeSchema } from "./income.schemas.js";

export const incomeRouter = Router();
incomeRouter.use(authenticate);
incomeRouter.get("/", validate(incomeQuerySchema, "query"), asyncHandler(listIncome));
incomeRouter.get("/:id", validate(incomeIdSchema, "params"), asyncHandler(getIncome));
incomeRouter.post("/", validate(createIncomeSchema), asyncHandler(createIncome));
incomeRouter.patch("/:id", validate(incomeIdSchema, "params"), validate(updateIncomeSchema), asyncHandler(updateIncome));
incomeRouter.delete("/:id", validate(incomeIdSchema, "params"), asyncHandler(deleteIncome));