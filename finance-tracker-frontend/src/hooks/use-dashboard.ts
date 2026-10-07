"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi, type DashboardQueryParams } from "@/lib/api/dashboard.api";
import { queryKeys } from "@/lib/query/query-keys";

export function useDashboardSummary(params?: DashboardQueryParams) {
  return useQuery({
    queryKey: queryKeys.dashboard.summary(params as Record<string, unknown>),
    queryFn: () => dashboardApi.getSummary(params),
  });
}

export function useCashFlow(params?: DashboardQueryParams) {
  return useQuery({
    queryKey: queryKeys.dashboard.cashFlow(params as Record<string, unknown>),
    queryFn: () => dashboardApi.getCashFlow(params),
  });
}

export function useExpenseBreakdown(params?: DashboardQueryParams) {
  return useQuery({
    queryKey: queryKeys.dashboard.expenseBreakdown(params as Record<string, unknown>),
    queryFn: () => dashboardApi.getExpenseBreakdown(params),
  });
}

export function useIncomeBreakdown(params?: DashboardQueryParams) {
  return useQuery({
    queryKey: queryKeys.dashboard.incomeBreakdown(params as Record<string, unknown>),
    queryFn: () => dashboardApi.getIncomeBreakdown(params),
  });
}

export function useBudgetUtilization(params?: DashboardQueryParams) {
  return useQuery({
    queryKey: queryKeys.dashboard.budgetUtilization(params as Record<string, unknown>),
    queryFn: () => dashboardApi.getBudgetUtilization(params),
  });
}

export function useNetWorth(params?: DashboardQueryParams) {
  return useQuery({
    queryKey: queryKeys.dashboard.netWorth(params as Record<string, unknown>),
    queryFn: () => dashboardApi.getNetWorth(params),
  });
}

export function useSavingsHistory() {
  return useQuery({
    queryKey: queryKeys.dashboard.savings(),
    queryFn: () => dashboardApi.getSavingsHistory(),
  });
}

