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

function accountResponse(account: {
  id: string;
  name: string;
  accountType: string;
  openingBalance: Prisma.Decimal;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: account.id,
    name: account.name,
    accountType: account.accountType,
    openingBalance: account.openingBalance.toFixed(2),
    balance: account.openingBalance.toFixed(2),
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

  res.json({
    success: true,
    data: accounts.map(accountResponse),
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

  res.json({
    success: true,
    data: accountResponse(account),
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
    data: accountResponse(account),
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

  res.json({
    success: true,
    data: accountResponse(account),
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