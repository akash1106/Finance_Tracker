import { apiGet, apiPost, apiPatch, apiDelete } from "./client";
import type {
  RecurringTransaction,
  CreateRecurringTransactionInput,
  UpdateRecurringTransactionInput,
} from "@/types/recurring";

export type {
  RecurringTransaction,
  CreateRecurringTransactionInput,
  UpdateRecurringTransactionInput,
};

export const recurringApi = {
  list: () => apiGet<RecurringTransaction[]>("/recurring-transactions"),
  getById: (id: string) => apiGet<RecurringTransaction>(`/recurring-transactions/${id}`),
  create: (data: CreateRecurringTransactionInput) =>
    apiPost<RecurringTransaction>("/recurring-transactions", data),
  update: (id: string, data: Partial<CreateRecurringTransactionInput>) =>
    apiPatch<RecurringTransaction>(`/recurring-transactions/${id}`, data),
  deactivate: (id: string) => apiDelete<void>(`/recurring-transactions/${id}`),
  generate: (id: string) =>
    apiPost<{ message: string }>(`/recurring-transactions/${id}/generate`),
};
