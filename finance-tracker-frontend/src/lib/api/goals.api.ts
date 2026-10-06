import { apiGet, apiPost, apiPatch, apiDelete } from "./client";
import type {
  FinancialGoal,
  FinancialGoalContribution,
  CreateFinancialGoalInput,
  AddGoalContributionInput,
} from "@/types/goal";

export const goalsApi = {
  list: () => apiGet<FinancialGoal[]>("/financial-goals"),
  getById: (id: string) => apiGet<FinancialGoal>(`/financial-goals/${id}`),
  create: (data: CreateFinancialGoalInput) => apiPost<FinancialGoal>("/financial-goals", data),
  update: (id: string, data: Partial<CreateFinancialGoalInput>) =>
    apiPatch<FinancialGoal>(`/financial-goals/${id}`, data),
  deactivate: (id: string) => apiDelete<void>(`/financial-goals/${id}`),

  // Contributions
  listContributions: (goalId: string) =>
    apiGet<FinancialGoalContribution[]>(`/financial-goals/${goalId}/contributions`),
  addContribution: (goalId: string, data: AddGoalContributionInput) =>
    apiPost<FinancialGoalContribution>(`/financial-goals/${goalId}/contributions`, data),
  deleteContribution: (goalId: string, contributionId: string) =>
    apiDelete<void>(`/financial-goals/${goalId}/contributions/${contributionId}`),
};
