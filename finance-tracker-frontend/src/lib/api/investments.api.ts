import { apiGet, apiPost, apiPatch, apiDelete } from "./client";
import type {
  Investment,
  InvestmentContribution,
  CreateInvestmentInput,
  AddInvestmentContributionInput,
} from "@/types/investment";

export const investmentsApi = {
  list: () => apiGet<Investment[]>("/investments"),
  getById: (id: string) => apiGet<Investment>(`/investments/${id}`),
  create: (data: CreateInvestmentInput) => apiPost<Investment>("/investments", data),
  update: (id: string, data: Partial<CreateInvestmentInput>) =>
    apiPatch<Investment>(`/investments/${id}`, data),
  deactivate: (id: string) => apiDelete<void>(`/investments/${id}`),

  // Contributions
  listContributions: (investmentId: string) =>
    apiGet<InvestmentContribution[]>(`/investments/${investmentId}/contributions`),
  addContribution: (investmentId: string, data: AddInvestmentContributionInput) =>
    apiPost<InvestmentContribution>(`/investments/${investmentId}/contributions`, data),
  deleteContribution: (investmentId: string, contributionId: string) =>
    apiDelete<void>(`/investments/${investmentId}/contributions/${contributionId}`),
};
