import { apiGet } from "./client";
import type {
  AnalyticsQueryParams,
  SpendingTrendItem,
  BudgetPerformanceItem,
  CategoryTrendItem,
  SavingsRateData,
  FixedExpenseRatioData,
  IncomeGrowthItem,
  SpendingAnomalyItem,
} from "@/types";

export type { AnalyticsQueryParams };

export const analyticsApi = {
  getSpendingTrends: (params?: AnalyticsQueryParams) =>
    apiGet<SpendingTrendItem[]>("/analytics/spending-trends", { params }),
  getBudgetPerformance: (params?: AnalyticsQueryParams) =>
    apiGet<BudgetPerformanceItem[]>("/analytics/budget-performance", { params }),
  getCategoryTrends: (params?: AnalyticsQueryParams) =>
    apiGet<CategoryTrendItem[]>("/analytics/category-trends", { params }),
  getSavingsRate: (params?: AnalyticsQueryParams) =>
    apiGet<SavingsRateData>("/analytics/savings-rate", { params }),
  getFixedExpenseRatio: (params?: AnalyticsQueryParams) =>
    apiGet<FixedExpenseRatioData>("/analytics/fixed-expense-ratio", { params }),
  getIncomeGrowth: (params?: AnalyticsQueryParams) =>
    apiGet<IncomeGrowthItem[]>("/analytics/income-growth", { params }),
  getSpendingAnomalies: (params?: AnalyticsQueryParams) =>
    apiGet<SpendingAnomalyItem[]>("/analytics/spending-anomalies", { params }),
};
