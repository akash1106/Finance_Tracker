import { apiGet, apiPost, apiPatch, apiDelete } from "./client";
import type {
  SavingsGoal,
  SavingsContribution,
  CreateSavingsGoalInput,
  AddSavingsContributionInput,
} from "@/types/savings";

export const savingsApi = {
  list: () => apiGet<SavingsGoal[]>("/savings-goals"),
  getById: (id: string) => apiGet<SavingsGoal>(`/savings-goals/${id}`),
  create: (data: CreateSavingsGoalInput) => apiPost<SavingsGoal>("/savings-goals", data),
  update: (id: string, data: Partial<CreateSavingsGoalInput>) =>
    apiPatch<SavingsGoal>(`/savings-goals/${id}`, data),
  deactivate: (id: string) => apiDelete<void>(`/savings-goals/${id}`),

  // Contributions
  listContributions: (goalId: string) =>
    apiGet<SavingsContribution[]>(`/savings-goals/${goalId}/contributions`),
  addContribution: (goalId: string, data: AddSavingsContributionInput) =>
    apiPost<SavingsContribution>(`/savings-goals/${goalId}/contributions`, data),
  deleteContribution: (goalId: string, contributionId: string) =>
    apiDelete<void>(`/savings-goals/${goalId}/contributions/${contributionId}`),
};
