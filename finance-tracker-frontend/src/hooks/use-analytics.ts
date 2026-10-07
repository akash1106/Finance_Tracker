"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsApi, type AnalyticsQueryParams } from "@/lib/api/analytics.api";
import { queryKeys } from "@/lib/query/query-keys";

export function useSpendingTrends(params?: AnalyticsQueryParams) {
  return useQuery({
    queryKey: queryKeys.analytics.spendingTrends(params),
    queryFn: () => analyticsApi.getSpendingTrends(params),
  });
}

export function useBudgetPerformance(params?: AnalyticsQueryParams) {
  return useQuery({
    queryKey: queryKeys.analytics.budgetPerformance(params),
    queryFn: () => analyticsApi.getBudgetPerformance(params),
  });
}

export function useCategoryTrends(params?: AnalyticsQueryParams) {
  return useQuery({
    queryKey: queryKeys.analytics.categoryTrends(params),
    queryFn: () => analyticsApi.getCategoryTrends(params),
  });
}

export function useSavingsRate(params?: AnalyticsQueryParams) {
  return useQuery({
    queryKey: queryKeys.analytics.savingsRate(params),
    queryFn: () => analyticsApi.getSavingsRate(params),
  });
}

export function useFixedExpenseRatio(params?: AnalyticsQueryParams) {
  return useQuery({
    queryKey: queryKeys.analytics.fixedExpenseRatio(params),
    queryFn: () => analyticsApi.getFixedExpenseRatio(params),
  });
}

export function useIncomeGrowth(params?: AnalyticsQueryParams) {
  return useQuery({
    queryKey: queryKeys.analytics.incomeGrowth(params),
    queryFn: () => analyticsApi.getIncomeGrowth(params),
  });
}

export function useSpendingAnomalies(params?: AnalyticsQueryParams) {
  return useQuery({
    queryKey: queryKeys.analytics.spendingAnomalies(params),
    queryFn: () => analyticsApi.getSpendingAnomalies(params),
  });
}
