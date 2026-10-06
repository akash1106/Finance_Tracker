/// <reference types="jest" />

import { describe, expect, afterEach, it, jest } from "@jest/globals";
import request from "supertest";
import { prisma } from "../src/config/database";
import { createAccessToken } from "../src/modules/auth/auth.tokens";
import { createApp } from "../src/app";
import { getBudgetUtilization, getCashFlow, getDashboard, getExpenseBreakdown, getInvestmentHistory, getNetWorth, getSavingsHistory } from "../src/modules/dashboard/dashboard.controller";
import { budgetPerformance, spendingTrends } from "../src/modules/analytics/analytics.controller";
import { categoryReport, cashFlowReport, monthlyReport, netWorthReport, yearlyReport } from "../src/modules/reports/reports.controller";
import type { Request, Response } from "express";

const app = createApp();
const token = createAccessToken("user-id", "user@example.com");
const auth = { Authorization: `Bearer ${token}` };

function requestContext(query: Record<string, unknown> = {}): Request {
  return { auth: { userId: "user-id", email: "user@example.com" }, query } as unknown as Request;
}
function responseContext(): Response {
  return { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis(), send: jest.fn().mockReturnThis() } as unknown as Response;
}

afterEach(() => jest.restoreAllMocks());

describe("finance module happy paths", () => {
  it("lists income sources", async () => {
    jest.spyOn(prisma.incomeSource, "findMany").mockResolvedValue([]);
    expect((await request(app).get("/api/v1/income-sources").set(auth)).status).toBe(200);
  });

  it("lists income transactions", async () => {
    jest.spyOn(prisma, "$transaction").mockResolvedValue([[], 0] as never);
    expect((await request(app).get("/api/v1/income").set(auth)).status).toBe(200);
  });

  it("lists categories and transactions", async () => {
    jest.spyOn(prisma.category, "findMany").mockResolvedValue([]);
    jest.spyOn(prisma, "$transaction").mockResolvedValue([[], 0] as never);
    expect((await request(app).get("/api/v1/categories").set(auth)).status).toBe(200);
    expect((await request(app).get("/api/v1/transactions").set(auth)).status).toBe(200);
  });

  it("lists budget templates and monthly budgets", async () => {
    jest.spyOn(prisma.budgetTemplate, "findMany").mockResolvedValue([]);
    jest.spyOn(prisma.monthlyBudget, "findMany").mockResolvedValue([]);
    expect((await request(app).get("/api/v1/budget-templates").set(auth)).status).toBe(200);
    expect((await request(app).get("/api/v1/budgets").set(auth)).status).toBe(200);
  });

  it("lists recurring finance records", async () => {
    jest.spyOn(prisma.fixedExpense, "findMany").mockResolvedValue([]);
    jest.spyOn(prisma.recurringTransaction, "findMany").mockResolvedValue([]);
    expect((await request(app).get("/api/v1/fixed-expenses").set(auth)).status).toBe(200);
    expect((await request(app).get("/api/v1/recurring-transactions").set(auth)).status).toBe(200);
  });

  it("lists savings, investments, loans, and financial goals", async () => {
    jest.spyOn(prisma.savingsGoal, "findMany").mockResolvedValue([]);
    jest.spyOn(prisma.investment, "findMany").mockResolvedValue([]);
    jest.spyOn(prisma.loan, "findMany").mockResolvedValue([]);
    jest.spyOn(prisma.financialGoal, "findMany").mockResolvedValue([]);
    expect((await request(app).get("/api/v1/savings-goals").set(auth)).status).toBe(200);
    expect((await request(app).get("/api/v1/investments").set(auth)).status).toBe(200);
    expect((await request(app).get("/api/v1/loans").set(auth)).status).toBe(200);
    expect((await request(app).get("/api/v1/financial-goals").set(auth)).status).toBe(200);
  });

  it("returns dashboard aggregates", async () => {
    jest.spyOn(prisma, "$transaction").mockResolvedValue([
      { _sum: { amount: null } },
      { _sum: { amount: null } },
      { _sum: { amount: null } },
      { _sum: { amount: null } },
    ] as never);
    jest.spyOn(prisma.account, "aggregate").mockResolvedValue({ _sum: { openingBalance: null } } as never);
    expect((await request(app).get("/api/v1/dashboard").set(auth)).status).toBe(200);
  });

  it("returns spending trends and budget performance", async () => {
    jest.spyOn(prisma.transaction, "findMany").mockResolvedValue([]);
    jest.spyOn(prisma.monthlyBudget, "findMany").mockResolvedValue([]);
    expect((await request(app).get("/api/v1/analytics/spending-trends").set(auth)).status).toBe(200);
    expect((await request(app).get("/api/v1/analytics/budget-performance").set(auth)).status).toBe(200);
  });

  it("returns monthly and yearly reports", async () => {
    jest.spyOn(prisma, "$transaction").mockResolvedValue([{ _sum: { amount: null } }, []] as never);
    expect((await request(app).get("/api/v1/reports/monthly?year=2026&month=9").set(auth)).status).toBe(200);
    expect((await request(app).get("/api/v1/reports/yearly?year=2026").set(auth)).status).toBe(200);
  });

  it("exports transactions as CSV", async () => {
    jest.spyOn(prisma.transaction, "findMany").mockResolvedValue([]);
    const response = await request(app).get("/api/v1/exports/transactions?format=CSV").set(auth);
    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toMatch(/text\/csv/);
    expect(response.text).toContain("transactionType");
  });

  it("exports transactions as XLSX and reports as PDF", async () => {
    jest.spyOn(prisma.transaction, "findMany").mockResolvedValue([]);
    const spreadsheet = await request(app).get("/api/v1/exports/transactions?format=XLSX").set(auth);
    expect(spreadsheet.status).toBe(200);
    expect(spreadsheet.headers["content-type"]).toMatch(/spreadsheetml/);

    jest.spyOn(prisma, "$transaction").mockResolvedValue([{ _sum: { amount: null } }, []] as never);
    const monthly = await request(app).get("/api/v1/exports/monthly-report?year=2026&month=9").set(auth);
    const yearly = await request(app).get("/api/v1/exports/yearly-report?year=2026").set(auth);
    expect(monthly.headers["content-type"]).toMatch(/application\/pdf/);
    expect(yearly.headers["content-type"]).toMatch(/application\/pdf/);
  });
});

