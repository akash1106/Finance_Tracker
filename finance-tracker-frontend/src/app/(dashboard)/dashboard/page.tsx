"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Clock,
  AlertCircle,
  CreditCard,
  CheckCircle2,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Sparkles,
} from "lucide-react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Skeleton,
  EmptyState,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui";
import {
  IncomeExpenseChart,
  ExpenseBreakdownChart,
  BudgetUtilizationChart,
  SavingsTrendChart,
} from "@/components/charts";
import { useAuth } from "@/hooks/use-auth";
import {
  useDashboardSummary,
  useCashFlow,
  useExpenseBreakdown,
  useBudgetUtilization,
  useNetWorth,
  useSavingsHistory,
} from "@/hooks/use-dashboard";
import { useAccounts } from "@/hooks/use-accounts";
import { useCategories } from "@/hooks/use-categories";
import { useTransactions } from "@/hooks/use-transactions";
import { useIncome } from "@/hooks/use-income";
import { useFixedExpenses } from "@/hooks/use-fixed-expenses";
import { useRecurringTransactions } from "@/hooks/use-recurring";
import { useLoans } from "@/hooks/use-loans";
import { formatCurrency, formatCompactCurrency } from "@/lib/formatters/currency";
import { formatDate } from "@/lib/formatters/date";
import type { Account } from "@/types/account";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MONTH_ABBR = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function DashboardPage() {
  const { user } = useAuth();

  // Dynamic Time-Based Greeting
  const { greeting, GreetingIcon } = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return { greeting: "Good morning", GreetingIcon: Sunrise };
    if (hour < 17) return { greeting: "Good afternoon", GreetingIcon: Sun };
    if (hour < 21) return { greeting: "Good evening", GreetingIcon: Sunset };
    return { greeting: "Good night", GreetingIcon: Moon };
  }, []);

  const userName = user?.name ? user.name.split(" ")[0] : "Akash";

  // Month-wise Date State (Default to current month & year)
  const today = useMemo(() => new Date(), []);
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth() + 1); // 1-indexed (1..12)

  const isCurrentMonth =
    selectedYear === today.getFullYear() && selectedMonth === today.getMonth() + 1;

  // Month Navigation Handlers
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  const handleResetToCurrentMonth = () => {
    setSelectedYear(today.getFullYear());
    setSelectedMonth(today.getMonth() + 1);
  };

  // Compute ISO date range for selected month
  const dateParams = useMemo(() => {
    const from = new Date(Date.UTC(selectedYear, selectedMonth - 1, 1, 0, 0, 0, 0)).toISOString();
    const lastDay = new Date(Date.UTC(selectedYear, selectedMonth, 0)).getUTCDate();
    const to = new Date(
      Date.UTC(selectedYear, selectedMonth - 1, lastDay, 23, 59, 59, 999)
    ).toISOString();

    return {
      year: selectedYear,
      month: selectedMonth,
      from,
      to,
      startDate: from,
      endDate: to,
    };
  }, [selectedYear, selectedMonth]);

  const monthLabel = `${MONTH_ABBR[selectedMonth - 1]} ${selectedYear}`;

  // Data Queries filtered by month
  const { data: summaryData, isLoading: isSummaryLoading } = useDashboardSummary(dateParams);
  const { data: cashFlowData, isLoading: isCashFlowLoading } = useCashFlow();
  const { data: expenseBreakdownData, isLoading: isBreakdownLoading } =
    useExpenseBreakdown(dateParams);
  const { data: budgetUtilizationData, isLoading: isBudgetLoading } =
    useBudgetUtilization(dateParams);
  const { data: netWorthData, isLoading: isNetWorthLoading } = useNetWorth(dateParams);
  const { data: savingsHistory } = useSavingsHistory();

  const { data: accountsData = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const { data: transactionsData, isLoading: isTxLoading } = useTransactions({
    startDate: dateParams.from,
    endDate: dateParams.to,
    limit: 15,
  });
  const { data: incomeData, isLoading: isIncomeLoading } = useIncome({
    startDate: dateParams.from,
    endDate: dateParams.to,
    limit: 15,
  });
  const { data: fixedExpenses = [] } = useFixedExpenses();
  const { data: recurringData } = useRecurringTransactions();
  const recurringList = Array.isArray(recurringData)
    ? recurringData
    : (recurringData as unknown as { items?: unknown[] })?.items || [];
  const { data: loans = [] } = useLoans();

  const accounts: Account[] = accountsData || [];
  const transactions = transactionsData?.items || [];
  const incomeItems = incomeData?.items || [];

  // Category Map for fast lookup
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories]);

  // Top 4 Metrics for Selected Month
  const totalIncome = useMemo(() => {
    if (summaryData?.income !== undefined && summaryData.income !== null) {
      return Number(summaryData.income) || 0;
    }
    if (summaryData?.monthlyIncome !== undefined) {
      return Number(summaryData.monthlyIncome) || 0;
    }
    return incomeItems.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
  }, [summaryData, incomeItems]);

  const totalExpenses = useMemo(() => {
    if (summaryData?.expenses !== undefined && summaryData.expenses !== null) {
      return Number(summaryData.expenses) || 0;
    }
    if (summaryData?.monthlyExpenses !== undefined) {
      return Number(summaryData.monthlyExpenses) || 0;
    }
    return transactions
      .filter((t) => t.transactionType === "EXPENSE")
      .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
  }, [summaryData, transactions]);

  const totalSavings = useMemo(() => {
    if (summaryData?.savings !== undefined && summaryData.savings !== null) {
      return Number(summaryData.savings) || 0;
    }
    if (summaryData?.monthlySavings !== undefined) {
      return Number(summaryData.monthlySavings) || 0;
    }
    return transactions
      .filter((t) => t.transactionType === "SAVING")
      .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
  }, [summaryData, transactions]);

  const netWorth = useMemo(() => {
    if (netWorthData && typeof netWorthData === "object" && "netWorth" in netWorthData) {
      const val = Number(
        (netWorthData as unknown as { netWorth: string | number }).netWorth
      );
      if (!isNaN(val)) return val;
    }
    if (summaryData?.netWorth !== undefined) {
      return Number(summaryData.netWorth) || 0;
    }
    if (accounts.length > 0) {
      return accounts.reduce((acc: number, a: Account) => {
        return acc + (Number(a.currentBalance ?? a.balance ?? a.openingBalance) || 0);
      }, 0);
    }
    return Number(summaryData?.totalBalance ?? 0);
  }, [netWorthData, summaryData, accounts]);

  const savingsRate =
    totalIncome > 0 ? Math.round((totalSavings / totalIncome) * 100) : 0;
  const expenseRate =
    totalIncome > 0 ? Math.round((totalExpenses / totalIncome) * 100) : 0;

  // Chart 1: Income vs Expenses Data Points
  const incomeExpenseData = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const dailyMap = new Map<number, { income: number; expenses: number }>();

    // Seed milestone days across the month
    for (let day = 1; day <= daysInMonth; day += 4) {
      dailyMap.set(day, { income: 0, expenses: 0 });
    }
    dailyMap.set(daysInMonth, { income: 0, expenses: 0 });

    // Sum transactions
    transactions.forEach((tx) => {
      const d = new Date(tx.transactionDate);
      if (d.getFullYear() === selectedYear && d.getMonth() + 1 === selectedMonth) {
        const day = d.getDate();
        const curr = dailyMap.get(day) || { income: 0, expenses: 0 };
        if (tx.transactionType === "INCOME") {
          curr.income += Number(tx.amount) || 0;
        } else if (tx.transactionType === "EXPENSE") {
          curr.expenses += Number(tx.amount) || 0;
        }
        dailyMap.set(day, curr);
      }
    });

    // Sum income inflows
    incomeItems.forEach((inc) => {
      const d = new Date(inc.receivedDate);
      if (d.getFullYear() === selectedYear && d.getMonth() + 1 === selectedMonth) {
        const day = d.getDate();
        const curr = dailyMap.get(day) || { income: 0, expenses: 0 };
        curr.income += Number(inc.amount) || 0;
        dailyMap.set(day, curr);
      }
    });

    const sortedDays = Array.from(dailyMap.keys()).sort((a, b) => a - b);
    const points = sortedDays.map((day) => {
      const data = dailyMap.get(day)!;
      return {
        label: `${MONTH_ABBR[selectedMonth - 1]} ${day}`,
        income: Math.round(data.income),
        expenses: Math.round(data.expenses),
      };
    });

    const hasActivity = points.some((p) => p.income > 0 || p.expenses > 0);
    if (!hasActivity && cashFlowData && cashFlowData.length > 0) {
      return cashFlowData.slice(-6).map((cf) => ({
        label: cf.month,
        income: Number(cf.income) || 0,
        expenses: Number(cf.expenses) || 0,
      }));
    }

    return points;
  }, [selectedYear, selectedMonth, transactions, incomeItems, cashFlowData]);

  // Chart 2: Expense Breakdown Slices
  const breakdownSlices = useMemo(() => {
    if (expenseBreakdownData && expenseBreakdownData.length > 0) {
      return expenseBreakdownData.map((b) => ({
        category: b.category,
        amount: Number(b.amount) || 0,
        percentage: Number(b.percentage) || 0,
      }));
    }

    // Derive directly from month transactions if API breakdown is empty
    const map = new Map<string, number>();
    transactions
      .filter((t) => t.transactionType === "EXPENSE")
      .forEach((t) => {
        const cat = t.category?.name || "General";
        map.set(cat, (map.get(cat) || 0) + (Number(t.amount) || 0));
      });

    return Array.from(map.entries()).map(([category, amount]) => ({
      category,
      amount,
    }));
  }, [expenseBreakdownData, transactions]);

  // Chart 3: Budget Utilization Bars
  const budgetUtilizationChartData = useMemo(() => {
    if (!budgetUtilizationData || budgetUtilizationData.length === 0) return [];
    return budgetUtilizationData.map((b) => {
      const catName =
        b.category ||
        (b.categoryId ? categoryMap.get(b.categoryId) : undefined) ||
        "Category";
      const allocated = Number(b.allocated) || 0;
      const spent = Number(b.spent) || 0;
      return {
        category: catName,
        allocated,
        spent,
        remaining: Number(b.remaining ?? (allocated - spent)) || 0,
        percentage: Number(b.percentageUsed ?? b.percentage) || 0,
      };
    });
  }, [budgetUtilizationData, categoryMap]);

  // Chart 4: Savings Trend Line
  const savingsTrendData = useMemo(() => {
    if (cashFlowData && cashFlowData.length > 0) {
      return cashFlowData.slice(-6).map((cf) => ({
        label: cf.month,
        savings: Number(cf.savings) || 0,
      }));
    }
    if (Array.isArray(savingsHistory) && savingsHistory.length > 0) {
      return (savingsHistory as Array<{ date: string; amount: string | number }>)
        .slice(-6)
        .map((s) => ({
          label: formatDate(s.date, "MMM dd"),
          savings: Number(s.amount) || 0,
        }));
    }
    return [
      { label: `${MONTH_ABBR[selectedMonth - 1]} 1`, savings: 0 },
      { label: `${MONTH_ABBR[selectedMonth - 1]} 15`, savings: Math.round(totalSavings * 0.5) },
      { label: `${MONTH_ABBR[selectedMonth - 1]} ${new Date(selectedYear, selectedMonth, 0).getDate()}`, savings: totalSavings },
    ];
  }, [cashFlowData, savingsHistory, selectedMonth, selectedYear, totalSavings]);

  // Table: Recent Transactions for Selected Month
  const recentRecords = useMemo(() => {
    const txList = transactions.map((t) => ({
      id: `tx-${t.id}`,
      date: t.transactionDate,
      title: t.description || "Expense",
      category: t.category?.name || "General",
      account: t.account?.name || "Account",
      amount: Number(t.amount) || 0,
      isIncome: t.transactionType === "INCOME",
    }));

    const incList = incomeItems.map((i) => ({
      id: `inc-${i.id}`,
      date: i.receivedDate,
      title:
        i.description ||
        (i.incomeSource?.name ? `${i.incomeSource.name} Inflow` : "Income Inflow"),
      category: i.incomeSource?.name || "Income",
      account: i.account?.name || "Deposit Account",
      amount: Number(i.amount) || 0,
      isIncome: true,
    }));

    return [...txList, ...incList]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);
  }, [transactions, incomeItems]);

  // Cards: Upcoming Payments Alert Cards
  const upcomingPayments = useMemo(() => {
    const items: Array<{
      id: string;
      title: string;
      dueDate: string;
      amount: number;
      category?: string;
      type: "FIXED" | "RECURRING" | "LOAN";
      typeLabel: string;
      isOverdue: boolean;
      daysUntil: number;
    }> = [];

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Fixed Expenses
    fixedExpenses
      .filter((fe) => fe.isActive !== false)
      .forEach((fe) => {
        const d = fe.nextDueDate ? new Date(fe.nextDueDate) : new Date();
        const diffDays = Math.ceil(
          (d.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24)
        );
        items.push({
          id: `fixed-${fe.id}`,
          title: fe.name,
          dueDate: fe.nextDueDate,
          amount: Number(fe.amount) || 0,
          category: fe.category?.name || "Fixed Bill",
          type: "FIXED",
          typeLabel: "Fixed",
          isOverdue: diffDays < 0,
          daysUntil: diffDays,
        });
      });

    // Recurring Transactions
    (recurringList as Array<{
      id: string;
      name: string;
      nextRunDate: string;
      amount: string | number;
      category?: { name: string };
      isActive?: boolean;
    }>)
      .filter((rt) => rt.isActive !== false)
      .forEach((rt) => {
        const d = rt.nextRunDate ? new Date(rt.nextRunDate) : new Date();
        const diffDays = Math.ceil(
          (d.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24)
        );
        items.push({
          id: `recurring-${rt.id}`,
          title: rt.name,
          dueDate: rt.nextRunDate,
          amount: Number(rt.amount) || 0,
          category: rt.category?.name || "Recurring",
          type: "RECURRING",
          typeLabel: "Recurring",
          isOverdue: diffDays < 0,
          daysUntil: diffDays,
        });
      });

    // Active Loans EMIs
    loans
      .filter((l) => l.status === "ACTIVE" || l.isActive !== false)
      .forEach((loan) => {
        const emi = Number(loan.emiAmount ?? loan.monthlyEmi ?? 0);
        if (emi > 0) {
          const d = new Date(selectedYear, selectedMonth - 1, 10);
          const diffDays = Math.ceil(
            (d.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24)
          );
          items.push({
            id: `loan-${loan.id}`,
            title: `${loan.name} (EMI)`,
            dueDate: d.toISOString(),
            amount: emi,
            category: "Loan EMI",
            type: "LOAN",
            typeLabel: "EMI",
            isOverdue: diffDays < 0 && isCurrentMonth,
            daysUntil: diffDays,
          });
        }
      });

    return items
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 4);
  }, [fixedExpenses, recurringList, loans, selectedYear, selectedMonth, isCurrentMonth]);

  const totalUpcomingAmount = useMemo(
    () => upcomingPayments.reduce((acc, p) => acc + p.amount, 0),
    [upcomingPayments]
  );

  const isMetricsLoading = isSummaryLoading || isNetWorthLoading;

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* Header Banner: Greeting + Monthly Selector + Quick Actions */}
      {/* ========================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-card border border-border shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <GreetingIcon className="h-5 w-5 text-amber-500 shrink-0" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {greeting}, {userName}
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Monthly financial ledger & zero-based budget control for {MONTH_NAMES[selectedMonth - 1]} {selectedYear}</span>
          </p>
        </div>

        {/* Month Navigation & Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Month Selector Pill */}
          <div className="flex items-center bg-muted/50 border border-input rounded-xl p-1 shadow-2xs">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handlePrevMonth}
              className="h-8 w-8 p-0 rounded-lg hover:bg-background cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1 px-3">
              <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="text-xs font-bold text-foreground tracking-tight select-none min-w-[70px] text-center">
                {monthLabel}
              </span>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleNextMonth}
              className="h-8 w-8 p-0 rounded-lg hover:bg-background cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {!isCurrentMonth && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetToCurrentMonth}
              className="text-xs h-9 px-2.5 text-primary border-primary/30 hover:bg-primary/10"
              title="Jump to current active month"
            >
              This Month
            </Button>
          )}

          {/* Quick Action Shortcuts */}
          <div className="flex items-center gap-2">
            <Link href="/income/new">
              <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                <span className="hidden sm:inline">Add</span> Income
              </Button>
            </Link>
            <Link href="/transactions/new">
              <Button size="sm" className="h-9 gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Add</span> Transaction
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4 Top Metric Cards (Income, Expenses, Savings, Net Worth) */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Income Card */}
        <Card className="border-border hover:border-emerald-500/40 transition-colors">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between text-xs font-medium">
              <span>Income</span>
              <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <TrendingUp className="h-4 w-4" />
              </div>
            </CardDescription>
            {isMetricsLoading ? (
              <Skeleton className="h-8 w-32 mt-1" />
            ) : (
              <CardTitle className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                {formatCurrency(totalIncome)}
              </CardTitle>
            )}
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-[11px] text-muted-foreground">
              {incomeItems.length} inflow transaction{incomeItems.length === 1 ? "" : "s"} in {monthLabel}
            </p>
          </CardContent>
        </Card>

        {/* 2. Expenses Card */}
        <Card className="border-border hover:border-rose-500/40 transition-colors">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between text-xs font-medium">
              <span>Expenses</span>
              <div className="h-7 w-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <TrendingDown className="h-4 w-4" />
              </div>
            </CardDescription>
            {isMetricsLoading ? (
              <Skeleton className="h-8 w-32 mt-1" />
            ) : (
              <CardTitle className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
                {formatCurrency(totalExpenses)}
              </CardTitle>
            )}
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-[11px] text-muted-foreground">
              {totalIncome > 0
                ? `${expenseRate}% of monthly earnings deployed`
                : `${transactions.length} debits recorded`}
            </p>
          </CardContent>
        </Card>

        {/* 3. Savings Card */}
        <Card className="border-border hover:border-blue-500/40 transition-colors">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between text-xs font-medium">
              <span>Savings</span>
              <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <PiggyBank className="h-4 w-4" />
              </div>
            </CardDescription>
            {isMetricsLoading ? (
              <Skeleton className="h-8 w-32 mt-1" />
            ) : (
              <CardTitle className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
                {formatCurrency(totalSavings)}
              </CardTitle>
            )}
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-[11px] text-muted-foreground">
              {totalIncome > 0
                ? `${savingsRate}% savings rate achieved`
                : "Retained liquid buffer"}
            </p>
          </CardContent>
        </Card>

        {/* 4. Net Worth Card */}
        <Card className="border-border hover:border-indigo-500/40 transition-colors">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between text-xs font-medium">
              <span>Net Worth</span>
              <div className="h-7 w-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Wallet className="h-4 w-4" />
              </div>
            </CardDescription>
            {isMetricsLoading ? (
              <Skeleton className="h-8 w-32 mt-1" />
            ) : (
              <div className="flex items-baseline gap-2">
                <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                  {formatCompactCurrency(netWorth)}
                </CardTitle>
                <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
                  ({formatCurrency(netWorth)})
                </span>
              </div>
            )}
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-[11px] text-muted-foreground">
              Across {accounts.length} active asset account{accounts.length === 1 ? "" : "s"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ========================================================= */}
      {/* Row 1: Income vs Expenses (Line) + Expense Breakdown (Donut) */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Line Chart */}
        <Card className="border-border">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                Income vs Expenses
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Cash flow progression throughout {monthLabel}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-[10px] font-normal">
              📈 Line Chart
            </Badge>
          </CardHeader>
          <CardContent className="pt-2">
            <IncomeExpenseChart
              data={incomeExpenseData}
              isLoading={isCashFlowLoading || isTxLoading}
              height={270}
            />
          </CardContent>
        </Card>

        {/* Expense Breakdown Donut Chart */}
        <Card className="border-border">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-rose-500" />
                Expense Breakdown
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Category spending split for {monthLabel}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-[10px] font-normal">
              🥧 Donut Chart
            </Badge>
          </CardHeader>
          <CardContent className="pt-2">
            <ExpenseBreakdownChart
              data={breakdownSlices}
              totalAmount={totalExpenses}
              isLoading={isBreakdownLoading}
              height={270}
            />
          </CardContent>
        </Card>
      </div>

      {/* ========================================================= */}
      {/* Row 2: Budget Utilization (Bar) + Savings Trend (Line)    */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Utilization Bar Chart */}
        <Card className="border-border">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Wallet className="h-4 w-4 text-blue-500" />
                Budget Utilization
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Envelope target vs actual spend per category
              </CardDescription>
            </div>
            <Link href="/budget">
              <Button variant="ghost" size="sm" className="h-7 text-xs text-primary gap-1">
                Details <ArrowUpRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-2">
            <BudgetUtilizationChart
              data={budgetUtilizationChartData}
              isLoading={isBudgetLoading}
              height={270}
            />
          </CardContent>
        </Card>

        {/* Savings Trend Line Chart */}
        <Card className="border-border">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <PiggyBank className="h-4 w-4 text-cyan-500" />
                Savings Trend
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Accumulated savings curve and liquid deposit trajectory
              </CardDescription>
            </div>
            <Link href="/savings">
              <Button variant="ghost" size="sm" className="h-7 text-xs text-primary gap-1">
                Goals <ArrowUpRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-2">
            <SavingsTrendChart
              data={savingsTrendData}
              isLoading={isCashFlowLoading}
              height={270}
            />
          </CardContent>
        </Card>
      </div>

      {/* ========================================================= */}
      {/* Row 3: Recent Transactions (Table) + Upcoming Payments (Alerts) */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions Table */}
        <Card className="border-border flex flex-col justify-between">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Recent Transactions
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Recorded debits and credits in {monthLabel}
              </CardDescription>
            </div>
            <Link href="/transactions">
              <Button variant="ghost" size="sm" className="h-7 text-xs text-primary gap-1">
                View All <ArrowUpRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>

          <CardContent className="p-0 flex-1">
            {isTxLoading || isIncomeLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-lg" />
                ))}
              </div>
            ) : recentRecords.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  icon={Calendar}
                  title={`No transactions in ${monthLabel}`}
                  description="Log transactions to track your income and category spending."
                  action={
                    <Link href="/transactions/new">
                      <Button size="sm" className="gap-1.5 text-xs">
                        <Plus className="h-3.5 w-3.5" /> Add Transaction
                      </Button>
                    </Link>
                  }
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/60 hover:bg-transparent">
                      <TableHead className="w-20 text-xs">Date</TableHead>
                      <TableHead className="text-xs">Description</TableHead>
                      <TableHead className="text-xs">Category</TableHead>
                      <TableHead className="text-right text-xs">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentRecords.map((item) => (
                      <TableRow key={item.id} className="border-border/40 hover:bg-muted/30">
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap font-medium">
                          {formatDate(item.date, "dd MMM")}
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-foreground max-w-[150px] truncate">
                          {item.title}
                          <span className="block text-[10px] text-muted-foreground font-normal truncate">
                            {item.account}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs">
                          <Badge
                            variant={item.isIncome ? "success" : "secondary"}
                            className="text-[10px] font-normal"
                          >
                            {item.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-xs font-bold whitespace-nowrap">
                          <span
                            className={
                              item.isIncome
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-rose-600 dark:text-rose-400"
                            }
                          >
                            {item.isIncome ? "+" : "-"}
                            {formatCurrency(item.amount)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Payments Alert Cards */}
        <Card className="border-border flex flex-col justify-between">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                Upcoming Payments
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Bills, subscriptions & loan EMIs due this cycle
              </CardDescription>
            </div>
            <Link href="/fixed-expenses">
              <Button variant="ghost" size="sm" className="h-7 text-xs text-primary gap-1">
                Manage <ArrowUpRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>

          <CardContent className="space-y-3 flex-1">
            {upcomingPayments.length === 0 ? (
              <div className="py-6">
                <EmptyState
                  icon={CheckCircle2}
                  title="All caught up!"
                  description="No pending fixed bills or loan payments scheduled for this cycle."
                  action={
                    <Link href="/fixed-expenses/new">
                      <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                        <Plus className="h-3.5 w-3.5" /> Add Bill Schedule
                      </Button>
                    </Link>
                  }
                />
              </div>
            ) : (
              <div className="space-y-2.5">
                {upcomingPayments.map((p) => {
                  const isSoon = p.daysUntil >= 0 && p.daysUntil <= 3;
                  return (
                    <div
                      key={p.id}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        p.isOverdue
                          ? "bg-rose-500/10 border-rose-300 dark:border-rose-900/50"
                          : isSoon
                          ? "bg-amber-500/10 border-amber-300 dark:border-amber-900/50"
                          : "bg-card border-border hover:border-primary/30"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                            p.isOverdue
                              ? "bg-rose-500/20 text-rose-600 dark:text-rose-400"
                              : isSoon
                              ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {p.type === "LOAN" ? (
                            <CreditCard className="h-4 w-4" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">
                            {p.title}
                          </p>
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                            <span className="truncate">{p.category}</span>
                            <span>•</span>
                            <span
                              className={
                                p.isOverdue
                                  ? "text-rose-600 dark:text-rose-400 font-semibold"
                                  : isSoon
                                  ? "text-amber-600 dark:text-amber-400 font-semibold"
                                  : "text-muted-foreground"
                              }
                            >
                              {p.isOverdue
                                ? `Overdue by ${Math.abs(p.daysUntil)}d`
                                : p.daysUntil === 0
                                ? "Due Today"
                                : p.daysUntil > 0
                                ? `Due in ${p.daysUntil}d`
                                : `Due ${formatDate(p.dueDate, "dd MMM")}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-foreground">
                          {formatCurrency(p.amount)}
                        </p>
                        <Badge
                          variant={
                            p.isOverdue
                              ? "destructive"
                              : isSoon
                              ? "warning"
                              : "outline"
                          }
                          className="text-[9px] uppercase px-1.5 py-0 mt-0.5"
                        >
                          {p.typeLabel}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Upcoming Summary Footer */}
            {upcomingPayments.length > 0 && (
              <div className="pt-2 mt-2 border-t border-border flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {upcomingPayments.length} scheduled payment{upcomingPayments.length === 1 ? "" : "s"}
                </span>
                <span className="font-semibold text-foreground">
                  Total: <strong className="text-rose-600 dark:text-rose-400">{formatCurrency(totalUpcomingAmount)}</strong>
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
