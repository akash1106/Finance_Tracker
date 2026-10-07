import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authRateLimiter } from "../../middleware/rate-limit.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middleware/validation.middleware.js";
import {
  changePassword,
  getMe,
  login,
  logout,
  register,
  updateProfile,
} from "./auth.controller.js";
import { loginSchema, registerSchema } from "./auth.schemas.js";

export const authRouter = Router();

authRouter.post("/register", authRateLimiter, validate(registerSchema), asyncHandler(register));
authRouter.post("/login", authRateLimiter, validate(loginSchema), asyncHandler(login));
authRouter.post("/logout", logout);
authRouter.get("/me", authenticate, asyncHandler(getMe));
authRouter.patch("/profile", authenticate, asyncHandler(updateProfile));
authRouter.patch("/password", authenticate, asyncHandler(changePassword));