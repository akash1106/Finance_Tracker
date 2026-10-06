/// <reference types="jest" />

import { describe, expect, afterEach, beforeEach, it, jest } from "@jest/globals";
import request from "supertest";
import { prisma } from "../src/config/database";
import { createAccessToken } from "../src/modules/auth/auth.tokens";
import { createApp } from "../src/app";
import { getBudgetUtilization, getCashFlow, getDashboard, getExpenseBreakdown, getIncomeBreakdown, getInvestmentHistory, getNetWorth, getSavingsHistory } from "../src/modules/dashboard/dashboard.controller";
import { budgetPerformance, categoryTrends, fixedExpenseRatio, incomeGrowth, savingsRate, spendingAnomalies, spendingTrends } from "../src/modules/analytics/analytics.controller";
import { categoryReport, cashFlowReport, monthlyReport, netWorthReport, yearlyReport } from "../src/modules/reports/reports.controller";
import type { Request, Response } from "express";
import { currentNetWorth, netWorthHistory } from "../src/modules/net-worth/net-worth.controller";
import { listNotifications, listUnreadNotifications, markAllNotificationsRead, markNotificationRead } from "../src/modules/notifications/notifications.controller";

const app = createApp();
const token = createAccessToken("user-id", "user@example.com");
const auth = { Authorization: `Bearer ${token}` };

function requestContext(query: Record<string, unknown> = {}, params: Record<string, string> = {}): Request {
  return { auth: { userId: "user-id", email: "user@example.com" }, query, params } as unknown as Request;
}
function responseContext(): Response {
  return { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis(), send: jest.fn().mockReturnThis() } as unknown as Response;
}

beforeEach(() => {
  jest.spyOn(prisma.loan, "findMany").mockResolvedValue([]);
  jest.spyOn(prisma.fixedExpense, "findMany").mockResolvedValue([]);
  jest.spyOn(prisma.transaction, "aggregate").mockResolvedValue({ _sum: { amount: null } } as never);
});

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
    jest.spyOn(prisma.incomeTransaction, "findMany").mockResolvedValue([]);
    await getIncomeBreakdown(req, res);
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

  it("covers all analytics functions", async () => {
    const req = requestContext();
    const res = responseContext();
    jest.spyOn(prisma.transaction, "findMany").mockResolvedValue([]);
    jest.spyOn(prisma.incomeTransaction, "findMany").mockResolvedValue([]);
    jest.spyOn(prisma, "$transaction").mockResolvedValue([{ _sum: { amount: null } }, { _sum: { amount: null } }] as never);
    await categoryTrends(req, res); await spendingTrends(req, res); await incomeGrowth(req, res); await spendingAnomalies(req, res); await savingsRate(req, res); await fixedExpenseRatio(req, res);
    expect(res.json).toHaveBeenCalled();
  });

  it("covers dedicated net-worth endpoints", async () => {
    const req = requestContext();
    const res = responseContext();
    jest.spyOn(prisma, "$transaction").mockResolvedValue([{ _sum: { amount: null } }, { _sum: { amount: null } }, { _sum: { amount: null } }] as never);
    jest.spyOn(prisma.account, "aggregate").mockResolvedValue({ _sum: { openingBalance: null } } as never);
    await currentNetWorth(req, res);
    jest.spyOn(prisma, "$transaction").mockResolvedValue([[], []] as never);
    await netWorthHistory(req, res);
    expect(res.json).toHaveBeenCalled();
  });

  it("covers notification operations", async () => {
    const req = requestContext({}, { id: "11111111-1111-4111-8111-111111111111" });
    const res = responseContext();
    const notification = { id: "11111111-1111-4111-8111-111111111111", userId: "user-id", title: "Alert", message: "Test", notificationType: "BUDGET_WARNING", referenceId: null, isRead: false, createdAt: new Date() };
    jest.spyOn(prisma.notification, "findMany").mockResolvedValue([notification]);
    jest.spyOn(prisma.notification, "findFirst").mockResolvedValue(notification);
    jest.spyOn(prisma.notification, "update").mockResolvedValue({ ...notification, isRead: true });
    jest.spyOn(prisma.notification, "updateMany").mockResolvedValue({ count: 1 });
    await listNotifications(req, res); await listUnreadNotifications(req, res); await markNotificationRead(req, res); await markAllNotificationsRead(req, res);
    expect(res.json).toHaveBeenCalled();
  });
});