export interface IncomeSource {
  id: string;
  userId: string;
  name: string;
  isSalary: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IncomeTransaction {
  id: string;
  userId: string;
  incomeSourceId: string;
  accountId: string;
  amount: number;
  receivedDate: string;
  description?: string | null;
  isRecurring: boolean;
  notes?: string | null;
  incomeSource?: IncomeSource;
  account?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface CreateIncomeInput {
  incomeSourceId?: string;
  sourceName?: string;
  isSalary?: boolean;
  accountId: string;
  amount: number;
  receivedDate: string;
  description?: string;
  notes?: string;
}

export interface UpdateIncomeInput {
  incomeSourceId?: string;
  accountId?: string;
  amount?: number;
  receivedDate?: string;
  description?: string;
  notes?: string;
}

export interface IncomeFilterParams {
  page?: number;
  limit?: number;
  incomeSourceId?: string;
  accountId?: string;
  startDate?: string;
  endDate?: string;
}
