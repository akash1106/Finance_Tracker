"use client";

import { useQuery } from "@tanstack/react-query";
import { reportsApi, type ReportQueryParams } from "@/lib/api/reports.api";
import { queryKeys } from "@/lib/query/query-keys";

export function useMonthlyReport(params?: ReportQueryParams) {
  return useQuery({
    queryKey: queryKeys.reports.monthly(params),
    queryFn: () => reportsApi.getMonthlyReport(params),
    enabled: Boolean(params?.year && params?.month),
  });
}

export function useYearlyReport(params?: ReportQueryParams) {
  return useQuery({
    queryKey: queryKeys.reports.yearly(params),
    queryFn: () => reportsApi.getYearlyReport(params),
    enabled: Boolean(params?.year),
  });
}

export function useNetWorthReport(params?: ReportQueryParams) {
  return useQuery({
    queryKey: queryKeys.reports.netWorth(params),
    queryFn: () => reportsApi.getNetWorthReport(params),
  });
}

export function useCategoryReport(params?: ReportQueryParams) {
  return useQuery({
    queryKey: queryKeys.reports.category(params),
    queryFn: () => reportsApi.getCategoryReport(params),
  });
}

export function useCashFlowReport(params?: ReportQueryParams) {
  return useQuery({
    queryKey: queryKeys.reports.cashFlow(params),
    queryFn: () => reportsApi.getCashFlowReport(params),
  });
}
