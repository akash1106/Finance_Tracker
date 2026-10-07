/**
 * Centralized query key factory for predictable cache invalidation and query deduplication.
 */
export const queryKeys = {
  auth: {
    me: () => ["auth", "me"] as const,
  },
  accounts: {
    all: () => ["accounts"] as const,
    detail: (id: string) => ["accounts", id] as const,
  },
  categories: {
    all: (type?: string) => ["categories", { type }] as const,
    detail: (id: string) => ["categories", id] as const,
    subcategories: (categoryId: string) =>
      ["categories", categoryId, "subcategories"] as const,
  },
  transactions: {
    all: () => ["transactions"] as const,
    list: (params?: Record<string, unknown>) =>
      ["transactions", "list", params] as const,
    detail: (id: string) => ["transactions", id] as const,
  },
  income: {
    all: () => ["income"] as const,
    list: (params?: Record<string, unknown>) => ["income", "list", params] as const,
    detail: (id: string) => ["income", id] as const,
    sources: () => ["income", "sources"] as const,
  },
  budgets: {
    all: () => ["budgets"] as const,
    list: (params?: Record<string, unknown>) => ["budgets", "list", params] as const,
    detail: (id: string) => ["budgets", id] as const,
    summary: (id: string) => ["budgets", id, "summary"] as const,
    items: (id: string) => ["budgets", id, "items"] as const,
    templates: () => ["budget-templates"] as const,
    templateDetail: (id: string) => ["budget-templates", id] as const,
  },
  fixedExpenses: {
    all: () => ["fixed-expenses"] as const,
    detail: (id: string) => ["fixed-expenses", id] as const,
  },
  recurring: {
    all: () => ["recurring-transactions"] as const,
    detail: (id: string) => ["recurring-transactions", id] as const,
  },
  savings: {
    all: () => ["savings-goals"] as const,
    detail: (id: string) => ["savings-goals", id] as const,
    contributions: (id: string) =>
      ["savings-goals", id, "contributions"] as const,
  },
  investments: {
    all: () => ["investments"] as const,
    detail: (id: string) => ["investments", id] as const,
    contributions: (id: string) =>
      ["investments", id, "contributions"] as const,
  },
  loans: {
    all: () => ["loans"] as const,
    detail: (id: string) => ["loans", id] as const,
    payments: (id: string) => ["loans", id, "payments"] as const,
  },
  goals: {
    all: () => ["financial-goals"] as const,
    detail: (id: string) => ["financial-goals", id] as const,
    contributions: (id: string) =>
      ["financial-goals", id, "contributions"] as const,
  },
  dashboard: {
    all: () => ["dashboard"] as const,
    summary: (params?: Record<string, unknown>) =>
      ["dashboard", "summary", params] as const,
    cashFlow: (params?: Record<string, unknown>) =>
      ["dashboard", "cashFlow", params] as const,
    expenseBreakdown: (params?: Record<string, unknown>) =>
      ["dashboard", "expenseBreakdown", params] as const,
    incomeBreakdown: (params?: Record<string, unknown>) =>
      ["dashboard", "incomeBreakdown", params] as const,
    budgetUtilization: (params?: Record<string, unknown>) =>
      ["dashboard", "budgetUtilization", params] as const,
    netWorth: (params?: Record<string, unknown>) =>
      ["dashboard", "netWorth", params] as const,
    savings: () => ["dashboard", "savings"] as const,
    investments: () => ["dashboard", "investments"] as const,
  },
  reports: {
    monthly: (params?: Record<string, unknown>) =>
      ["reports", "monthly", params] as const,
    yearly: (params?: Record<string, unknown>) =>
      ["reports", "yearly", params] as const,
    netWorth: (params?: Record<string, unknown>) =>
      ["reports", "netWorth", params] as const,
    category: (params?: Record<string, unknown>) =>
      ["reports", "category", params] as const,
    cashFlow: (params?: Record<string, unknown>) =>
      ["reports", "cashFlow", params] as const,
  },
  analytics: {
    spendingTrends: (params?: Record<string, unknown>) =>
      ["analytics", "spendingTrends", params] as const,
    budgetPerformance: (params?: Record<string, unknown>) =>
      ["analytics", "budgetPerformance", params] as const,
    categoryTrends: (params?: Record<string, unknown>) =>
      ["analytics", "categoryTrends", params] as const,
    savingsRate: (params?: Record<string, unknown>) =>
      ["analytics", "savingsRate", params] as const,
    fixedExpenseRatio: (params?: Record<string, unknown>) =>
      ["analytics", "fixedExpenseRatio", params] as const,
    incomeGrowth: (params?: Record<string, unknown>) =>
      ["analytics", "incomeGrowth", params] as const,
    spendingAnomalies: (params?: Record<string, unknown>) =>
      ["analytics", "spendingAnomalies", params] as const,
  },
  notifications: {
    all: () => ["notifications"] as const,
    unread: () => ["notifications", "unread"] as const,
  },
};
