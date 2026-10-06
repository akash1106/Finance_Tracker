import { apiGet } from "./client";

export interface AnalyticsQueryParams {
  year?: number;
  startDate?: string;
  endDate?: string;
}

export const analyticsApi = {
  getSpendingTrends: (params?: AnalyticsQueryParams) =>
    apiGet<unknown>("/analytics/spending-trends", { params }),
  getBudgetPerformance: (params?: AnalyticsQueryParams) =>
    apiGet<unknown>("/analytics/budget-performance", { params }),
  getCategoryTrends: (params?: AnalyticsQueryParams) =>
    apiGet<unknown>("/analytics/category-trends", { params }),
  getSavingsRate: (params?: AnalyticsQueryParams) =>
    apiGet<unknown>("/analytics/savings-rate", { params }),
  getFixedExpenseRatio: (params?: AnalyticsQueryParams) =>
    apiGet<unknown>("/analytics/fixed-expense-ratio", { params }),
  getIncomeGrowth: (params?: AnalyticsQueryParams) =>
    apiGet<unknown>("/analytics/income-growth", { params }),
  getSpendingAnomalies: (params?: AnalyticsQueryParams) =>
    apiGet<unknown>("/analytics/spending-anomalies", { params }),
};
