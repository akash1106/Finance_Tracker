"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  recurringApi,
  type CreateRecurringTransactionInput,
  type RecurringTransaction,
} from "@/lib/api/recurring.api";
import { queryKeys } from "@/lib/query/query-keys";

export function useRecurringTransactions() {
  return useQuery({
    queryKey: queryKeys.recurring.all(),
    queryFn: () => recurringApi.list(),
  });
}

export function useRecurringTransaction(id: string) {
  return useQuery({
    queryKey: queryKeys.recurring.detail(id),
    queryFn: () => recurringApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreateRecurringTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRecurringTransactionInput) => recurringApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recurring.all() });
      toast.success("Recurring transaction rule created");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create recurring rule");
    },
  });
}

export function useUpdateRecurringTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateRecurringTransactionInput>;
    }) => recurringApi.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recurring.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.recurring.detail(variables.id) });
      toast.success("Recurring rule updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update recurring rule");
    },
  });
}

export function useDeactivateRecurringTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => recurringApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recurring.all() });
      toast.success("Recurring rule deactivated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to deactivate recurring rule");
    },
  });
}

export function useGenerateRecurringTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => recurringApi.generate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recurring.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all() });
      toast.success("Recurring transaction executed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to execute recurring rule");
    },
  });
}
