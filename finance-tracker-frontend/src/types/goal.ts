export interface FinancialGoalContribution {
  id: string;
  financialGoalId: string;
  accountId: string;
  amount: number;
  contributionDate: string;
  notes?: string | null;
  account?: { id: string; name: string };
  createdAt: string;
}

export interface FinancialGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string | null;
  description?: string | null;
  isActive: boolean;
  contributions?: FinancialGoalContribution[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateFinancialGoalInput {
  name: string;
  targetAmount: number;
  targetDate?: string;
  description?: string;
}

export interface AddGoalContributionInput {
  accountId: string;
  amount: number;
  contributionDate: string;
  notes?: string;
}
