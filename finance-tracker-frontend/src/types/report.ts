export interface ReportQueryParams {
  [key: string]: unknown;
  year?: number;
  month?: number;
  from?: string;
  to?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
}

export interface MonthlyReportData {
  year: number;
  month: number;
  income: string | number;
  expenses: string | number;
  savings: string | number;
  investments: string | number;
  netCashFlow: string | number;
}

export interface YearlyReportMonthItem {
  month: number;
  income: string | number;
  expenses: string | number;
  savings: string | number;
  investments: string | number;
  netCashFlow: string | number;
}

export interface YearlyReportData {
  year: number;
  months: YearlyReportMonthItem[];
}

export interface CategoryReportItem {
  categoryId: string | null;
  category?: string;
  amount: string | number;
}

export interface NetWorthReportData {
  assets: string | number;
  liabilities: string | number;
  netWorth: string | number;
}

export interface CashFlowReportData {
  income: string | number;
  expenses: string | number;
  savings: string | number;
  investments: string | number;
  netCashFlow: string | number;
}
