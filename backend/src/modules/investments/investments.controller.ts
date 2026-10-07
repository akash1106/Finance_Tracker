import { Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import { prisma } from "../../config/database.js";
import { AppError } from "../../utils/AppError.js";
import type { CreateInvestmentContributionInput, CreateInvestmentInput, UpdateInvestmentInput } from "./investments.schemas.js";

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
function investmentResponse(investment: { id: string; userId: string; name: string; investmentType: string; description: string | null; isActive: boolean; createdAt: Date; updatedAt: Date }) {
  return investment;
}
function contributionResponse(contribution: any) {
  return {
    ...contribution,
    amount:
      typeof contribution.amount === "number"
        ? contribution.amount.toFixed(2)
        : contribution.amount?.toFixed
        ? contribution.amount.toFixed(2)
        : String(contribution.amount),
  };
}
async function getOwnedInvestment(req: Request) {
  const investment = await prisma.investment.findFirst({ where: { id: param(req, "id"), userId: owner(req) } });
  if (!investment) throw new AppError(404, "INVESTMENT_NOT_FOUND", "Investment was not found");
  return investment;
}

export async function listInvestments(req: Request, res: Response): Promise<void> {
  const investments = await prisma.investment.findMany({
    where: { userId: owner(req), isActive: true },
    include: { contributions: true },
    orderBy: { name: "asc" },
  });
  res.json({
    success: true,
    data: investments.map((inv: any) => {
      let total = new Prisma.Decimal(0);
      if (Array.isArray(inv.contributions)) {
        for (const c of inv.contributions) {
          if (c && c.amount) {
            total = total.add(c.amount);
          }
        }
      }
      return {
        ...investmentResponse(inv),
        totalContributed: money(total),
        totalInvested: money(total),
      };
    }),
  });
}
export async function getInvestment(req: Request, res: Response): Promise<void> {
  const investment = await getOwnedInvestment(req);
  const contributions = await prisma.investmentContribution.findMany({
    where: { investmentId: investment.id },
    include: { account: true },
    orderBy: { investmentDate: "desc" },
  });
  const total = contributions.reduce((sum, contribution) => sum.add(contribution.amount), new Prisma.Decimal(0));
  res.json({
    success: true,
    data: {
      ...investmentResponse(investment),
      totalContributed: money(total),
      totalInvested: money(total),
      contributions: contributions.map(contributionResponse),
    },
  });
}
export async function createInvestment(req: Request, res: Response): Promise<void> {
  const investment = await prisma.investment.create({ data: { ...(req.body as CreateInvestmentInput), userId: owner(req) } });
  res.status(201).json({ success: true, data: investmentResponse(investment), message: "Investment created successfully" });
}
export async function updateInvestment(req: Request, res: Response): Promise<void> {
  const investment = await getOwnedInvestment(req);
  const updated = await prisma.investment.update({ where: { id: investment.id }, data: req.body as UpdateInvestmentInput });
  res.json({ success: true, data: investmentResponse(updated), message: "Investment updated successfully" });
}
export async function deactivateInvestment(req: Request, res: Response): Promise<void> {
  const investment = await getOwnedInvestment(req);
  await prisma.investment.update({ where: { id: investment.id }, data: { isActive: false } });
  res.status(204).send();
}
export async function listInvestmentContributions(req: Request, res: Response): Promise<void> {
  const investment = await getOwnedInvestment(req);
  const contributions = await prisma.investmentContribution.findMany({
    where: { investmentId: investment.id },
    include: { account: true },
    orderBy: { investmentDate: "desc" },
  });
  res.json({ success: true, data: contributions.map(contributionResponse) });
}
export async function createInvestmentContribution(req: Request, res: Response): Promise<void> {
  const investment = await getOwnedInvestment(req);
  if (!investment.isActive) throw new AppError(400, "INVESTMENT_INACTIVE", "Investment is inactive");
  const input = req.body as CreateInvestmentContributionInput;
  const account = await prisma.account.findFirst({ where: { id: input.accountId, userId: owner(req), isActive: true } });
  if (!account) throw new AppError(400, "INVALID_ACCOUNT", "Account was not found");
  const contribution = await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({ data: { userId: owner(req), transactionType: "INVESTMENT", amount: input.amount, accountId: input.accountId, transactionDate: input.investmentDate, description: `Contribution to ${investment.name}`, notes: input.notes } });
    return tx.investmentContribution.create({ data: { investmentId: investment.id, accountId: input.accountId, amount: input.amount, investmentDate: input.investmentDate, transactionId: transaction.id, notes: input.notes } });
  });
  res.status(201).json({ success: true, data: contributionResponse(contribution), message: "Investment contribution added successfully" });
}
export async function deleteInvestmentContribution(req: Request, res: Response): Promise<void> {
  const investment = await getOwnedInvestment(req);
  const contribution = await prisma.investmentContribution.findFirst({ where: { id: param(req, "contributionId"), investmentId: investment.id } });
  if (!contribution) throw new AppError(404, "INVESTMENT_CONTRIBUTION_NOT_FOUND", "Investment contribution was not found");
  await prisma.$transaction([
    prisma.investmentContribution.delete({ where: { id: contribution.id } }),
    prisma.transaction.delete({ where: { id: contribution.transactionId } }),
  ]);
  res.status(204).send();
}