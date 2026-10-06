export interface DashboardSummary {
  income?: number | string;
  expenses?: number | string;
  savings?: number | string;
  investments?: number | string;
  remaining?: number | string;
  netWorth?: number | string;
  totalBalance?: number | string;
  monthlyIncome?: number | string;
  monthlyExpenses?: number | string;
  monthlySavings?: number | string;
  totalInvestments?: number | string;
}

export interface CashFlowDataPoint {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

export interface CategoryBreakdownDataPoint {
  category: string;
  amount: number;
  percentage: number;
  color?: string;
}

export interface BudgetUtilizationDataPoint {
  category: string;
  allocated: number;
  spent: number;
  percentage: number;
}
