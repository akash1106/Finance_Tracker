import { Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import { prisma } from "../../config/database.js";
import { AppError } from "../../utils/AppError.js";
import type { CreateLoanInput, CreateLoanPaymentInput, UpdateLoanInput } from "./loans.schemas.js";

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
function loanResponse(loan: { id: string; userId: string; name: string; principalAmount: Prisma.Decimal; interestRate: Prisma.Decimal; emiAmount: Prisma.Decimal; tenureMonths: number; startDate: Date; endDate: Date | null; status: string; description: string | null; createdAt: Date; updatedAt: Date }) {
  return { ...loan, principalAmount: money(loan.principalAmount), interestRate: money(loan.interestRate), emiAmount: money(loan.emiAmount) };
}
function paymentResponse(payment: { id: string; loanId: string; accountId: string; transactionId: string; amount: Prisma.Decimal; paymentDate: Date; notes: string | null; createdAt: Date }) {
  return { ...payment, amount: money(payment.amount) };
}
async function getOwnedLoan(req: Request) {
  const loan = await prisma.loan.findFirst({ where: { id: param(req, "id"), userId: owner(req) } });
  if (!loan) throw new AppError(404, "LOAN_NOT_FOUND", "Loan was not found");
  return loan;
}
async function paidAmount(loanId: string): Promise<Prisma.Decimal> {
  const result = await prisma.loanPayment.aggregate({ where: { loanId }, _sum: { amount: true } });
  return result._sum.amount ?? new Prisma.Decimal(0);
}

export async function listLoans(req: Request, res: Response): Promise<void> {
  const loans = await prisma.loan.findMany({ where: { userId: owner(req), status: { not: "CANCELLED" } }, orderBy: { startDate: "desc" } });
  res.json({ success: true, data: loans.map(loanResponse) });
}
export async function getLoan(req: Request, res: Response): Promise<void> {
  const loan = await getOwnedLoan(req);
  const payments = await prisma.loanPayment.findMany({ where: { loanId: loan.id }, orderBy: { paymentDate: "desc" } });
  const paid = payments.reduce((sum, payment) => sum.add(payment.amount), new Prisma.Decimal(0));
  const remainingPrincipal = loan.principalAmount.gt(paid) ? loan.principalAmount.sub(paid) : new Prisma.Decimal(0);
  res.json({ success: true, data: { ...loanResponse(loan), paidAmount: money(paid), remainingPrincipal: money(remainingPrincipal), payments: payments.map(paymentResponse) } });
}
export async function createLoan(req: Request, res: Response): Promise<void> {
  const loan = await prisma.loan.create({ data: { ...(req.body as CreateLoanInput), userId: owner(req), status: "ACTIVE" } });
  res.status(201).json({ success: true, data: loanResponse(loan), message: "Loan created successfully" });
}
export async function updateLoan(req: Request, res: Response): Promise<void> {
  const loan = await getOwnedLoan(req);
  const updated = await prisma.loan.update({ where: { id: loan.id }, data: req.body as UpdateLoanInput });
  res.json({ success: true, data: loanResponse(updated), message: "Loan updated successfully" });
}
export async function deactivateLoan(req: Request, res: Response): Promise<void> {
  const loan = await getOwnedLoan(req);
  await prisma.loan.update({ where: { id: loan.id }, data: { status: "CANCELLED" } });
  res.status(204).send();
}
export async function listLoanPayments(req: Request, res: Response): Promise<void> {
  const loan = await getOwnedLoan(req);
  const payments = await prisma.loanPayment.findMany({ where: { loanId: loan.id }, orderBy: { paymentDate: "desc" } });
  res.json({ success: true, data: payments.map(paymentResponse) });
}
export async function createLoanPayment(req: Request, res: Response): Promise<void> {
  const loan = await getOwnedLoan(req);
  if (loan.status !== "ACTIVE") throw new AppError(400, "LOAN_INACTIVE", "Loan is not active");
  const input = req.body as CreateLoanPaymentInput;
  const account = await prisma.account.findFirst({ where: { id: input.accountId, userId: owner(req), isActive: true } });
  if (!account) throw new AppError(400, "INVALID_ACCOUNT", "Account was not found");
  const payment = await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({ data: { userId: owner(req), transactionType: "LOAN_PAYMENT", amount: input.amount, accountId: input.accountId, transactionDate: input.paymentDate, description: `Payment for ${loan.name}`, notes: input.notes } });
    const created = await tx.loanPayment.create({ data: { loanId: loan.id, accountId: input.accountId, transactionId: transaction.id, amount: input.amount, paymentDate: input.paymentDate, notes: input.notes } });
    const total = await tx.loanPayment.aggregate({ where: { loanId: loan.id }, _sum: { amount: true } });
    const tenureTotal = loan.emiAmount.mul(loan.tenureMonths);
    const targetAmount = tenureTotal.gt(loan.principalAmount) ? tenureTotal : loan.principalAmount;
    if ((total._sum.amount ?? new Prisma.Decimal(0)).gte(targetAmount)) {
      await tx.loan.update({ where: { id: loan.id }, data: { status: "COMPLETED" } });
    }
    return created;
  });
  res.status(201).json({ success: true, data: paymentResponse(payment), message: "Loan payment recorded successfully" });
}
export async function deleteLoanPayment(req: Request, res: Response): Promise<void> {
  const loan = await getOwnedLoan(req);
  const payment = await prisma.loanPayment.findFirst({ where: { id: param(req, "paymentId"), loanId: loan.id } });
  if (!payment) throw new AppError(404, "LOAN_PAYMENT_NOT_FOUND", "Loan payment was not found");
  await prisma.$transaction([
    prisma.loanPayment.delete({ where: { id: payment.id } }),
    prisma.transaction.delete({ where: { id: payment.transactionId } }),
    prisma.loan.update({ where: { id: loan.id }, data: { status: "ACTIVE" } }),
  ]);
  res.status(204).send();
}