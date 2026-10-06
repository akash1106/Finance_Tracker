import { apiGet, apiPost, apiPatch, apiDelete } from "./client";
import type { FixedExpense, CreateFixedExpenseInput, UpdateFixedExpenseInput } from "@/types/fixed-expense";

export type { FixedExpense, CreateFixedExpenseInput, UpdateFixedExpenseInput };

export const fixedExpensesApi = {
  list: () => apiGet<FixedExpense[]>("/fixed-expenses"),
  getById: (id: string) => apiGet<FixedExpense>(`/fixed-expenses/${id}`),
  create: (data: CreateFixedExpenseInput) => apiPost<FixedExpense>("/fixed-expenses", data),
  update: (id: string, data: Partial<CreateFixedExpenseInput>) =>
    apiPatch<FixedExpense>(`/fixed-expenses/${id}`, data),
  deactivate: (id: string) => apiDelete<void>(`/fixed-expenses/${id}`),
  generate: (id: string) =>
    apiPost<{ transactionId: string; message: string }>(`/fixed-expenses/${id}/generate`),
};
