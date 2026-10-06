import { apiGet, apiPost, apiPatch, apiDelete } from "./client";
import type { Account, CreateAccountInput, UpdateAccountInput } from "@/types/account";

export const accountsApi = {
  list: () => apiGet<Account[]>("/accounts"),
  getById: (id: string) => apiGet<Account>(`/accounts/${id}`),
  create: (data: CreateAccountInput) => apiPost<Account>("/accounts", data),
  update: (id: string, data: UpdateAccountInput) => apiPatch<Account>(`/accounts/${id}`, data),
  deactivate: (id: string) => apiDelete<void>(`/accounts/${id}`),
};
