import { apiGet, apiGetPaginated, apiPost, apiPatch, apiDelete } from "./client";
import type {
  IncomeTransaction,
  IncomeSource,
  CreateIncomeInput,
  UpdateIncomeInput,
  IncomeFilterParams,
} from "@/types/income";

export const incomeApi = {
  list: (params?: IncomeFilterParams) =>
    apiGetPaginated<IncomeTransaction>("/income", { params }),
  getById: (id: string) => apiGet<IncomeTransaction>(`/income/${id}`),
  create: (data: CreateIncomeInput) => apiPost<IncomeTransaction>("/income", data),
  update: (id: string, data: UpdateIncomeInput) =>
    apiPatch<IncomeTransaction>(`/income/${id}`, data),
  delete: (id: string) => apiDelete<void>(`/income/${id}`),

  // Income sources
  listSources: () => apiGet<IncomeSource[]>("/income-sources"),
  createSource: (name: string, isSalary: boolean = false) =>
    apiPost<IncomeSource>("/income-sources", { name, isSalary }),
  deactivateSource: (id: string) => apiDelete<void>(`/income-sources/${id}`),
};
