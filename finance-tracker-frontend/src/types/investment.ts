export type InvestmentType =
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
  amount: number;
  contributionDate: string;
  notes?: string | null;
  account?: { id: string; name: string };
  createdAt: string;
}

export interface Investment {
  id: string;
  userId: string;
  name: string;
  investmentType: InvestmentType | string;
  totalInvested: number;
  targetAmount?: number | null;
  startDate: string;
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
  startDate: string;
  description?: string;
}

export interface AddInvestmentContributionInput {
  accountId: string;
  amount: number;
  contributionDate: string;
  notes?: string;
}
