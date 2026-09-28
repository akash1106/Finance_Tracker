import type { Request, Response } from "express";
import { prisma } from "../../config/database.js";
import { AppError } from "../../utils/AppError.js";
import type { CreateIncomeInput, IncomeQuery, UpdateIncomeInput } from "./income.schemas.js";

function userId(req: Request): string {
  if (!req.auth) throw new AppError(401, "UNAUTHORIZED", "Authentication token is required");
  return req.auth.userId;
}

function id(req: Request): string {
  if (typeof req.params.id !== "string") throw new AppError(400, "VALIDATION_ERROR", "Income ID is required");
  return req.params.id;
}

function response(income: { id: string; userId: string; incomeSourceId: string; accountId: string; amount: { toFixed: (digits: number) => string }; receivedDate: Date; description: string | null; isRecurring: boolean; notes: string | null; createdAt: Date; updatedAt: Date }) {
  return {
    ...income,
    amount: income.amount.toFixed(2),
  };
}

async function assertReferencesBelongToUser(input: { incomeSourceId?: string; accountId?: string }, ownerId: string): Promise<void> {
  if (input.incomeSourceId) {
    const source = await prisma.incomeSource.findFirst({ where: { id: input.incomeSourceId, userId: ownerId, isActive: true } });
    if (!source) throw new AppError(400, "INVALID_INCOME_SOURCE", "Income source was not found");
  }
  if (input.accountId) {
    const account = await prisma.account.findFirst({ where: { id: input.accountId, userId: ownerId, isActive: true } });
    if (!account) throw new AppError(400, "INVALID_ACCOUNT", "Account was not found");
  }
}

export async function listIncome(req: Request, res: Response): Promise<void> {
  const ownerId = userId(req);
  const query = req.query as unknown as IncomeQuery;
  const where = {
    userId: ownerId,
    ...(query.from || query.to ? { receivedDate: { ...(query.from ? { gte: query.from } : {}), ...(query.to ? { lte: query.to } : {}) } } : {}),
    ...(query.incomeSource ? { incomeSourceId: query.incomeSource } : {}),
    ...(query.account ? { accountId: query.account } : {}),
    ...(query.isSalary === undefined ? {} : { incomeSource: { isSalary: query.isSalary } }),
  };
  const skip = (query.page - 1) * query.limit;
  const [items, total] = await prisma.$transaction([
    prisma.incomeTransaction.findMany({ where, orderBy: { receivedDate: "desc" }, skip, take: query.limit }),
    prisma.incomeTransaction.count({ where }),
  ]);

  res.json({ success: true, data: items.map(response), pagination: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) } });
}

export async function getIncome(req: Request, res: Response): Promise<void> {
  const income = await prisma.incomeTransaction.findFirst({ where: { id: id(req), userId: userId(req) } });
  if (!income) throw new AppError(404, "INCOME_NOT_FOUND", "Income transaction was not found");
  res.json({ success: true, data: response(income) });
}

export async function createIncome(req: Request, res: Response): Promise<void> {
  const ownerId = userId(req);
  const input = req.body as CreateIncomeInput;
  await assertReferencesBelongToUser(input, ownerId);
  const income = await prisma.incomeTransaction.create({ data: { ...input, userId: ownerId } });
  res.status(201).json({ success: true, data: response(income), message: "Income recorded successfully" });
}

export async function updateIncome(req: Request, res: Response): Promise<void> {
  const ownerId = userId(req);
  const incomeId = id(req);
  const existing = await prisma.incomeTransaction.findFirst({ where: { id: incomeId, userId: ownerId } });
  if (!existing) throw new AppError(404, "INCOME_NOT_FOUND", "Income transaction was not found");
  const input = req.body as UpdateIncomeInput;
  await assertReferencesBelongToUser(input, ownerId);
  const income = await prisma.incomeTransaction.update({ where: { id: existing.id }, data: input });
  res.json({ success: true, data: response(income), message: "Income updated successfully" });
}

export async function deleteIncome(req: Request, res: Response): Promise<void> {
  const existing = await prisma.incomeTransaction.findFirst({ where: { id: id(req), userId: userId(req) } });
  if (!existing) throw new AppError(404, "INCOME_NOT_FOUND", "Income transaction was not found");
  await prisma.incomeTransaction.delete({ where: { id: existing.id } });
  res.status(204).send();
}