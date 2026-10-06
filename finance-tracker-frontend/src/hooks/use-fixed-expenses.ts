"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fixedExpensesApi, type CreateFixedExpenseInput, type FixedExpense } from "@/lib/api/fixed-expenses.api";
import { queryKeys } from "@/lib/query/query-keys";

export function useFixedExpenses() {
  return useQuery({
    queryKey: queryKeys.fixedExpenses.all(),
    queryFn: () => fixedExpensesApi.list(),
  });
}

export function useFixedExpense(id: string) {
  return useQuery({
    queryKey: queryKeys.fixedExpenses.detail(id),
    queryFn: () => fixedExpensesApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreateFixedExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFixedExpenseInput) => fixedExpensesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fixedExpenses.all() });
      toast.success("Fixed expense created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create fixed expense");
    },
  });
}

export function useUpdateFixedExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateFixedExpenseInput> }) =>
      fixedExpensesApi.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fixedExpenses.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.fixedExpenses.detail(variables.id) });
      toast.success("Fixed expense updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update fixed expense");
    },
  });
}

export function useDeactivateFixedExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => fixedExpensesApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fixedExpenses.all() });
      toast.success("Fixed expense deactivated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to deactivate fixed expense");
    },
  });
}

export function useGenerateFixedExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => fixedExpensesApi.generate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fixedExpenses.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all() });
      toast.success("Expense transaction generated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to generate transaction");
    },
  });
}