describe("aggregation controller coverage", () => {
  it("covers dashboard aggregation controllers", async () => {
    jest.spyOn(prisma, "$transaction").mockResolvedValue([
      { _sum: { amount: null } }, { _sum: { amount: null } }, { _sum: { amount: null } }, { _sum: { amount: null } },
    ] as never);
    jest.spyOn(prisma.account, "aggregate").mockResolvedValue({ _sum: { openingBalance: null } } as never);
    const req = requestContext();
    const res = responseContext();
    await getDashboard(req, res); await getNetWorth(req, res);
    jest.spyOn(prisma, "$transaction").mockResolvedValue([[], []] as never);
    await getCashFlow(req, res);
    jest.spyOn(prisma.transaction, "findMany").mockResolvedValue([]);
    await getExpenseBreakdown(req, res);
    jest.spyOn(prisma.monthlyBudget, "findMany").mockResolvedValue([]);
    await getBudgetUtilization(req, res);
    jest.spyOn(prisma.savingsContribution, "findMany").mockResolvedValue([]);
    jest.spyOn(prisma.investmentContribution, "findMany").mockResolvedValue([]);
    await getSavingsHistory(req, res); await getInvestmentHistory(req, res);
    expect(res.json).toHaveBeenCalled();
  });

  it("covers reports and analytics aggregation controllers", async () => {
    const req = requestContext({ year: 2026, month: 9 });
    const res = responseContext();
    jest.spyOn(prisma, "$transaction").mockResolvedValue([{ _sum: { amount: null } }, []] as never);
    await monthlyReport(req, res); await cashFlowReport(req, res);
    jest.spyOn(prisma, "$transaction").mockResolvedValue([{ _sum: { amount: null } }, []] as never);
    await yearlyReport(requestContext({ year: 2026 }), res);
    jest.spyOn(prisma.transaction, "findMany").mockResolvedValue([]);
    await categoryReport(requestContext(), res); await spendingTrends(requestContext(), res);
    jest.spyOn(prisma.account, "aggregate").mockResolvedValue({ _sum: { openingBalance: null } } as never);
    jest.spyOn(prisma, "$transaction").mockResolvedValue([{ _sum: { amount: null } }, []] as never);
    await netWorthReport(requestContext(), res);
    jest.spyOn(prisma.monthlyBudget, "findMany").mockResolvedValue([]);
    await budgetPerformance(requestContext(), res);
    expect(res.json).toHaveBeenCalled();
  });
});