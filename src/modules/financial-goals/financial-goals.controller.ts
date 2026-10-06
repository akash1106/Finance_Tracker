import { Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import { prisma } from "../../config/database.js";
import { AppError } from "../../utils/AppError.js";
import type { CreateFinancialGoalContributionInput, CreateFinancialGoalInput, UpdateFinancialGoalInput } from "./financial-goals.schemas.js";

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
function goalResponse(goal: { id: string; userId: string; name: string; targetAmount: Prisma.Decimal; targetDate: Date | null; currentAmount: Prisma.Decimal; status: string; description: string | null; createdAt: Date; updatedAt: Date }) {
  return { ...goal, targetAmount: money(goal.targetAmount), currentAmount: money(goal.currentAmount) };
}
function contributionResponse(contribution: { id: string; financialGoalId: string; amount: Prisma.Decimal; contributionDate: Date; transactionId: string | null; notes: string | null; createdAt: Date }) {
  return { ...contribution, amount: money(contribution.amount) };
}
async function getOwnedGoal(req: Request) {
  const goal = await prisma.financialGoal.findFirst({ where: { id: param(req, "id"), userId: owner(req) } });
  if (!goal) throw new AppError(404, "FINANCIAL_GOAL_NOT_FOUND", "Financial goal was not found");
  return goal;
}

export async function listFinancialGoals(req: Request, res: Response): Promise<void> {
  const goals = await prisma.financialGoal.findMany({ where: { userId: owner(req), status: { not: "CANCELLED" } }, orderBy: { createdAt: "desc" } });
  res.json({ success: true, data: goals.map(goalResponse) });
}
export async function getFinancialGoal(req: Request, res: Response): Promise<void> {
  const goal = await getOwnedGoal(req);
  const contributions = await prisma.financialGoalContribution.findMany({ where: { financialGoalId: goal.id }, orderBy: { contributionDate: "desc" } });
  res.json({ success: true, data: { ...goalResponse(goal), contributions: contributions.map(contributionResponse) } });
}
export async function createFinancialGoal(req: Request, res: Response): Promise<void> {
  const goal = await prisma.financialGoal.create({ data: { ...(req.body as CreateFinancialGoalInput), userId: owner(req), status: "ACTIVE" } });
  res.status(201).json({ success: true, data: goalResponse(goal), message: "Financial goal created successfully" });
}
export async function updateFinancialGoal(req: Request, res: Response): Promise<void> {
  const goal = await getOwnedGoal(req);
  const updated = await prisma.financialGoal.update({ where: { id: goal.id }, data: req.body as UpdateFinancialGoalInput });
  res.json({ success: true, data: goalResponse(updated), message: "Financial goal updated successfully" });
}
export async function deactivateFinancialGoal(req: Request, res: Response): Promise<void> {
  const goal = await getOwnedGoal(req);
  await prisma.financialGoal.update({ where: { id: goal.id }, data: { status: "CANCELLED" } });
  res.status(204).send();
}
export async function listFinancialGoalContributions(req: Request, res: Response): Promise<void> {
  const goal = await getOwnedGoal(req);
  const contributions = await prisma.financialGoalContribution.findMany({ where: { financialGoalId: goal.id }, orderBy: { contributionDate: "desc" } });
  res.json({ success: true, data: contributions.map(contributionResponse) });
}
export async function createFinancialGoalContribution(req: Request, res: Response): Promise<void> {
  const goal = await getOwnedGoal(req);
  if (goal.status !== "ACTIVE") throw new AppError(400, "FINANCIAL_GOAL_INACTIVE", "Financial goal is not active");
  const input = req.body as CreateFinancialGoalContributionInput;
  const contribution = await prisma.$transaction(async (tx) => {
    const created = await tx.financialGoalContribution.create({ data: { financialGoalId: goal.id, amount: input.amount, contributionDate: input.contributionDate, notes: input.notes } });
    await tx.financialGoal.update({ where: { id: goal.id }, data: { currentAmount: { increment: input.amount } } });
    return created;
  });
  res.status(201).json({ success: true, data: contributionResponse(contribution), message: "Financial goal contribution added successfully" });
}
export async function deleteFinancialGoalContribution(req: Request, res: Response): Promise<void> {
  const goal = await getOwnedGoal(req);
  const contribution = await prisma.financialGoalContribution.findFirst({ where: { id: param(req, "contributionId"), financialGoalId: goal.id } });
  if (!contribution) throw new AppError(404, "FINANCIAL_GOAL_CONTRIBUTION_NOT_FOUND", "Financial goal contribution was not found");
  await prisma.$transaction([
    prisma.financialGoalContribution.delete({ where: { id: contribution.id } }),
    prisma.financialGoal.update({ where: { id: goal.id }, data: { currentAmount: { decrement: contribution.amount } } }),
  ]);
  res.status(204).send();
}