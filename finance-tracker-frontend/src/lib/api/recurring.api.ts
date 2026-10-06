import { apiGet, apiPost, apiPatch, apiDelete } from "./client";

export interface RecurringTransaction {
  id: string;
  userId: string;
  name: string;
  transactionType: "INCOME" | "EXPENSE" | "TRANSFER" | string;
  amount: number;
  categoryId?: string | null;
  subcategoryId?: string | null;
  accountId: string;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | string;
  startDate: string;
  endDate?: string | null;
  nextExecutionDate: string;
  isActive: boolean;
  category?: { id: string; name: string };
  account?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecurringInput {
  name: string;
  transactionType: string;
  amount: number;
  categoryId?: string;
  subcategoryId?: string;
  accountId: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  nextExecutionDate: string;
}

export const recurringApi = {
  list: () => apiGet<RecurringTransaction[]>("/recurring-transactions"),
  getById: (id: string) => apiGet<RecurringTransaction>(`/recurring-transactions/${id}`),
  create: (data: CreateRecurringInput) =>
    apiPost<RecurringTransaction>("/recurring-transactions", data),
  update: (id: string, data: Partial<CreateRecurringInput>) =>
    apiPatch<RecurringTransaction>(`/recurring-transactions/${id}`, data),
  deactivate: (id: string) => apiDelete<void>(`/recurring-transactions/${id}`),
  generate: (id: string) =>
    apiPost<{ message: string }>(`/recurring-transactions/${id}/generate`),
};
