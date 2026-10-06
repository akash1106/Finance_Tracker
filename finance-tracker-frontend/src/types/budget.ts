export interface BudgetTemplateItem {
  id: string;
  budgetTemplateId: string;
  categoryId: string;
  percentage: number;
  category?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface BudgetTemplate {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  items: BudgetTemplateItem[];
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyBudgetItem {
  id: string;
  monthlyBudgetId: string;
  categoryId: string;
  allocatedAmount: number;
  spentAmount: number;
  category?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyBudget {
  id: string;
  userId: string;
  budgetTemplateId: string;
  incomeTransactionId: string;
  month: number;
  year: number;
  totalIncome: number;
  totalAllocated: number;
  totalSpent: number;
  budgetTemplate?: BudgetTemplate;
  items: MonthlyBudgetItem[];
  createdAt: string;
  updatedAt: string;
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
  month: number;
  year: number;
}
