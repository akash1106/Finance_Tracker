import { apiGet, apiGetPaginated, apiPost, apiPatch, apiDelete } from "./client";
import type {
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionFilterParams,
} from "@/types/transaction";

export const transactionsApi = {
  list: (params?: TransactionFilterParams & { from?: string; to?: string }) => {
    const queryParams = {
      ...params,
      ...(params?.startDate && !params?.from ? { from: params.startDate } : {}),
      ...(params?.endDate && !params?.to ? { to: params.endDate } : {}),
    };
    return apiGetPaginated<Transaction>("/transactions", { params: queryParams });
  },
  getById: (id: string) => apiGet<Transaction>(`/transactions/${id}`),
  create: (data: CreateTransactionInput) => apiPost<Transaction>("/transactions", data),
  update: (id: string, data: UpdateTransactionInput) =>
    apiPatch<Transaction>(`/transactions/${id}`, data),
  delete: (id: string) => apiDelete<void>(`/transactions/${id}`),
};
