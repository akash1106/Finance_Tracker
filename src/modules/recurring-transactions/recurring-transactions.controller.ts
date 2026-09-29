import { Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import { prisma } from "../../config/database.js";
import { AppError } from "../../utils/AppError.js";
import type { CreateRecurringTransactionInput, UpdateRecurringTransactionInput } from "./recurring-transactions.schemas.js";

function owner(req: Request): string {
  if (!req.auth) throw new AppError(401, "UNAUTHORIZED", "Authentication token is required");
  return req.auth.userId;
}
function id(req: Request): string {
  if (typeof req.params.id !== "string") throw new AppError(400, "VALIDATION_ERROR", "Recurring transaction ID is required");
  return req.params.id;
}
function response(rule: { id: string; userId: string; name: string; transactionType: string; amount: Prisma.Decimal; categoryId: string | null; subcategoryId: string | null; accountId: string; paymentMethod: string | null; frequency: string; startDate: Date; endDate: Date | null; nextRunDate: Date; isActive: boolean; notes: string | null; createdAt: Date; updatedAt: Date }) {
  return { ...rule, amount: rule.amount.toFixed(2) };
}
function nextDate(date: Date, frequency: string): Date {
  const next = new Date(date);
  if (frequency === "WEEKLY") next.setUTCDate(next.getUTCDate() + 7);
  if (frequency === "MONTHLY") next.setUTCMonth(next.getUTCMonth() + 1);
  if (frequency === "YEARLY") next.setUTCFullYear(next.getUTCFullYear() + 1);
  return next;
}
async function validateReferences(input: { categoryId?: string | null; subcategoryId?: string | null; accountId?: string }, userId: string): Promise<void> {
  if (input.accountId) {
    const account = await prisma.account.findFirst({ where: { id: input.accountId, userId, isActive: true } });
    if (!account) throw new AppError(400, "INVALID_ACCOUNT", "Account was not found");
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
async function getOwned(req: Request) {
  const rule = await prisma.recurringTransaction.findFirst({ where: { id: id(req), userId: owner(req) } });
  if (!rule) throw new AppError(404, "RECURRING_TRANSACTION_NOT_FOUND", "Recurring transaction was not found");
  return rule;
}

export async function listRecurringTransactions(req: Request, res: Response): Promise<void> {
  const rules = await prisma.recurringTransaction.findMany({ where: { userId: owner(req), isActive: true }, orderBy: { nextRunDate: "asc" } });
  res.json({ success: true, data: rules.map(response) });
}
export async function getRecurringTransaction(req: Request, res: Response): Promise<void> {
  res.json({ success: true, data: response(await getOwned(req)) });
}
export async function createRecurringTransaction(req: Request, res: Response): Promise<void> {
  const input = req.body as CreateRecurringTransactionInput;
  const userId = owner(req);
  await validateReferences(input, userId);
  const rule = await prisma.recurringTransaction.create({ data: { ...input, userId } });
  res.status(201).json({ success: true, data: response(rule), message: "Recurring transaction created successfully" });
}
export async function updateRecurringTransaction(req: Request, res: Response): Promise<void> {
  const rule = await getOwned(req);
  const input = req.body as UpdateRecurringTransactionInput;
  await validateReferences({ categoryId: input.categoryId ?? rule.categoryId, subcategoryId: input.subcategoryId ?? rule.subcategoryId, accountId: input.accountId ?? rule.accountId }, owner(req));
  const updated = await prisma.recurringTransaction.update({ where: { id: rule.id }, data: input });
  res.json({ success: true, data: response(updated), message: "Recurring transaction updated successfully" });
}
export async function deactivateRecurringTransaction(req: Request, res: Response): Promise<void> {
  const rule = await getOwned(req);
  await prisma.recurringTransaction.update({ where: { id: rule.id }, data: { isActive: false } });
  res.status(204).send();
}
export async function generateRecurringTransaction(req: Request, res: Response): Promise<void> {
  const rule = await getOwned(req);
  if (!rule.isActive) throw new AppError(400, "RECURRING_TRANSACTION_INACTIVE", "Recurring transaction is inactive");
  if (rule.endDate && rule.nextRunDate > rule.endDate) throw new AppError(400, "RECURRING_TRANSACTION_COMPLETE", "Recurring transaction has passed its end date");
  const nextRunDate = nextDate(rule.nextRunDate, rule.frequency);
  const [transaction] = await prisma.$transaction([
    prisma.transaction.create({ data: { userId: rule.userId, transactionType: rule.transactionType, amount: rule.amount, categoryId: rule.categoryId, subcategoryId: rule.subcategoryId, accountId: rule.accountId, transactionDate: rule.nextRunDate, paymentMethod: rule.paymentMethod, description: rule.name, notes: rule.notes, recurringTransactionId: rule.id } }),
    prisma.recurringTransaction.update({ where: { id: rule.id }, data: { nextRunDate, ...(rule.endDate && nextRunDate > rule.endDate ? { isActive: false } : {}) } }),
  ]);
  res.status(201).json({ success: true, data: transaction, message: "Recurring transaction generated successfully" });
}