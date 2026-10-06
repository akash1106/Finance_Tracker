import { Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import { prisma } from "../../config/database.js";
import { AppError } from "../../utils/AppError.js";
import type { generateBudgetSchema } from "./budgets.schemas.js";
import type { z } from "zod";

type GenerateBudgetInput = z.infer<typeof generateBudgetSchema>;

function owner(req: Request): string {
  if (!req.auth) throw new AppError(401, "UNAUTHORIZED", "Authentication token is required");
  return req.auth.userId;
}
function param(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== "string") throw new AppError(400, "VALIDATION_ERROR", `${name} is required`);
  return value;
}
function boundaries(year: number, month: number): { start: Date; end: Date } {
  return { start: new Date(Date.UTC(year, month - 1, 1)), end: new Date(Date.UTC(year, month, 1)) };
}
function money(value: Prisma.Decimal): string {
  return value.toFixed(2);
}

async function getOwnedBudget(req: Request) {
  const budget = await prisma.monthlyBudget.findFirst({
    where: { id: param(req, "id"), userId: owner(req) },
    include: { items: true },
  });
  if (!budget) throw new AppError(404, "BUDGET_NOT_FOUND", "Monthly budget was not found");
  return budget;
}

async function spentByCategory(userId: string, year: number, month: number, categoryId: string): Promise<Prisma.Decimal> {
  const range = boundaries(year, month);
  const result = await prisma.transaction.aggregate({
    where: { userId, transactionType: "EXPENSE", categoryId, transactionDate: { gte: range.start, lt: range.end } },
    _sum: { amount: true },
  });
  return result._sum.amount ?? new Prisma.Decimal(0);
}

export async function listBudgets(req: Request, res: Response): Promise<void> {
  const query = req.query as { year?: number; month?: number };
  const budgets = await prisma.monthlyBudget.findMany({
    where: { userId: owner(req), ...(query.year ? { year: query.year } : {}), ...(query.month ? { month: query.month } : {}) },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });
  res.json({ success: true, data: budgets });
}

export async function generateBudget(req: Request, res: Response): Promise<void> {
  const userId = owner(req);
  const input = req.body as GenerateBudgetInput;
  const [income, template] = await Promise.all([
    prisma.incomeTransaction.findFirst({ where: { id: input.incomeTransactionId, userId } }),
    prisma.budgetTemplate.findFirst({ where: { id: input.budgetTemplateId, userId }, include: { items: true } }),
  ]);
  if (!income) throw new AppError(404, "INCOME_NOT_FOUND", "Income transaction was not found");
  if (!template || !template.isActive) throw new AppError(400, "INVALID_BUDGET_TEMPLATE", "An active budget template is required");

  const totalPercentage = template.items.reduce((total, item) => total.add(item.percentage), new Prisma.Decimal(0));
  if (!totalPercentage.eq(100)) throw new AppError(400, "INVALID_ALLOCATION", "Budget template allocation must total 100%");

  const month = income.receivedDate.getUTCMonth() + 1;
  const year = income.receivedDate.getUTCFullYear();

  const existingBudget = await prisma.monthlyBudget.findFirst({
    where: { userId, year, month },
  });
  if (existingBudget) {
    throw new AppError(409, "BUDGET_ALREADY_EXISTS", `A monthly budget for ${year}-${String(month).padStart(2, "0")} already exists`);
  }

  const allocatedAmount = income.amount;
  const items = template.items.map((item) => ({
    categoryId: item.categoryId,
    percentage: item.percentage,
    allocatedAmount: allocatedAmount.mul(item.percentage).div(100).toDecimalPlaces(2),
  }));
  const roundedTotal = items.reduce((total, item) => total.add(item.allocatedAmount), new Prisma.Decimal(0));
  const roundingDifference = allocatedAmount.sub(roundedTotal);
  if (items.length > 0) items[items.length - 1].allocatedAmount = items[items.length - 1].allocatedAmount.add(roundingDifference);

  const budget = await prisma.monthlyBudget.create({
    data: {
      userId,
      budgetTemplateId: template.id,
      incomeTransactionId: income.id,
      month,
      year,
      allocatedAmount,
      items: { create: items },
    },
    include: { items: true },
  });
  res.status(201).json({ success: true, data: budget, message: "Monthly budget generated successfully" });
}

export async function getBudget(req: Request, res: Response): Promise<void> {
  const budget = await getOwnedBudget(req);
  res.json({ success: true, data: budget });
}

export async function getBudgetItems(req: Request, res: Response): Promise<void> {
  const budget = await getOwnedBudget(req);
  res.json({ success: true, data: budget.items });
}

export async function getBudgetItem(req: Request, res: Response): Promise<void> {
  const budget = await getOwnedBudget(req);
  const item = budget.items.find((entry) => entry.id === param(req, "itemId"));
  if (!item) throw new AppError(404, "BUDGET_ITEM_NOT_FOUND", "Monthly budget item was not found");
  res.json({ success: true, data: item });
}

export async function getBudgetSummary(req: Request, res: Response): Promise<void> {
  const budget = await getOwnedBudget(req);
  const userId = owner(req);
  let spent = new Prisma.Decimal(0);
  const items = await Promise.all(budget.items.map(async (item) => {
    const itemSpent = await spentByCategory(userId, budget.year, budget.month, item.categoryId);
    spent = spent.add(itemSpent);
    return { ...item, spentAmount: itemSpent, remaining: item.allocatedAmount.sub(itemSpent) };
  }));
  const remaining = budget.allocatedAmount.sub(spent);
  const percentageUsed = budget.allocatedAmount.isZero() ? new Prisma.Decimal(0) : spent.mul(100).div(budget.allocatedAmount);
  const usage = percentageUsed.toNumber();
  const status = usage >= 100 ? "EXCEEDED" : usage >= 80 ? "WARNING" : "NORMAL";
  res.json({ success: true, data: { allocated: money(budget.allocatedAmount), spent: money(spent), remaining: money(remaining), percentageUsed: percentageUsed.toFixed(2), status, items } });
}