export interface LoanPayment {
  id: string;
  loanId: string;
  accountId: string;
  amount: number;
  paymentDate: string;
  notes?: string | null;
  account?: { id: string; name: string };
  createdAt: string;
}

export interface Loan {
  id: string;
  userId: string;
  name: string;
  principal: number;
  remainingBalance: number;
  interestRate?: number | null;
  monthlyEmi: number;
  tenureMonths: number;
  startDate: string;
  endDate?: string | null;
  isActive: boolean;
  payments?: LoanPayment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateLoanInput {
  name: string;
  principal: number;
  interestRate?: number;
  monthlyEmi: number;
  tenureMonths: number;
  startDate: string;
  endDate?: string;
}

export interface RecordLoanPaymentInput {
  accountId: string;
  amount: number;
  paymentDate: string;
  notes?: string;
}
