export type AccountType = "SAVINGS" | "CHECKING" | "CASH" | "CREDIT_CARD" | "INVESTMENT";

export interface Account {
  id: string;
  userId: string;
  name: string;
  accountType: AccountType | string;
  openingBalance: number | string;
  balance?: number | string;
  currentBalance?: number | string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountInput {
  name: string;
  accountType: AccountType | string;
  openingBalance: number;
}

export interface UpdateAccountInput {
  name?: string;
  accountType?: AccountType | string;
  openingBalance?: number;
  isActive?: boolean;
}
