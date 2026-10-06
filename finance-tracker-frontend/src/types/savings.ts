export interface SavingsContribution {
  id: string;
  savingsGoalId: string;
  accountId: string;
  amount: number;
  contributionDate: string;
  notes?: string | null;
  account?: { id: string; name: string };
  createdAt: string;
}

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string | null;
  description?: string | null;
  isActive: boolean;
  contributions?: SavingsContribution[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSavingsGoalInput {
  name: string;
  targetAmount: number;
  targetDate?: string;
  description?: string;
}

export interface AddSavingsContributionInput {
  accountId: string;
  amount: number;
  contributionDate: string;
  notes?: string;
}
