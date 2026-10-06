export type RecurringFrequency = "WEEKLY" | "MONTHLY" | "YEARLY";
export type RecurringType =
  | "EXPENSE"
  | "TRANSFER"
  | "SAVING"
  | "INVESTMENT"
  | "LOAN_PAYMENT";
export type RecurringPaymentMethod =
  | "CASH"
  | "UPI"
  | "DEBIT_CARD"
  | "BANK_TRANSFER"
  | "OTHER";

export interface RecurringTransaction {
  id: string;
  userId: string;
  name: string;
  transactionType: RecurringType | string;
  amount: number | string;
  categoryId?: string | null;
  subcategoryId?: string | null;
  accountId: string;
  paymentMethod?: RecurringPaymentMethod | string | null;
  frequency: RecurringFrequency | string;
  startDate: string;
  endDate?: string | null;
  nextRunDate: string;
  isActive: boolean;
  notes?: string | null;
  category?: { id: string; name: string };
  subcategory?: { id: string; name: string };
  account?: { id: string; name: string; accountType?: string };
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecurringTransactionInput {
  name: string;
  transactionType: RecurringType | string;
  amount: number;
  categoryId?: string;
  subcategoryId?: string;
  accountId: string;
  paymentMethod?: RecurringPaymentMethod | string;
  frequency: RecurringFrequency | string;
  startDate: string;
  endDate?: string;
  nextRunDate: string;
  notes?: string;
}

export interface UpdateRecurringTransactionInput
  extends Partial<CreateRecurringTransactionInput> {
  isActive?: boolean;
}
