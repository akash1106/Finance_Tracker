export type FixedExpenseFrequency = "WEEKLY" | "MONTHLY" | "YEARLY";

export interface FixedExpense {
  id: string;
  userId: string;
  name: string;
  amount: number | string;
  categoryId: string;
  subcategoryId: string;
  accountId: string;
  frequency: FixedExpenseFrequency;
  nextDueDate: string;
  startDate: string;
  endDate?: string | null;
  autoGenerate: boolean;
  isActive: boolean;
  description?: string | null;
  category?: { id: string; name: string };
  subcategory?: { id: string; name: string };
  account?: { id: string; name: string; accountType?: string };
  createdAt: string;
  updatedAt: string;
}

export interface CreateFixedExpenseInput {
  name: string;
  amount: number;
  categoryId: string;
  subcategoryId: string;
  accountId: string;
  frequency: FixedExpenseFrequency;
  nextDueDate: string;
  startDate: string;
  endDate?: string;
  autoGenerate?: boolean;
  description?: string;
}

export interface UpdateFixedExpenseInput extends Partial<CreateFixedExpenseInput> {
  isActive?: boolean;
}
