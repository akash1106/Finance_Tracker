import type { Request, Response } from "express";
import { prisma } from "../../config/database.js";
import { AppError } from "../../utils/AppError.js";
import type { CreateTransactionInput, TransactionQuery, UpdateTransactionInput } from "./transactions.schemas.js";

function owner(req: Request): string {
  if (!req.auth) throw new AppError(401, "UNAUTHORIZED", "Authentication token is required");
  return req.auth.userId;
}
function param(req: Request): string {
  if (typeof req.params.id !== "string") throw new AppError(400, "VALIDATION_ERROR", "Transaction ID is required");
  return req.params.id;
}
function response(transaction: { id: string; userId: string; transactionType: string; amount: { toFixed: (digits: number) => string }; categoryId: string | null; subcategoryId: string | null; accountId: string; transactionDate: Date; paymentMethod: string | null; description: string | null; notes: string | null; createdAt: Date; updatedAt: Date }) {
  return { ...transaction, amount: transaction.amount.toFixed(2) };
}

async function validateReferences(input: { accountId?: string | null; categoryId?: string | null; subcategoryId?: string | null; transactionType?: string }, userId: string): Promise<void> {
  if (input.accountId) {
    const account = await prisma.account.findFirst({ where: { id: input.accountId, userId, isActive: true } });
    if (!account) throw new AppError(400, "INVALID_ACCOUNT", "Account was not found");
  }
  if (input.transactionType === "EXPENSE" && !input.categoryId) {
    throw new AppError(400, "CATEGORY_REQUIRED", "Expense transactions require a category");
  }
  if (input.categoryId) {
    const category = await prisma.category.findFirst({ where: { id: input.categoryId, userId, isActive: true } });
    if (!category) throw new AppError(400, "INVALID_CATEGORY", "Category was not found");
  }
  if (input.subcategoryId) {
    if (!input.categoryId) throw new AppError(400, "CATEGORY_REQUIRED", "A subcategory requires a category");
    const subcategory = await prisma.subcategory.findFirst({ where: { id: input.subcategoryId, categoryId: input.categoryId, isActive: true } });
    if (!subcategory) throw new AppError(400, "INVALID_SUBCATEGORY", "Subcategory does not belong to the selected category");
  }
}

export async function listTransactions(req: Request, res: Response): Promise<void> {
  const userId = owner(req);
  const query = req.query as unknown as TransactionQuery;
  const where = {
    userId,
    ...(query.from || query.to ? { transactionDate: { ...(query.from ? { gte: query.from } : {}), ...(query.to ? { lte: query.to } : {}) } } : {}),
    ...(query.type ? { transactionType: query.type } : {}),
    ...(query.category ? { categoryId: query.category } : {}),
    ...(query.subcategory ? { subcategoryId: query.subcategory } : {}),
    ...(query.account ? { accountId: query.account } : {}),
    ...(query.paymentMethod ? { paymentMethod: query.paymentMethod } : {}),
  };
  const skip = (query.page - 1) * query.limit;
  const [items, total] = await prisma.$transaction([
    prisma.transaction.findMany({ where, orderBy: { transactionDate: query.sort }, skip, take: query.limit }),
    prisma.transaction.count({ where }),
  ]);
  res.json({ success: true, data: items.map(response), pagination: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) } });
}

export async function getTransaction(req: Request, res: Response): Promise<void> {
  const transaction = await prisma.transaction.findFirst({ where: { id: param(req), userId: owner(req) } });
  if (!transaction) throw new AppError(404, "TRANSACTION_NOT_FOUND", "Transaction was not found");
  res.json({ success: true, data: response(transaction) });
}

export async function createTransaction(req: Request, res: Response): Promise<void> {
  const userId = owner(req);
  const input = req.body as CreateTransactionInput;
  await validateReferences(input, userId);
  const transaction = await prisma.transaction.create({ data: { ...input, userId } });
  res.status(201).json({ success: true, data: response(transaction), message: "Transaction created successfully" });
}

export async function updateTransaction(req: Request, res: Response): Promise<void> {
  const userId = owner(req);
  const transactionId = param(req);
  const existing = await prisma.transaction.findFirst({ where: { id: transactionId, userId } });
  if (!existing) throw new AppError(404, "TRANSACTION_NOT_FOUND", "Transaction was not found");
  const input = req.body as UpdateTransactionInput;
  await validateReferences({ ...existing, ...input }, userId);
  const transaction = await prisma.transaction.update({ where: { id: transactionId }, data: input });
  res.json({ success: true, data: response(transaction), message: "Transaction updated successfully" });
}

export async function deleteTransaction(req: Request, res: Response): Promise<void> {
  const transaction = await prisma.transaction.findFirst({ where: { id: param(req), userId: owner(req) } });
  if (!transaction) throw new AppError(404, "TRANSACTION_NOT_FOUND", "Transaction was not found");
  await prisma.transaction.delete({ where: { id: transaction.id } });
  res.status(204).send();
}