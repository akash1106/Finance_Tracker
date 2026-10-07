import { apiGet, apiPost, apiPatch, apiDelete } from "./client";
import type {
  Loan,
  LoanPayment,
  CreateLoanInput,
  UpdateLoanInput,
  RecordLoanPaymentInput,
} from "@/types/loan";

export const loansApi = {
  list: () => apiGet<Loan[]>("/loans"),
  getById: (id: string) => apiGet<Loan>(`/loans/${id}`),
  create: (data: CreateLoanInput) => apiPost<Loan>("/loans", data),
  update: (id: string, data: UpdateLoanInput) => apiPatch<Loan>(`/loans/${id}`, data),
  deactivate: (id: string) => apiDelete<void>(`/loans/${id}`),

  // Payments
  listPayments: (loanId: string) => apiGet<LoanPayment[]>(`/loans/${loanId}/payments`),
  recordPayment: (loanId: string, data: RecordLoanPaymentInput) =>
    apiPost<LoanPayment>(`/loans/${loanId}/payments`, data),
  deletePayment: (loanId: string, paymentId: string) =>
    apiDelete<void>(`/loans/${loanId}/payments/${paymentId}`),
};
