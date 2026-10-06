import { Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import { prisma } from "../../config/database.js";
import { AppError } from "../../utils/AppError.js";
import type { ReportQuery } from "./reports.schemas.js";

function owner(req: Request): string { if (!req.auth) throw new AppError(401, "UNAUTHORIZED", "Authentication token is required"); return req.auth.userId; }
function money(value: Prisma.Decimal): string { return value.toFixed(2); }
function range(query: ReportQuery): { gte?: Date; lte?: Date } { return { ...(query.from ? { gte: query.from } : {}), ...(query.to ? { lte: query.to } : {}) }; }
function monthRange(year: number, month: number): { gte: Date; lt: Date } { return { gte: new Date(Date.UTC(year, month - 1, 1)), lt: new Date(Date.UTC(year, month, 1)) }; }
function monthKey(date: Date): string { return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`; }

async function totals(userId: string, query: ReportQuery) {
  const dateFilter = query.year && query.month ? monthRange(query.year, query.month) : range(query);
  const [income, transactions] = await prisma.$transaction([
    prisma.incomeTransaction.aggregate({ where: { userId, ...(Object.keys(dateFilter).length ? { receivedDate: dateFilter } : {}) }, _sum: { amount: true } }),
    prisma.transaction.findMany({ where: { userId, ...(query.category ? { categoryId: query.category } : {}), ...(Object.keys(dateFilter).length ? { transactionDate: dateFilter } : {}) }, select: { amount: true, transactionType: true } }),
  ]);
  const values = { income: income._sum.amount ?? new Prisma.Decimal(0), expenses: new Prisma.Decimal(0), savings: new Prisma.Decimal(0), investments: new Prisma.Decimal(0) };
  for (const transaction of transactions) { if (transaction.transactionType === "EXPENSE") values.expenses = values.expenses.add(transaction.amount); if (transaction.transactionType === "SAVING") values.savings = values.savings.add(transaction.amount); if (transaction.transactionType === "INVESTMENT") values.investments = values.investments.add(transaction.amount); }
  return values;
}

export async function monthlyReport(req: Request, res: Response): Promise<void> {
  const query = req.query as unknown as ReportQuery;
  if (!query.year || !query.month) throw new AppError(400, "VALIDATION_ERROR", "year and month are required");
  const values = await totals(owner(req), query);
  res.json({ success: true, data: { year: query.year, month: query.month, income: money(values.income), expenses: money(values.expenses), savings: money(values.savings), investments: money(values.investments), netCashFlow: money(values.income.sub(values.expenses).sub(values.savings).sub(values.investments)) } });
}

export async function yearlyReport(req: Request, res: Response): Promise<void> {
  const query = req.query as unknown as ReportQuery;
  if (!query.year) throw new AppError(400, "VALIDATION_ERROR", "year is required");
  const months = [];
  for (let month = 1; month <= 12; month += 1) { const values = await totals(owner(req), { year: query.year, month }); months.push({ month, income: money(values.income), expenses: money(values.expenses), savings: money(values.savings), investments: money(values.investments), netCashFlow: money(values.income.sub(values.expenses).sub(values.savings).sub(values.investments)) }); }
  res.json({ success: true, data: { year: query.year, months } });
}

export async function categoryReport(req: Request, res: Response): Promise<void> {
  const query = req.query as unknown as ReportQuery;
  const transactions = await prisma.transaction.findMany({ where: { userId: owner(req), transactionType: "EXPENSE", ...(query.category ? { categoryId: query.category } : {}), ...(query.from || query.to ? { transactionDate: range(query) } : {}) }, include: { category: { select: { id: true, name: true } } } });
  const grouped = new Map<string, { categoryId: string | null; amount: Prisma.Decimal }>();
  for (const transaction of transactions) { const key = transaction.category?.id ?? "uncategorized"; const current = grouped.get(key) ?? { categoryId: transaction.category?.id ?? null, amount: new Prisma.Decimal(0) }; current.amount = current.amount.add(transaction.amount); grouped.set(key, current); }
  res.json({ success: true, data: [...grouped.entries()].map(([key, value]) => ({ categoryId: value.categoryId, category: key === "uncategorized" ? "Uncategorized" : transactions.find((transaction) => transaction.category?.id === key)?.category?.name, amount: money(value.amount) })) });
}

export async function netWorthReport(req: Request, res: Response): Promise<void> {
  const userId = owner(req);
  const accounts = await prisma.account.aggregate({ where: { userId, isActive: true }, _sum: { openingBalance: true } });
  const values = await totals(userId, req.query as unknown as ReportQuery);
  const netWorth = (accounts._sum.openingBalance ?? new Prisma.Decimal(0)).add(values.income).sub(values.expenses);
  res.json({ success: true, data: { assets: money(netWorth), liabilities: "0.00", netWorth: money(netWorth) } });
}

export async function cashFlowReport(req: Request, res: Response): Promise<void> {
  const values = await totals(owner(req), req.query as unknown as ReportQuery);
  res.json({ success: true, data: { income: money(values.income), expenses: money(values.expenses), savings: money(values.savings), investments: money(values.investments), netCashFlow: money(values.income.sub(values.expenses).sub(values.savings).sub(values.investments)) } });
}