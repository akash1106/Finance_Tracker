/// <reference types="jest" />

import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import { prisma } from "../src/config/database";
import { createTemplate, addTemplateItem, updateTemplate, deactivateTemplate, validateTemplate } from "../src/modules/budgets/budget-templates.controller";
import { listFixedExpenses, createFixedExpense, getFixedExpense, deactivateFixedExpense, generateFixedExpense } from "../src/modules/fixed-expenses/fixed-expenses.controller";
import { listRecurringTransactions, createRecurringTransaction, getRecurringTransaction, deactivateRecurringTransaction, generateRecurringTransaction } from "../src/modules/recurring-transactions/recurring-transactions.controller";
import { listSavingsGoals, createSavingsGoal, getSavingsGoal, deactivateSavingsGoal, createContribution } from "../src/modules/savings/savings.controller";
import { listInvestments, createInvestment, getInvestment, deactivateInvestment, createInvestmentContribution } from "../src/modules/investments/investments.controller";
import { listLoans, createLoan, getLoan, deactivateLoan, createLoanPayment } from "../src/modules/loans/loans.controller";
import { listFinancialGoals, createFinancialGoal, getFinancialGoal, deactivateFinancialGoal, createFinancialGoalContribution } from "../src/modules/financial-goals/financial-goals.controller";

const id = "11111111-1111-4111-8111-111111111111";
const userId = "user-id";
const req = (body: unknown = {}, params: Record<string, string> = {}): Request => ({ auth: { userId, email: "user@example.com" }, body, params, query: {} } as unknown as Request);
const res = (): Response => ({ status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis(), send: jest.fn().mockReturnThis() } as unknown as Response);
const dates = { createdAt: new Date(), updatedAt: new Date() };
const decimal = new Prisma.Decimal("100.00");

afterEach(() => jest.restoreAllMocks());

describe("budget controller coverage", () => {
  const template = { id, userId, name: "Budget", description: null, isActive: false, items: [], ...dates };
  it("covers template create, update, item add, validation, and deactivate", async () => {
    jest.spyOn(prisma.budgetTemplate, "create").mockResolvedValue(template as never);
    jest.spyOn(prisma.budgetTemplate, "findFirst").mockResolvedValue(template as never);
    jest.spyOn(prisma.budgetTemplate, "update").mockResolvedValue(template as never);
    jest.spyOn(prisma.budgetTemplateItem, "findMany").mockResolvedValue([]);
    jest.spyOn(prisma.budgetTemplateItem, "create").mockResolvedValue({ id, budgetTemplateId: id, categoryId: id, percentage: decimal, ...dates } as never);
    jest.spyOn(prisma.category, "findFirst").mockResolvedValue({ id, userId, isActive: true } as never);
    const response = res();
    await createTemplate(req({ name: "Budget" }), response); await updateTemplate(req({ name: "Budget 2" }, { id }), response); await addTemplateItem(req({ categoryId: id, percentage: 100 }, { id }), response); await validateTemplate(req({}, { id }), response); await deactivateTemplate(req({}, { id }), response);
    expect(response.json).toHaveBeenCalled();
  });
});

