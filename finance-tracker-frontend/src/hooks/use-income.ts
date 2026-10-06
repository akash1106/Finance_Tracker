"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { incomeApi } from "@/lib/api/income.api";
import { queryKeys } from "@/lib/query/query-keys";
import type { CreateIncomeInput, UpdateIncomeInput, IncomeFilterParams } from "@/types/income";

export function useIncomeList(params?: IncomeFilterParams) {
  return useQuery({
    queryKey: queryKeys.income.list(params as Record<string, unknown>),
    queryFn: () => incomeApi.list(params),
  });
}

// Alias for convenience across dashboard/account pages
export const useIncome = useIncomeList;

export function useIncomeSources() {
  return useQuery({
    queryKey: queryKeys.income.sources(),
    queryFn: () => incomeApi.listSources(),
  });
}

export function useCreateIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateIncomeInput) => incomeApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.income.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all() });
      toast.success("Income logged successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to log income");
    },
  });
}

export function useUpdateIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateIncomeInput }) =>
      incomeApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.income.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all() });
      toast.success("Income updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update income");
    },
  });
}

export function useDeleteIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => incomeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.income.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all() });
      toast.success("Income deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete income");
    },
  });
}

export function useCreateIncomeSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, isSalary }: { name: string; isSalary?: boolean }) =>
      incomeApi.createSource(name, isSalary),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.income.sources() });
      toast.success("Income source created");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create income source");
    },
  });
}
