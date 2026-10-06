import { apiGet, apiGetPaginated, apiPost, apiPatch, apiDelete } from "./client";
import type {
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionFilterParams,
} from "@/types/transaction";

export const transactionsApi = {
  list: (params?: TransactionFilterParams) =>
    apiGetPaginated<Transaction>("/transactions", { params }),
  getById: (id: string) => apiGet<Transaction>(`/transactions/${id}`),
  create: (data: CreateTransactionInput) => apiPost<Transaction>("/transactions", data),
  update: (id: string, data: UpdateTransactionInput) =>
    apiPatch<Transaction>(`/transactions/${id}`, data),
  delete: (id: string) => apiDelete<void>(`/transactions/${id}`),
};
