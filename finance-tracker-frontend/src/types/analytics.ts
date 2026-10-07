export interface AnalyticsQueryParams {
  [key: string]: unknown;
  year?: number;
  month?: number;
  from?: string;
  to?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
}

export interface SpendingTrendItem {
  month: string;
  amount: string | number;
}

export interface BudgetPerformanceItem {
  budgetId: string;
  year?: number;
  month?: number;
  categoryId: string;
  categoryName?: string;
  categoryColor?: string;
  allocated: string | number;
  spent: string | number;
  variance: string | number;
}

export interface CategoryTrendItem {
  month: string;
  category: string;
  amount: string | number;
}

export interface SavingsRateData {
  income: string | number;
  savings: string | number;
  savingsRate: string | number;
}

export interface FixedExpenseRatioData {
  fixedExpenses: string | number;
  expenses: string | number;
  fixedExpenseRatio: string | number;
}

export interface IncomeGrowthItem {
  month: string;
  income: string | number;
  previousIncome: string | number;
  growth: string | number;
}

export interface SpendingAnomalyItem {
  month: string;
  amount: string | number;
  average: string | number;
}
