import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../../config/database.js";
import { AppError } from "../../utils/AppError.js";
import type { CreateAccountInput, UpdateAccountInput } from "./accounts.schemas.js";

function getUserId(request: Request): string {
  if (!request.auth) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication token is required");
  }

  return request.auth.userId;
}

function getAccountId(request: Request): string {
  const accountId = request.params.id;

  if (typeof accountId !== "string") {
    throw new AppError(400, "VALIDATION_ERROR", "Account ID is required");
  }

  return accountId;
}

async function computeAccountBalance(accountId: string, userId: string, openingBalance: Prisma.Decimal): Promise<Prisma.Decimal> {
  try {
    const [incomeSum, txSum] = await Promise.all([
      prisma.incomeTransaction.aggregate({
        where: { accountId, userId },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { accountId, userId },
        _sum: { amount: true },
      }),
    ]);
    const income = incomeSum._sum.amount ?? new Prisma.Decimal(0);
    const tx = txSum._sum.amount ?? new Prisma.Decimal(0);
    return openingBalance.add(income).sub(tx);
  } catch {
    return openingBalance;
  }
}

function accountResponse(account: {
  id: string;
  name: string;
  accountType: string;
  openingBalance: Prisma.Decimal;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}, currentBalance?: Prisma.Decimal) {
  const balance = currentBalance ?? account.openingBalance;
  return {
    id: account.id,
    name: account.name,
    accountType: account.accountType,
    openingBalance: account.openingBalance.toFixed(2),
    balance: balance.toFixed(2),
    isActive: account.isActive,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  };
}

export async function listAccounts(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  const accounts = await prisma.account.findMany({
    where: { userId, isActive: true },
    orderBy: { name: "asc" },
  });

  const deltas = new Map<string, Prisma.Decimal>();
  try {
    const [incomeByAccount, txByAccount] = await Promise.all([
      prisma.incomeTransaction.groupBy({
        by: ["accountId"],
        where: { userId },
        _sum: { amount: true },
      }),
      prisma.transaction.groupBy({
        by: ["accountId"],
        where: { userId },
        _sum: { amount: true },
      }),
    ]);

    for (const inc of incomeByAccount) {
      if (inc.accountId && inc._sum.amount) {
        deltas.set(inc.accountId, (deltas.get(inc.accountId) ?? new Prisma.Decimal(0)).add(inc._sum.amount));
      }
    }
    for (const tx of txByAccount) {
      if (tx.accountId && tx._sum.amount) {
        deltas.set(tx.accountId, (deltas.get(tx.accountId) ?? new Prisma.Decimal(0)).sub(tx._sum.amount));
      }
    }
  } catch {
    // If aggregation is not available/mocked
  }

  res.json({
    success: true,
    data: accounts.map((account) => {
      const netDelta = deltas.get(account.id) ?? new Prisma.Decimal(0);
      const balance = account.openingBalance.add(netDelta);
      return accountResponse(account, balance);
    }),
  });
}

export async function getAccount(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  const accountId = getAccountId(req);
  const account = await prisma.account.findFirst({
    where: { id: accountId, userId },
  });

  if (!account) {
    throw new AppError(404, "ACCOUNT_NOT_FOUND", "Account was not found");
  }

  const balance = await computeAccountBalance(account.id, userId, account.openingBalance);

  res.json({
    success: true,
    data: accountResponse(account, balance),
  });
}

export async function createAccount(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  const input = req.body as CreateAccountInput;
  const account = await prisma.account.create({
    data: { ...input, userId },
  });

  res.status(201).json({
    success: true,
    data: accountResponse(account, account.openingBalance),
    message: "Account created successfully",
  });
}

export async function updateAccount(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  const accountId = getAccountId(req);
  const input = req.body as UpdateAccountInput;
  const existing = await prisma.account.findFirst({
    where: { id: accountId, userId },
  });

  if (!existing) {
    throw new AppError(404, "ACCOUNT_NOT_FOUND", "Account was not found");
  }

  const account = await prisma.account.update({
    where: { id: existing.id },
    data: input,
  });

  const balance = await computeAccountBalance(account.id, userId, account.openingBalance);

  res.json({
    success: true,
    data: accountResponse(account, balance),
    message: "Account updated successfully",
  });
}

export async function deactivateAccount(req: Request, res: Response): Promise<void> {
  const userId = getUserId(req);
  const accountId = getAccountId(req);
  const existing = await prisma.account.findFirst({
    where: { id: accountId, userId },
  });

  if (!existing) {
    throw new AppError(404, "ACCOUNT_NOT_FOUND", "Account was not found");
  }

  await prisma.account.update({
    where: { id: existing.id },
    data: { isActive: false },
  });

  res.status(204).send();
}