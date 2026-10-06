import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middleware/validation.middleware.js";
import { currentNetWorth, netWorthHistory } from "./net-worth.controller.js";
import { netWorthQuerySchema } from "./net-worth.schemas.js";

export const netWorthRouter = Router();
netWorthRouter.use(authenticate);
netWorthRouter.get("/", asyncHandler(currentNetWorth));
netWorthRouter.get("/history", validate(netWorthQuerySchema, "query"), asyncHandler(netWorthHistory));