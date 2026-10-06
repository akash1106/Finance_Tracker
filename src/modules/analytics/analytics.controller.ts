import { Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import { prisma } from "../../config/database.js";
import { AppError } from "../../utils/AppError.js";
import type { ReportQuery } from "./analytics.schemas.js";

function owner(req: Request): string { if (!req.auth) throw new AppError(401, "UNAUTHORIZED", "Authentication token is required"); return req.auth.userId; }
function money(value: Prisma.Decimal): string { return value.toFixed(2); }
function monthKey(date: Date): string { return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`; }
function dateRange(query: ReportQuery) { return { ...(query.from ? { gte: query.from } : {}), ...(query.to ? { lte: query.to } : {}) }; }

export async function spendingTrends(req: Request, res: Response): Promise<void> {
  const transactions = await prisma.transaction.findMany({ where: { userId: owner(req), transactionType: "EXPENSE", ...(req.query.from || req.query.to ? { transactionDate: dateRange(req.query as unknown as ReportQuery) } : {}) }, select: { amount: true, transactionDate: true } });
  const grouped = new Map<string, Prisma.Decimal>();
  for (const transaction of transactions) grouped.set(monthKey(transaction.transactionDate), (grouped.get(monthKey(transaction.transactionDate)) ?? new Prisma.Decimal(0)).add(transaction.amount));
  res.json({ success: true, data: [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([month, amount]) => ({ month, amount: money(amount) })) });
}

export async function budgetPerformance(req: Request, res: Response): Promise<void> {
  const userId = owner(req);
  const budgets = await prisma.monthlyBudget.findMany({ where: { userId, ...(req.query.year ? { year: Number(req.query.year) } : {}), ...(req.query.month ? { month: Number(req.query.month) } : {}) }, include: { items: true } });
  const data = [];
  for (const budget of budgets) for (const item of budget.items) { const spent = await prisma.transaction.aggregate({ where: { userId, transactionType: "EXPENSE", categoryId: item.categoryId, transactionDate: { gte: new Date(Date.UTC(budget.year, budget.month - 1, 1)), lt: new Date(Date.UTC(budget.year, budget.month, 1)) } }, _sum: { amount: true } }); const spentAmount = spent._sum.amount ?? new Prisma.Decimal(0); data.push({ budgetId: budget.id, categoryId: item.categoryId, allocated: money(item.allocatedAmount), spent: money(spentAmount), variance: money(item.allocatedAmount.sub(spentAmount)) }); }
  res.json({ success: true, data });
}