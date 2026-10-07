"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { investmentsApi } from "@/lib/api/investments.api";
import { queryKeys } from "@/lib/query/query-keys";
import type {
  CreateInvestmentInput,
  UpdateInvestmentInput,
  AddInvestmentContributionInput,
} from "@/types/investment";

export function useInvestments() {
  return useQuery({
    queryKey: queryKeys.investments.all(),
    queryFn: () => investmentsApi.list(),
  });
}

export function useInvestment(id: string) {
  return useQuery({
    queryKey: queryKeys.investments.detail(id),
    queryFn: () => investmentsApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useInvestmentContributions(investmentId: string) {
  return useQuery({
    queryKey: queryKeys.investments.contributions(investmentId),
    queryFn: () => investmentsApi.listContributions(investmentId),
    enabled: Boolean(investmentId),
  });
}

export function useCreateInvestment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInvestmentInput) => investmentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.investments.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all() });
      toast.success("Investment asset added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create investment asset");
    },
  });
}

export function useUpdateInvestment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInvestmentInput }) =>
      investmentsApi.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.investments.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.investments.detail(variables.id) });
      toast.success("Investment asset updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update investment asset");
    },
  });
}

export function useDeactivateInvestment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => investmentsApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.investments.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all() });
      toast.success("Investment asset archived");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to archive investment asset");
    },
  });
}

export function useAddInvestmentContribution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      investmentId,
      data,
    }: {
      investmentId: string;
      data: AddInvestmentContributionInput;
    }) => investmentsApi.addContribution(investmentId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.investments.all() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.investments.detail(variables.investmentId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.investments.contributions(variables.investmentId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all() });
      toast.success("Investment contribution recorded");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to record contribution");
    },
  });
}

export function useDeleteInvestmentContribution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      investmentId,
      contributionId,
    }: {
      investmentId: string;
      contributionId: string;
    }) => investmentsApi.deleteContribution(investmentId, contributionId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.investments.all() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.investments.detail(variables.investmentId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.investments.contributions(variables.investmentId),
      });
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
