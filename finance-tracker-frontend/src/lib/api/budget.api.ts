import { apiGet, apiPost, apiPatch, apiDelete } from "./client";
import type {
  BudgetTemplate,
  MonthlyBudget,
  MonthlyBudgetItem,
  CreateBudgetTemplateInput,
  GenerateBudgetInput,
} from "@/types/budget";

export const budgetApi = {
  // Monthly budgets
  list: (params?: { year?: number; month?: number }) =>
    apiGet<MonthlyBudget[]>("/budgets", { params }),
  getById: (id: string) => apiGet<MonthlyBudget>(`/budgets/${id}`),
  getSummary: (id: string) => apiGet<Record<string, unknown>>(`/budgets/${id}/summary`),
  getItems: (id: string) => apiGet<MonthlyBudgetItem[]>(`/budgets/${id}/items`),
  generate: (data: GenerateBudgetInput) => apiPost<MonthlyBudget>("/budgets/generate", data),

  // Templates
  listTemplates: () => apiGet<BudgetTemplate[]>("/budget-templates"),
  getTemplateById: (id: string) => apiGet<BudgetTemplate>(`/budget-templates/${id}`),
  createTemplate: (data: CreateBudgetTemplateInput) =>
    apiPost<BudgetTemplate>("/budget-templates", data),
  updateTemplate: (id: string, data: Partial<CreateBudgetTemplateInput>) =>
    apiPatch<BudgetTemplate>(`/budget-templates/${id}`, data),
  deactivateTemplate: (id: string) => apiDelete<void>(`/budget-templates/${id}`),
  validateTemplate: (id: string) =>
    apiPost<{ isValid: boolean; totalPercentage: number; message: string }>(
      `/budget-templates/${id}/validate`
    ),
};
