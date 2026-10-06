import { Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import { prisma } from "../../config/database.js";
import { AppError } from "../../utils/AppError.js";

function owner(req: Request): string { if (!req.auth) throw new AppError(401, "UNAUTHORIZED", "Authentication token is required"); return req.auth.userId; }
function money(value: Prisma.Decimal): string { return value.toFixed(2); }
export async function currentNetWorth(req: Request, res: Response): Promise<void> {
  const userId = owner(req);
  const [accounts, income, expenses] = await prisma.$transaction([
    prisma.account.aggregate({ where: { userId, isActive: true }, _sum: { openingBalance: true } }),
    prisma.incomeTransaction.aggregate({ where: { userId }, _sum: { amount: true } }),
    prisma.transaction.aggregate({ where: { userId, transactionType: "EXPENSE" }, _sum: { amount: true } }),
  ]);
  const assets = (accounts._sum.openingBalance ?? new Prisma.Decimal(0)).add(income._sum.amount ?? 0);
  const netWorth = assets.sub(expenses._sum.amount ?? 0);
  res.json({ success: true, data: { assets: money(assets), liabilities: "0.00", netWorth: money(netWorth) } });
}
export async function netWorthHistory(req: Request, res: Response): Promise<void> {
  const userId = owner(req);
  const [income, expenses] = await prisma.$transaction([
    prisma.incomeTransaction.findMany({ where: { userId }, select: { amount: true, receivedDate: true } }),
    prisma.transaction.findMany({ where: { userId, transactionType: "EXPENSE" }, select: { amount: true, transactionDate: true } }),
  ]);
  const months = new Map<string, Prisma.Decimal>();
  const opening = (await prisma.account.aggregate({ where: { userId, isActive: true }, _sum: { openingBalance: true } }))._sum.openingBalance ?? new Prisma.Decimal(0);
  months.set("opening", opening);
  for (const entry of income) { const key = `${entry.receivedDate.getUTCFullYear()}-${String(entry.receivedDate.getUTCMonth() + 1).padStart(2, "0")}`; months.set(key, (months.get(key) ?? opening).add(entry.amount)); }
  for (const entry of expenses) { const key = `${entry.transactionDate.getUTCFullYear()}-${String(entry.transactionDate.getUTCMonth() + 1).padStart(2, "0")}`; months.set(key, (months.get(key) ?? opening).sub(entry.amount)); }
  res.json({ success: true, data: [...months.entries()].map(([period, netWorth]) => ({ period, netWorth: money(netWorth) })) });
}