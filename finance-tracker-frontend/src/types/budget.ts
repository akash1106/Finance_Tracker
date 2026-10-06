export interface BudgetTemplateItem {
  id: string;
  budgetTemplateId: string;
  categoryId: string;
  percentage: number | string;
  category?: { id: string; name: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface BudgetTemplate {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  items: BudgetTemplateItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface MonthlyBudgetItem {
  id: string;
  monthlyBudgetId: string;
  categoryId: string;
  allocatedAmount: number | string;
  spentAmount: number | string;
  percentage?: number | string;
  remaining?: number | string;
  category?: { id: string; name: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface MonthlyBudget {
  id: string;
  userId: string;
  budgetTemplateId: string;
  incomeTransactionId: string;
  month: number;
  year: number;
  allocatedAmount: number | string;
  totalIncome?: number | string;
  totalAllocated?: number | string;
  totalSpent?: number | string;
  budgetTemplate?: BudgetTemplate;
  incomeTransaction?: {
    id: string;
    amount: number | string;
    receivedDate: string;
    incomeSource?: { id: string; name: string; isSalary?: boolean };
  };
  items: MonthlyBudgetItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BudgetSummaryData {
  allocated: string;
  spent: string;
  remaining: string;
  percentageUsed: string;
  status: "NORMAL" | "WARNING" | "EXCEEDED";
  items: MonthlyBudgetItem[];
}

export interface CreateBudgetTemplateInput {
  name: string;
  description?: string;
  isActive?: boolean;
  items: { categoryId: string; percentage: number }[];
}

export interface GenerateBudgetInput {
  incomeTransactionId: string;
  budgetTemplateId: string;
  month?: number;
  year?: number;
}
