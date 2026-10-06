import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getHealth, getReady } from "./health.controller.js";

export const healthRouter = Router();

healthRouter.get("/", getHealth);
healthRouter.get("/ready", asyncHandler(getReady));
