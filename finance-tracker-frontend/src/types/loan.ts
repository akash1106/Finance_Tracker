export type LoanStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";

export interface LoanPayment {
  id: string;
  loanId: string;
  accountId: string;
  amount: number | string;
  paymentDate: string;
  transactionId?: string;
  notes?: string | null;
  account?: { id: string; name: string; accountType?: string };
  createdAt: string;
}

export interface Loan {
  id: string;
  userId: string;
  name: string;
  principalAmount: number | string;
  principal?: number | string; // Alias
  interestRate?: number | string | null;
  emiAmount: number | string;
  monthlyEmi?: number | string; // Alias
  tenureMonths: number;
  startDate: string;
  endDate?: string | null;
  status: LoanStatus | string;
  isActive?: boolean;
  description?: string | null;
  paidAmount?: number | string;
  remainingPrincipal?: number | string;
  remainingBalance?: number | string; // Alias
  payments?: LoanPayment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateLoanInput {
  name: string;
  principalAmount: number;
  principal?: number;
  interestRate?: number;
  emiAmount: number;
  monthlyEmi?: number;
  tenureMonths: number;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface UpdateLoanInput extends Partial<CreateLoanInput> {
  status?: LoanStatus;
}

export interface RecordLoanPaymentInput {
  accountId: string;
  amount: number;
  paymentDate: string;
  notes?: string;
}
