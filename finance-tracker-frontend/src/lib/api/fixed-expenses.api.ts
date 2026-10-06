import { apiGet, apiPost, apiPatch, apiDelete } from "./client";

export interface FixedExpense {
  id: string;
  userId: string;
  name: string;
  amount: number;
  categoryId?: string | null;
  subcategoryId?: string | null;
  accountId: string;
  frequency: "MONTHLY" | "QUARTERLY" | "YEARLY" | string;
  startDate: string;
  nextDueDate: string;
  autoGenerate: boolean;
  isActive: boolean;
  category?: { id: string; name: string };
  subcategory?: { id: string; name: string };
  account?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface CreateFixedExpenseInput {
  name: string;
  amount: number;
  categoryId?: string;
  subcategoryId?: string;
  accountId: string;
  frequency: string;
  startDate: string;
  nextDueDate: string;
  autoGenerate?: boolean;
}

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
