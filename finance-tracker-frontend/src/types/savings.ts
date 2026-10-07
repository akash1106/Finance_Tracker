export type SavingsGoalStatus = "ACTIVE" | "COMPLETED" | "PAUSED" | "CANCELLED";

export interface SavingsContribution {
  id: string;
  savingsGoalId: string;
  accountId: string;
  amount: number | string;
  contributionDate: string;
  transactionId?: string;
  notes?: string | null;
  account?: { id: string; name: string; accountType?: string };
  createdAt: string;
}

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number | string;
  currentAmount: number | string;
  targetDate?: string | null;
  description?: string | null;
  status: SavingsGoalStatus | string;
  isActive?: boolean;
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

export interface UpdateSavingsGoalInput extends Partial<CreateSavingsGoalInput> {
  status?: SavingsGoalStatus;
}

export interface AddSavingsContributionInput {
  accountId: string;
  amount: number;
  contributionDate: string;
  notes?: string;
}
