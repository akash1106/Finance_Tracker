"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { budgetApi } from "@/lib/api/budget.api";
import { queryKeys } from "@/lib/query/query-keys";
import type { CreateBudgetTemplateInput, GenerateBudgetInput } from "@/types/budget";

export function useMonthlyBudgets(params?: { year?: number; month?: number }) {
  return useQuery({
    queryKey: queryKeys.budgets.list(params),
    queryFn: () => budgetApi.list(params),
  });
}

export function useBudgetDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.budgets.detail(id),
    queryFn: () => budgetApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useBudgetSummary(id: string) {
  return useQuery({
    queryKey: queryKeys.budgets.summary(id),
    queryFn: () => budgetApi.getSummary(id),
    enabled: Boolean(id),
  });
}

export function useBudgetTemplates() {
  return useQuery({
    queryKey: queryKeys.budgets.templates(),
    queryFn: () => budgetApi.listTemplates(),
  });
}

export function useGenerateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GenerateBudgetInput) => budgetApi.generate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all() });
      toast.success("Monthly budget generated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to generate monthly budget");
    },
  });
}

export function useCreateBudgetTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBudgetTemplateInput) => budgetApi.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.templates() });
      toast.success("Budget allocation template saved");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save budget template");
    },
  });
}
