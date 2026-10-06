import jwt, { type JwtPayload } from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

function getAuthToken(request: Request): string {
  const authorization = request.headers.authorization;

  if (authorization?.startsWith("Bearer ")) {
    const token = authorization.slice("Bearer ".length).trim();
    if (token) {
      return token;
    }
  }

  const cookieToken = request.cookies?.token;
  if (cookieToken && typeof cookieToken === "string" && cookieToken.trim()) {
    return cookieToken.trim();
  }

  throw new AppError(401, "UNAUTHORIZED", "Authentication token is required");
}

export function authenticate(
  request: Request,
  _response: Response,
  next: NextFunction,
): void {
  try {
    const payload = jwt.verify(getAuthToken(request), env.JWT_SECRET);

    if (
      typeof payload === "string" ||
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string"
    ) {
      throw new AppError(401, "UNAUTHORIZED", "Authentication token is invalid");
    }

    request.auth = {
      userId: payload.sub,
      email: payload.email,
    };
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError(401, "UNAUTHORIZED", "Authentication token is invalid or expired"));
      return;
    }

    next(error);
  }
}

export type AuthPayload = JwtPayload & {
  userId: string;
  email: string;
};