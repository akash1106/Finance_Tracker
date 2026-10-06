import type { Request, Response } from "express";
import { prisma } from "../../config/database.js";
import { AppError } from "../../utils/AppError.js";
import type { CreateIncomeSourceInput, UpdateIncomeSourceInput } from "./income-sources.schemas.js";

function getUserId(request: Request): string {
  if (!request.auth) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication token is required");
  }

  return request.auth.userId;
}

function getSourceId(request: Request): string {
  const sourceId = request.params.id;

  if (typeof sourceId !== "string") {
    throw new AppError(400, "VALIDATION_ERROR", "Income source ID is required");
  }

  return sourceId;
}

export async function listIncomeSources(req: Request, res: Response): Promise<void> {
  const sources = await prisma.incomeSource.findMany({
    where: { userId: getUserId(req), isActive: true },
    orderBy: { name: "asc" },
  });

  res.json({ success: true, data: sources });
}

export async function getIncomeSource(req: Request, res: Response): Promise<void> {
  const source = await prisma.incomeSource.findFirst({
    where: { id: getSourceId(req), userId: getUserId(req) },
  });

  if (!source) {
    throw new AppError(404, "INCOME_SOURCE_NOT_FOUND", "Income source was not found");
  }

  res.json({ success: true, data: source });
}

export async function createIncomeSource(req: Request, res: Response): Promise<void> {
  const input = req.body as CreateIncomeSourceInput;
  const source = await prisma.incomeSource.create({
    data: { ...input, userId: getUserId(req) },
  });

  res.status(201).json({
    success: true,
    data: source,
    message: "Income source created successfully",
  });
}

export async function updateIncomeSource(req: Request, res: Response): Promise<void> {
  const sourceId = getSourceId(req);
  const userId = getUserId(req);
  const existing = await prisma.incomeSource.findFirst({ where: { id: sourceId, userId } });

  if (!existing) {
    throw new AppError(404, "INCOME_SOURCE_NOT_FOUND", "Income source was not found");
  }

  const source = await prisma.incomeSource.update({
    where: { id: existing.id },
    data: req.body as UpdateIncomeSourceInput,
  });

  res.json({ success: true, data: source, message: "Income source updated successfully" });
}

export async function deactivateIncomeSource(req: Request, res: Response): Promise<void> {
  const sourceId = getSourceId(req);
  const userId = getUserId(req);
  const existing = await prisma.incomeSource.findFirst({ where: { id: sourceId, userId } });

  if (!existing) {
    throw new AppError(404, "INCOME_SOURCE_NOT_FOUND", "Income source was not found");
  }

  await prisma.incomeSource.update({
    where: { id: existing.id },
    data: { isActive: false },
  });

  res.status(204).send();
}