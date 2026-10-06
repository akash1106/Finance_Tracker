import { Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import { prisma } from "../../config/database.js";
import { AppError } from "../../utils/AppError.js";
import type { CreateFixedExpenseInput, UpdateFixedExpenseInput } from "./fixed-expenses.schemas.js";

function owner(req: Request): string {
  if (!req.auth) throw new AppError(401, "UNAUTHORIZED", "Authentication token is required");
  return req.auth.userId;
}
function id(req: Request): string {
  if (typeof req.params.id !== "string") throw new AppError(400, "VALIDATION_ERROR", "Fixed expense ID is required");
  return req.params.id;
}
function response(expense: { id: string; userId: string; name: string; amount: Prisma.Decimal; categoryId: string; subcategoryId: string; accountId: string; frequency: string; nextDueDate: Date; startDate: Date; endDate: Date | null; autoGenerate: boolean; isActive: boolean; description: string | null; createdAt: Date; updatedAt: Date }) {
  return { ...expense, amount: expense.amount.toFixed(2) };
}
function nextDate(date: Date, frequency: string): Date {
  const next = new Date(date);
  if (frequency === "WEEKLY") next.setUTCDate(next.getUTCDate() + 7);
  if (frequency === "MONTHLY") next.setUTCMonth(next.getUTCMonth() + 1);
  if (frequency === "YEARLY") next.setUTCFullYear(next.getUTCFullYear() + 1);
  return next;
}

async function validateReferences(input: { categoryId?: string; subcategoryId?: string; accountId?: string }, userId: string): Promise<void> {
  const [category, account] = await Promise.all([
    input.categoryId ? prisma.category.findFirst({ where: { id: input.categoryId, userId, isActive: true } }) : null,
    input.accountId ? prisma.account.findFirst({ where: { id: input.accountId, userId, isActive: true } }) : null,
  ]);
  if (input.categoryId && !category) throw new AppError(400, "INVALID_CATEGORY", "Category was not found");
  if (input.accountId && !account) throw new AppError(400, "INVALID_ACCOUNT", "Account was not found");
  if (input.subcategoryId) {
    if (!input.categoryId) throw new AppError(400, "CATEGORY_REQUIRED", "A subcategory requires a category");
    const subcategory = await prisma.subcategory.findFirst({ where: { id: input.subcategoryId, categoryId: input.categoryId, isActive: true } });
    if (!subcategory) throw new AppError(400, "INVALID_SUBCATEGORY", "Subcategory does not belong to the selected category");
  }
}

async function getOwned(req: Request) {
  const expense = await prisma.fixedExpense.findFirst({ where: { id: id(req), userId: owner(req) } });
  if (!expense) throw new AppError(404, "FIXED_EXPENSE_NOT_FOUND", "Fixed expense was not found");
  return expense;
}

export async function listFixedExpenses(req: Request, res: Response): Promise<void> {
  const expenses = await prisma.fixedExpense.findMany({ where: { userId: owner(req), isActive: true }, orderBy: { nextDueDate: "asc" } });
  res.json({ success: true, data: expenses.map(response) });
}
export async function getFixedExpense(req: Request, res: Response): Promise<void> {
  res.json({ success: true, data: response(await getOwned(req)) });
}
export async function createFixedExpense(req: Request, res: Response): Promise<void> {
  const input = req.body as CreateFixedExpenseInput;
  const userId = owner(req);
  await validateReferences(input, userId);
  const expense = await prisma.fixedExpense.create({ data: { ...input, userId } });
  res.status(201).json({ success: true, data: response(expense), message: "Fixed expense created successfully" });
}
export async function updateFixedExpense(req: Request, res: Response): Promise<void> {
  const expense = await getOwned(req);
  const input = req.body as UpdateFixedExpenseInput;
  await validateReferences({ categoryId: input.categoryId ?? expense.categoryId, subcategoryId: input.subcategoryId ?? expense.subcategoryId, accountId: input.accountId ?? expense.accountId }, owner(req));
  const updated = await prisma.fixedExpense.update({ where: { id: expense.id }, data: input });
  res.json({ success: true, data: response(updated), message: "Fixed expense updated successfully" });
}
export async function deactivateFixedExpense(req: Request, res: Response): Promise<void> {
  const expense = await getOwned(req);
  await prisma.fixedExpense.update({ where: { id: expense.id }, data: { isActive: false } });
  res.status(204).send();
}
export async function generateFixedExpense(req: Request, res: Response): Promise<void> {
  const expense = await getOwned(req);
  if (!expense.isActive) throw new AppError(400, "FIXED_EXPENSE_INACTIVE", "Fixed expense is inactive");
  if (expense.endDate && expense.nextDueDate > expense.endDate) throw new AppError(400, "FIXED_EXPENSE_COMPLETE", "Fixed expense has passed its end date");
  const nextDueDate = nextDate(expense.nextDueDate, expense.frequency);
  const [transaction] = await prisma.$transaction([
    prisma.transaction.create({ data: { userId: expense.userId, transactionType: "EXPENSE", amount: expense.amount, categoryId: expense.categoryId, subcategoryId: expense.subcategoryId, accountId: expense.accountId, transactionDate: expense.nextDueDate, description: expense.description ?? expense.name } }),
    prisma.fixedExpense.update({ where: { id: expense.id }, data: { nextDueDate } }),
  ]);
  res.status(201).json({ success: true, data: transaction, message: "Fixed expense transaction generated successfully" });
}