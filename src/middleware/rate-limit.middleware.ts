import rateLimit from "express-rate-limit";
import type { Request, Response } from "express";
import { env } from "../config/env.js";

export interface CreateRateLimiterOptions {
  windowMs?: number;
  limit?: number;
  message?: string;
  skip?: (req: Request, res: Response) => boolean;
  skipInTest?: boolean;
}

export function createRateLimiter(options?: CreateRateLimiterOptions) {
  const windowMs = options?.windowMs ?? env.RATE_LIMIT_WINDOW_MS;
  const limit =
    options?.limit ??
    (env.RATE_LIMIT_MAX ?? (env.NODE_ENV === "production" ? 100 : 1000));
  const message =
    options?.message ?? "Too many requests, please try again later.";
  const skipInTest = options?.skipInTest ?? true;

  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skip: (req: Request, res: Response) => {
      if ((skipInTest && env.NODE_ENV === "test") || env.RATE_LIMIT_DISABLED) {
        return true;
      }
      return options?.skip ? options.skip(req, res) : false;
    },
    handler: (_req: Request, res: Response) => {
      res.status(429).json({
        success: false,
        error: {
          code: "TOO_MANY_REQUESTS",
          message,
          details: [],
        },
      });
    },
  });
}

/**
 * General rate limiter for API endpoints:
 * 15-minute window, skips health check endpoints,
 * default 100 requests in production, 1000 in development.
 */
export const apiRateLimiter = createRateLimiter({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX ?? (env.NODE_ENV === "production" ? 100 : 1000),
  message: "Too many requests, please try again later.",
  skip: (req) => req.path === "/health" || req.path.startsWith("/health/"),
});

/**
 * Stricter rate limiter for authentication endpoints (/login, /register):
 * 15-minute window, default 10 requests in production, 100 in development.
 */
export const authRateLimiter = createRateLimiter({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.AUTH_RATE_LIMIT_MAX ?? (env.NODE_ENV === "production" ? 10 : 100),
  message: "Too many authentication attempts, please try again later.",
});
