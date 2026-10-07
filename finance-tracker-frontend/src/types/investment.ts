export type InvestmentType =
  | "MUTUAL_FUND"
  | "MUTUAL_FUNDS"
  | "STOCKS"
  | "GOLD"
  | "FD"
  | "RD"
  | "CRYPTO"
  | "REAL_ESTATE"
  | "OTHER";

export interface InvestmentContribution {
  id: string;
  investmentId: string;
  accountId: string;
  amount: number | string;
  investmentDate: string;
  transactionId?: string;
  notes?: string | null;
  account?: { id: string; name: string; accountType?: string };
  createdAt: string;
}

export interface Investment {
  id: string;
  userId: string;
  name: string;
  investmentType: InvestmentType | string;
  totalInvested?: number | string;
  totalContributed?: number | string;
  targetAmount?: number | string | null;
  startDate?: string | null;
  description?: string | null;
  isActive: boolean;
  contributions?: InvestmentContribution[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvestmentInput {
  name: string;
  investmentType: InvestmentType | string;
  targetAmount?: number;
  startDate?: string;
  description?: string;
}

export interface UpdateInvestmentInput extends Partial<CreateInvestmentInput> {
  isActive?: boolean;
}

export interface AddInvestmentContributionInput {
  accountId: string;
  amount: number;
  investmentDate: string;
  notes?: string;
}
