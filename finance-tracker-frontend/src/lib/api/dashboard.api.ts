import { apiGet } from "./client";
import type {
  DashboardSummary,
  CashFlowDataPoint,
  CategoryBreakdownDataPoint,
  BudgetUtilizationDataPoint,
} from "@/types/dashboard";

export interface DashboardQueryParams {
  startDate?: string;
  endDate?: string;
}

export const dashboardApi = {
  getSummary: (params?: DashboardQueryParams) =>
    apiGet<DashboardSummary>("/dashboard", { params }),
  getCashFlow: (params?: DashboardQueryParams) =>
    apiGet<CashFlowDataPoint[]>("/dashboard/cash-flow", { params }),
  getExpenseBreakdown: (params?: DashboardQueryParams) =>
    apiGet<CategoryBreakdownDataPoint[]>("/dashboard/expense-breakdown", { params }),
  getIncomeBreakdown: (params?: DashboardQueryParams) =>
    apiGet<CategoryBreakdownDataPoint[]>("/dashboard/income-breakdown", { params }),
  getBudgetUtilization: (params?: DashboardQueryParams) =>
    apiGet<BudgetUtilizationDataPoint[]>("/dashboard/budget-utilization", { params }),
  getSavingsHistory: () =>
    apiGet<unknown[]>("/dashboard/savings"),
  getInvestmentHistory: () =>
    apiGet<unknown[]>("/dashboard/investments"),
  getNetWorth: (params?: DashboardQueryParams) =>
    apiGet<unknown>("/dashboard/net-worth", { params }),
};
