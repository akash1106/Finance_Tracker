export interface DashboardSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  totalInvestments: number;
  netWorth: number;
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