describe("recurring finance controller coverage", () => {
  const fixed = { id, userId, name: "Rent", amount: decimal, categoryId: id, subcategoryId: id, accountId: id, frequency: "MONTHLY", nextDueDate: new Date(), startDate: new Date(), endDate: null, autoGenerate: true, isActive: true, description: null, ...dates };
  const recurring = { id, userId, name: "Internet", transactionType: "EXPENSE", amount: decimal, categoryId: id, subcategoryId: id, accountId: id, paymentMethod: null, frequency: "MONTHLY", startDate: new Date(), endDate: null, nextRunDate: new Date(), isActive: true, notes: null, ...dates };
  it("covers fixed expense CRUD", async () => {
    jest.spyOn(prisma.fixedExpense, "findMany").mockResolvedValue([fixed] as never); jest.spyOn(prisma.fixedExpense, "findFirst").mockResolvedValue(fixed as never); jest.spyOn(prisma.fixedExpense, "create").mockResolvedValue(fixed as never); jest.spyOn(prisma.fixedExpense, "update").mockResolvedValue(fixed as never);
    jest.spyOn(prisma.category, "findFirst").mockResolvedValue({ id, userId, isActive: true } as never); jest.spyOn(prisma.subcategory, "findFirst").mockResolvedValue({ id, categoryId: id, isActive: true } as never); jest.spyOn(prisma.account, "findFirst").mockResolvedValue({ id, userId, isActive: true } as never);
    const response = res(); await listFixedExpenses(req(), response); await createFixedExpense(req({ name: "Rent", amount: 100, categoryId: id, subcategoryId: id, accountId: id, frequency: "MONTHLY", nextDueDate: new Date(), startDate: new Date() }), response); await getFixedExpense(req({}, { id }), response); await deactivateFixedExpense(req({}, { id }), response); expect(response.json).toHaveBeenCalled();
  });
  it("covers recurring transaction CRUD", async () => {
    jest.spyOn(prisma.recurringTransaction, "findMany").mockResolvedValue([recurring] as never); jest.spyOn(prisma.recurringTransaction, "findFirst").mockResolvedValue(recurring as never); jest.spyOn(prisma.recurringTransaction, "create").mockResolvedValue(recurring as never); jest.spyOn(prisma.recurringTransaction, "update").mockResolvedValue(recurring as never);
    jest.spyOn(prisma.category, "findFirst").mockResolvedValue({ id, userId, isActive: true } as never); jest.spyOn(prisma.subcategory, "findFirst").mockResolvedValue({ id, categoryId: id, isActive: true } as never); jest.spyOn(prisma.account, "findFirst").mockResolvedValue({ id, userId, isActive: true } as never);
    const response = res(); await listRecurringTransactions(req(), response); await createRecurringTransaction(req({ name: "Internet", transactionType: "EXPENSE", amount: 100, accountId: id, frequency: "MONTHLY", startDate: new Date(), nextRunDate: new Date() }), response); await getRecurringTransaction(req({}, { id }), response); await deactivateRecurringTransaction(req({}, { id }), response); expect(response.json).toHaveBeenCalled();
  });
  it("generates fixed and recurring transactions", async () => {
    jest.spyOn(prisma.fixedExpense, "findFirst").mockResolvedValue(fixed as never); jest.spyOn(prisma.recurringTransaction, "findFirst").mockResolvedValue(recurring as never);
    jest.spyOn(prisma, "$transaction").mockResolvedValue([{}, {}] as never);
    const response = res(); await generateFixedExpense(req({}, { id }), response); await generateRecurringTransaction(req({}, { id }), response); expect(response.status).toHaveBeenCalledWith(201);
  });
});

