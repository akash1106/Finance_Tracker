import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { AppError } from "../utils/AppError.js";

type ErrorBody = {
  success: false;
  error: {
    code: string;
    message: string;
    details: unknown[];
  };
};

function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details: unknown[] = [],
): void {
  const body: ErrorBody = {
    success: false,
    error: { code, message, details },
  };
  res.status(statusCode).json(body);
}

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(404, "NOT_FOUND", "The requested resource was not found"));
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.code, err.message, err.details);
    return;
  }

  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
    sendError(res, 400, "VALIDATION_ERROR", "Request validation failed", details);
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    sendError(res, 400, "DATABASE_ERROR", err.message);
    return;
  }

  if (
    err instanceof Prisma.PrismaClientInitializationError ||
    err instanceof Prisma.PrismaClientRustPanicError
  ) {
    sendError(res, 503, "SERVICE_UNAVAILABLE", "Database is unavailable");
    return;
  }

  logger.error({ err }, "Unhandled error");

  const message =
    env.NODE_ENV === "production" ? "An unexpected error occurred" : (err as Error).message;

  sendError(res, 500, "INTERNAL_SERVER_ERROR", message);
}
