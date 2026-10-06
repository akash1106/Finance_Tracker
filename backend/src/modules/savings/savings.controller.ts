import { Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import { prisma } from "../../config/database.js";
import { AppError } from "../../utils/AppError.js";
import type { CreateSavingsContributionInput, CreateSavingsGoalInput, UpdateSavingsGoalInput } from "./savings.schemas.js";

function owner(req: Request): string {
  if (!req.auth) throw new AppError(401, "UNAUTHORIZED", "Authentication token is required");
  return req.auth.userId;
}
function param(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== "string") throw new AppError(400, "VALIDATION_ERROR", `${name} is required`);
  return value;
}
function money(value: Prisma.Decimal): string { return value.toFixed(2); }
function goalResponse(goal: { id: string; userId: string; name: string; targetAmount: Prisma.Decimal; currentAmount: Prisma.Decimal; targetDate: Date | null; description: string | null; status: string; createdAt: Date; updatedAt: Date }) {
  return { ...goal, targetAmount: money(goal.targetAmount), currentAmount: money(goal.currentAmount) };
}
function contributionResponse(contribution: { id: string; savingsGoalId: string; accountId: string; amount: Prisma.Decimal; contributionDate: Date; transactionId: string; notes: string | null; createdAt: Date }) {
  return { ...contribution, amount: money(contribution.amount) };
}
async function getOwnedGoal(req: Request) {
  const goal = await prisma.savingsGoal.findFirst({ where: { id: param(req, "id"), userId: owner(req) } });
  if (!goal) throw new AppError(404, "SAVINGS_GOAL_NOT_FOUND", "Savings goal was not found");
  return goal;
}

export async function listSavingsGoals(req: Request, res: Response): Promise<void> {
  const goals = await prisma.savingsGoal.findMany({ where: { userId: owner(req), status: { not: "CANCELLED" } }, orderBy: { createdAt: "desc" } });
  res.json({ success: true, data: goals.map(goalResponse) });
}
export async function getSavingsGoal(req: Request, res: Response): Promise<void> {
  const goal = await getOwnedGoal(req);
  const contributions = await prisma.savingsContribution.findMany({ where: { savingsGoalId: goal.id }, orderBy: { contributionDate: "desc" } });
  res.json({ success: true, data: { ...goalResponse(goal), contributions: contributions.map(contributionResponse) } });
}
export async function createSavingsGoal(req: Request, res: Response): Promise<void> {
  const input = req.body as CreateSavingsGoalInput;
  const goal = await prisma.savingsGoal.create({ data: { ...input, userId: owner(req), status: "ACTIVE" } });
  res.status(201).json({ success: true, data: goalResponse(goal), message: "Savings goal created successfully" });
}
export async function updateSavingsGoal(req: Request, res: Response): Promise<void> {
  const goal = await getOwnedGoal(req);
  const updated = await prisma.savingsGoal.update({ where: { id: goal.id }, data: req.body as UpdateSavingsGoalInput });
  res.json({ success: true, data: goalResponse(updated), message: "Savings goal updated successfully" });
}
export async function deactivateSavingsGoal(req: Request, res: Response): Promise<void> {
  const goal = await getOwnedGoal(req);
  await prisma.savingsGoal.update({ where: { id: goal.id }, data: { status: "CANCELLED" } });
  res.status(204).send();
}
export async function listContributions(req: Request, res: Response): Promise<void> {
  const goal = await getOwnedGoal(req);
  const contributions = await prisma.savingsContribution.findMany({ where: { savingsGoalId: goal.id }, orderBy: { contributionDate: "desc" } });
  res.json({ success: true, data: contributions.map(contributionResponse) });
}
export async function createContribution(req: Request, res: Response): Promise<void> {
  const goal = await getOwnedGoal(req);
  if (goal.status !== "ACTIVE") throw new AppError(400, "SAVINGS_GOAL_INACTIVE", "Savings goal is not active");
  const input = req.body as CreateSavingsContributionInput;
  const account = await prisma.account.findFirst({ where: { id: input.accountId, userId: owner(req), isActive: true } });
  if (!account) throw new AppError(400, "INVALID_ACCOUNT", "Account was not found");
  const result = await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({ data: { userId: owner(req), transactionType: "SAVING", amount: input.amount, accountId: input.accountId, transactionDate: input.contributionDate, description: `Contribution to ${goal.name}`, notes: input.notes } });
    const contribution = await tx.savingsContribution.create({ data: { savingsGoalId: goal.id, accountId: input.accountId, amount: input.amount, contributionDate: input.contributionDate, transactionId: transaction.id, notes: input.notes } });
    await tx.savingsGoal.update({ where: { id: goal.id }, data: { currentAmount: { increment: input.amount } } });
    return contribution;
  });
  res.status(201).json({ success: true, data: contributionResponse(result), message: "Savings contribution added successfully" });
}
export async function deleteContribution(req: Request, res: Response): Promise<void> {
  const goal = await getOwnedGoal(req);
  const contribution = await prisma.savingsContribution.findFirst({ where: { id: param(req, "contributionId"), savingsGoalId: goal.id } });
  if (!contribution) throw new AppError(404, "SAVINGS_CONTRIBUTION_NOT_FOUND", "Savings contribution was not found");
  await prisma.$transaction([
    prisma.savingsContribution.delete({ where: { id: contribution.id } }),
    prisma.transaction.delete({ where: { id: contribution.transactionId } }),
    prisma.savingsGoal.update({ where: { id: goal.id }, data: { currentAmount: { decrement: contribution.amount } } }),
  ]);
  res.status(204).send();
}