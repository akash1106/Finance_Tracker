import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middleware/validation.middleware.js";
import { getMe, login, logout, register } from "./auth.controller.js";
import { loginSchema, registerSchema } from "./auth.schemas.js";

export const authRouter = Router();

authRouter.post("/register", validate(registerSchema), asyncHandler(register));
authRouter.post("/login", validate(loginSchema), asyncHandler(login));
authRouter.post("/logout", logout);
authRouter.get("/me", authenticate, asyncHandler(getMe));