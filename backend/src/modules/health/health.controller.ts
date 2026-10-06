import type { Request, Response } from "express";
import { prisma } from "../../config/database.js";
import { AppError } from "../../utils/AppError.js";

export function getHealth(_req: Request, res: Response): void {
  res.status(200).json({
    success: true,
    data: { status: "ok" },
  });
}

export async function getReady(_req: Request, res: Response): Promise<void> {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    throw new AppError(503, "SERVICE_UNAVAILABLE", "Database is unavailable");
  }

  res.status(200).json({
    success: true,
    data: { status: "ready" },
  });
}