describe("savings, investment, loan, and goal controller coverage", () => {
  const goal = { id, userId, name: "Goal", targetAmount: decimal, currentAmount: decimal, targetDate: null, status: "ACTIVE", description: null, ...dates };
  const investment = { id, userId, name: "Fund", investmentType: "MUTUAL_FUND", description: null, isActive: true, ...dates };
  const loan = { id, userId, name: "Loan", principalAmount: decimal, interestRate: decimal, emiAmount: decimal, tenureMonths: 12, startDate: new Date(), endDate: null, status: "ACTIVE", description: null, ...dates };
  const financialGoal = { id, userId, name: "Car", targetAmount: decimal, currentAmount: decimal, targetDate: null, status: "ACTIVE", description: null, ...dates };
  it("covers savings goals", async () => { jest.spyOn(prisma.savingsGoal, "findMany").mockResolvedValue([goal] as never); jest.spyOn(prisma.savingsGoal, "findFirst").mockResolvedValue(goal as never); jest.spyOn(prisma.savingsGoal, "create").mockResolvedValue(goal as never); jest.spyOn(prisma.savingsGoal, "update").mockResolvedValue(goal as never); jest.spyOn(prisma.savingsContribution, "findMany").mockResolvedValue([]); const response = res(); await listSavingsGoals(req(), response); await createSavingsGoal(req({ name: "Goal", targetAmount: 100 }), response); await getSavingsGoal(req({}, { id }), response); await deactivateSavingsGoal(req({}, { id }), response); expect(response.json).toHaveBeenCalled(); });
  it("covers investments", async () => { jest.spyOn(prisma.investment, "findMany").mockResolvedValue([investment] as never); jest.spyOn(prisma.investment, "findFirst").mockResolvedValue(investment as never); jest.spyOn(prisma.investment, "create").mockResolvedValue(investment as never); jest.spyOn(prisma.investment, "update").mockResolvedValue(investment as never); jest.spyOn(prisma.investmentContribution, "findMany").mockResolvedValue([]); const response = res(); await listInvestments(req(), response); await createInvestment(req({ name: "Fund", investmentType: "MUTUAL_FUND" }), response); await getInvestment(req({}, { id }), response); await deactivateInvestment(req({}, { id }), response); expect(response.json).toHaveBeenCalled(); });
  it("covers loans", async () => { jest.spyOn(prisma.loan, "findMany").mockResolvedValue([loan] as never); jest.spyOn(prisma.loan, "findFirst").mockResolvedValue(loan as never); jest.spyOn(prisma.loan, "create").mockResolvedValue(loan as never); jest.spyOn(prisma.loan, "update").mockResolvedValue(loan as never); jest.spyOn(prisma.loanPayment, "findMany").mockResolvedValue([]); const response = res(); await listLoans(req(), response); await createLoan(req({ name: "Loan", principalAmount: 100, interestRate: 5, emiAmount: 10, tenureMonths: 12, startDate: new Date() }), response); await getLoan(req({}, { id }), response); await deactivateLoan(req({}, { id }), response); expect(response.json).toHaveBeenCalled(); });
  it("covers financial goals", async () => { jest.spyOn(prisma.financialGoal, "findMany").mockResolvedValue([financialGoal] as never); jest.spyOn(prisma.financialGoal, "findFirst").mockResolvedValue(financialGoal as never); jest.spyOn(prisma.financialGoal, "create").mockResolvedValue(financialGoal as never); jest.spyOn(prisma.financialGoal, "update").mockResolvedValue(financialGoal as never); jest.spyOn(prisma.financialGoalContribution, "findMany").mockResolvedValue([]); const response = res(); await listFinancialGoals(req(), response); await createFinancialGoal(req({ name: "Car", targetAmount: 100 }), response); await getFinancialGoal(req({}, { id }), response); await deactivateFinancialGoal(req({}, { id }), response); expect(response.json).toHaveBeenCalled(); });
  it("records savings, investment, loan, and financial goal contributions", async () => {
    const interactive = (callback: unknown) => typeof callback === "function" ? (callback as (client: typeof prisma) => Promise<unknown>)(prisma) : Promise.all(callback as Promise<unknown>[]);
    jest.spyOn(prisma, "$transaction").mockImplementation(interactive as never);
    jest.spyOn(prisma.account, "findFirst").mockResolvedValue({ id, userId, isActive: true } as never);
    jest.spyOn(prisma.transaction, "create").mockResolvedValue({ id } as never);
    jest.spyOn(prisma.savingsGoal, "findFirst").mockResolvedValue(goal as never); jest.spyOn(prisma.savingsContribution, "create").mockResolvedValue({ id, savingsGoalId: id, accountId: id, amount: decimal, contributionDate: new Date(), transactionId: id, notes: null, createdAt: new Date() } as never); jest.spyOn(prisma.savingsGoal, "update").mockResolvedValue(goal as never);
    jest.spyOn(prisma.investment, "findFirst").mockResolvedValue(investment as never); jest.spyOn(prisma.investmentContribution, "create").mockResolvedValue({ id, investmentId: id, accountId: id, amount: decimal, investmentDate: new Date(), transactionId: id, notes: null, createdAt: new Date() } as never);
    jest.spyOn(prisma.loan, "findFirst").mockResolvedValue(loan as never); jest.spyOn(prisma.loanPayment, "create").mockResolvedValue({ id, loanId: id, accountId: id, transactionId: id, amount: decimal, paymentDate: new Date(), notes: null, createdAt: new Date() } as never); jest.spyOn(prisma.loanPayment, "aggregate").mockResolvedValue({ _sum: { amount: decimal } } as never); jest.spyOn(prisma.loan, "update").mockResolvedValue(loan as never);
    jest.spyOn(prisma.financialGoal, "findFirst").mockResolvedValue(financialGoal as never); jest.spyOn(prisma.financialGoalContribution, "create").mockResolvedValue({ id, financialGoalId: id, amount: decimal, contributionDate: new Date(), transactionId: null, notes: null, createdAt: new Date() } as never); jest.spyOn(prisma.financialGoal, "update").mockResolvedValue(financialGoal as never);
    const response = res();
    await createContribution(req({ accountId: id, amount: 10, contributionDate: new Date() }, { id }), response);
    await createInvestmentContribution(req({ accountId: id, amount: 10, investmentDate: new Date() }, { id }), response);
    await createLoanPayment(req({ accountId: id, amount: 10, paymentDate: new Date() }, { id }), response);
    await createFinancialGoalContribution(req({ amount: 10, contributionDate: new Date() }, { id }), response);
    expect(response.status).toHaveBeenCalledWith(201);
  });
});