import { apiGet, apiPost, apiPatch, apiDelete } from "./client";
import type {
  BudgetTemplate,
  BudgetTemplateItem,
  MonthlyBudget,
  MonthlyBudgetItem,
  BudgetSummaryData,
  CreateBudgetTemplateInput,
  GenerateBudgetInput,
} from "@/types/budget";

export const budgetApi = {
  // Monthly budgets
  list: (params?: { year?: number; month?: number }) =>
    apiGet<MonthlyBudget[]>("/budgets", { params }),
  getById: (id: string) => apiGet<MonthlyBudget>(`/budgets/${id}`),
  getSummary: (id: string) => apiGet<BudgetSummaryData>(`/budgets/${id}/summary`),
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
  addTemplateItem: (templateId: string, data: { categoryId: string; percentage: number }) =>
    apiPost<BudgetTemplateItem>(`/budget-templates/${templateId}/items`, data),
  updateTemplateItem: (
    templateId: string,
    itemId: string,
    data: { percentage: number }
  ) => apiPatch<BudgetTemplateItem>(`/budget-templates/${templateId}/items/${itemId}`, data),
  deleteTemplateItem: (templateId: string, itemId: string) =>
    apiDelete<void>(`/budget-templates/${templateId}/items/${itemId}`),
};
