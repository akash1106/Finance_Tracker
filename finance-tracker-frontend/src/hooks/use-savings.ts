"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { savingsApi } from "@/lib/api/savings.api";
import { queryKeys } from "@/lib/query/query-keys";
import type {
  CreateSavingsGoalInput,
  UpdateSavingsGoalInput,
  AddSavingsContributionInput,
} from "@/types/savings";

export function useSavingsGoals() {
  return useQuery({
    queryKey: queryKeys.savings.all(),
    queryFn: () => savingsApi.list(),
  });
}

export function useSavingsGoal(id: string) {
  return useQuery({
    queryKey: queryKeys.savings.detail(id),
    queryFn: () => savingsApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useSavingsContributions(goalId: string) {
  return useQuery({
    queryKey: queryKeys.savings.contributions(goalId),
    queryFn: () => savingsApi.listContributions(goalId),
    enabled: Boolean(goalId),
  });
}

export function useCreateSavingsGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSavingsGoalInput) => savingsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savings.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all() });
      toast.success("Savings goal created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create savings goal");
    },
  });
}

export function useUpdateSavingsGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSavingsGoalInput }) =>
      savingsApi.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savings.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.savings.detail(variables.id) });
      toast.success("Savings goal updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update savings goal");
    },
  });
}

export function useDeactivateSavingsGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => savingsApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savings.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all() });
      toast.success("Savings goal archived");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to archive savings goal");
    },
  });
}

export function useAddSavingsContribution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ goalId, data }: { goalId: string; data: AddSavingsContributionInput }) =>
      savingsApi.addContribution(goalId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savings.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.savings.detail(variables.goalId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.savings.contributions(variables.goalId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all() });
      toast.success("Savings contribution recorded");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to record contribution");
    },
  });
}

export function useDeleteSavingsContribution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ goalId, contributionId }: { goalId: string; contributionId: string }) =>
      savingsApi.deleteContribution(goalId, contributionId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savings.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.savings.detail(variables.goalId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.savings.contributions(variables.goalId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all() });
      toast.success("Contribution removed and balance reverted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove contribution");
    },
  });
}
