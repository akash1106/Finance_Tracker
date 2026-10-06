import { Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import { prisma } from "../../config/database.js";
import { AppError } from "../../utils/AppError.js";

function owner(req: Request): string {
  if (!req.auth) throw new AppError(401, "UNAUTHORIZED", "Authentication token is required");
  return req.auth.userId;
}

function money(value: Prisma.Decimal): string {
  return value.toFixed(2);
}

async function calculateLiabilities(userId: string): Promise<Prisma.Decimal> {
  try {
    const loans = await prisma.loan.findMany({
      where: { userId, status: { not: "CANCELLED" } },
      include: { payments: { select: { amount: true } } },
    });
    return loans.reduce((total, loan) => {
      const paid = loan.payments.reduce((sum, p) => sum.add(p.amount), new Prisma.Decimal(0));
      const remaining = loan.principalAmount.sub(paid);
      return total.add(remaining.gt(0) ? remaining : new Prisma.Decimal(0));
    }, new Prisma.Decimal(0));
  } catch {
    return new Prisma.Decimal(0);
  }
}

export async function currentNetWorth(req: Request, res: Response): Promise<void> {
  const userId = owner(req);
  const [accounts, income, expenses] = await prisma.$transaction([
    prisma.account.aggregate({ where: { userId, isActive: true }, _sum: { openingBalance: true } }),
    prisma.incomeTransaction.aggregate({ where: { userId }, _sum: { amount: true } }),
    prisma.transaction.aggregate({ where: { userId, transactionType: "EXPENSE" }, _sum: { amount: true } }),
  ]);

  const liabilities = await calculateLiabilities(userId);
  const assets = (accounts._sum.openingBalance ?? new Prisma.Decimal(0))
    .add(income._sum.amount ?? 0)
    .sub(expenses._sum.amount ?? 0);
  const netWorth = assets.sub(liabilities);

  res.json({
    success: true,
    data: {
      assets: money(assets),
      liabilities: money(liabilities),
      netWorth: money(netWorth),
    },
  });
}

export async function netWorthHistory(req: Request, res: Response): Promise<void> {
  const userId = owner(req);
  const [income, expenses] = await prisma.$transaction([
    prisma.incomeTransaction.findMany({ where: { userId }, select: { amount: true, receivedDate: true } }),
    prisma.transaction.findMany({ where: { userId, transactionType: "EXPENSE" }, select: { amount: true, transactionDate: true } }),
  ]);

  const accountsAgg = await prisma.account.aggregate({ where: { userId, isActive: true }, _sum: { openingBalance: true } });
  const opening = accountsAgg._sum.openingBalance ?? new Prisma.Decimal(0);

  const monthDeltas = new Map<string, Prisma.Decimal>();

  for (const entry of income) {
    const key = `${entry.receivedDate.getUTCFullYear()}-${String(entry.receivedDate.getUTCMonth() + 1).padStart(2, "0")}`;
    monthDeltas.set(key, (monthDeltas.get(key) ?? new Prisma.Decimal(0)).add(entry.amount));
  }

  for (const entry of expenses) {
    const key = `${entry.transactionDate.getUTCFullYear()}-${String(entry.transactionDate.getUTCMonth() + 1).padStart(2, "0")}`;
    monthDeltas.set(key, (monthDeltas.get(key) ?? new Prisma.Decimal(0)).sub(entry.amount));
  }

  const sortedMonths = [...monthDeltas.keys()].sort((a, b) => a.localeCompare(b));
  let running = opening;
  const history: Array<{ period: string; netWorth: string }> = [];

  for (const month of sortedMonths) {
    running = running.add(monthDeltas.get(month)!);
    history.push({ period: month, netWorth: money(running) });
  }

  res.json({ success: true, data: history });
}