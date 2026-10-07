"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { loansApi } from "@/lib/api/loans.api";
import { queryKeys } from "@/lib/query/query-keys";
import type {
  CreateLoanInput,
  UpdateLoanInput,
  RecordLoanPaymentInput,
} from "@/types/loan";

export function useLoans() {
  return useQuery({
    queryKey: queryKeys.loans.all(),
    queryFn: () => loansApi.list(),
  });
}

export function useLoan(id: string) {
  return useQuery({
    queryKey: queryKeys.loans.detail(id),
    queryFn: () => loansApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useLoanPayments(loanId: string) {
  return useQuery({
    queryKey: queryKeys.loans.payments(loanId),
    queryFn: () => loansApi.listPayments(loanId),
    enabled: Boolean(loanId),
  });
}

export function useCreateLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLoanInput) => loansApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all() });
      toast.success("Loan liability added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create loan liability");
    },
  });
}

export function useUpdateLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLoanInput }) =>
      loansApi.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.detail(variables.id) });
      toast.success("Loan updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update loan");
    },
  });
}

export function useDeactivateLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => loansApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all() });
      toast.success("Loan archived successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to archive loan");
    },
  });
}

export function useRecordLoanPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      loanId,
      data,
    }: {
      loanId: string;
      data: RecordLoanPaymentInput;
    }) => loansApi.recordPayment(loanId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.detail(variables.loanId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.payments(variables.loanId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all() });
      toast.success("Loan payment recorded successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to record loan payment");
    },
  });
}

export function useDeleteLoanPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      loanId,
      paymentId,
    }: {
      loanId: string;
      paymentId: string;
    }) => loansApi.deletePayment(loanId, paymentId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.detail(variables.loanId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.payments(variables.loanId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all() });
      toast.success("Loan payment removed and balance reverted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove loan payment");
    },
  });
}
