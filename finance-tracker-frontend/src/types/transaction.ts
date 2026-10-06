export type TransactionType = "EXPENSE" | "INCOME" | "TRANSFER";
export type PaymentMethod = "UPI" | "CARD" | "NET_BANKING" | "CASH" | "OTHER";

export interface Transaction {
  id: string;
  userId: string;
  transactionType: TransactionType | string;
  amount: number;
  categoryId?: string | null;
  subcategoryId?: string | null;
  accountId: string;
  transactionDate: string;
  paymentMethod?: PaymentMethod | string | null;
  description?: string | null;
  notes?: string | null;
  account?: { id: string; name: string };
  category?: { id: string; name: string };
  subcategory?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionInput {
  transactionType: TransactionType | string;
  amount: number;
  categoryId?: string;
  subcategoryId?: string;
  accountId: string;
  transactionDate: string;
  paymentMethod?: PaymentMethod | string;
  description?: string;
  notes?: string;
}

export interface UpdateTransactionInput {
  transactionType?: TransactionType | string;
  amount?: number;
  categoryId?: string;
  subcategoryId?: string;
  accountId?: string;
  transactionDate?: string;
  paymentMethod?: PaymentMethod | string;
  description?: string;
  notes?: string;
}

export interface TransactionFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  transactionType?: string;
  categoryId?: string;
  accountId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
