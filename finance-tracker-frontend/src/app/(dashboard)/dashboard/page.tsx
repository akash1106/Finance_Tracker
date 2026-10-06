"use client";

import { useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
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
} from "@/components/ui";
import {
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  ArrowLeftRight,
  Landmark,
  TrendingUp,
  CreditCard,
} from "lucide-react";
import { useDashboardSummary } from "@/hooks/use-dashboard";
import { useAccounts } from "@/hooks/use-accounts";
import { useTransactions } from "@/hooks/use-transactions";
import { useIncome } from "@/hooks/use-income";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate } from "@/lib/formatters/date";
import type { Account } from "@/types/account";

export default function DashboardPage() {
  const { data: summaryData, isLoading: isSummaryLoading } = useDashboardSummary();
  const { data: accountsData, isLoading: isAccountsLoading } = useAccounts();
  const { data: transactionsData, isLoading: isTxLoading } = useTransactions({ limit: 5 });
  const { data: incomeData, isLoading: isIncomeLoading } = useIncome({ limit: 5 });

  const accounts: Account[] = accountsData || [];
  const transactions = transactionsData?.items || [];
  const incomeItems = incomeData?.items || [];

  // Compute live total balance from accounts
  const totalBalance = useMemo(() => {
    if (!accounts.length) {
      return Number(summaryData?.totalBalance ?? summaryData?.netWorth ?? 0);
    }
    return accounts.reduce((acc: number, a: Account) => {
      const bal = Number(a.currentBalance ?? a.balance ?? a.openingBalance) || 0;
      return acc + bal;
    }, 0);
  }, [accounts, summaryData]);

  const totalIncome = useMemo(() => {
    if (summaryData?.income !== undefined) return Number(summaryData.income) || 0;
    if (summaryData?.monthlyIncome !== undefined) return Number(summaryData.monthlyIncome) || 0;
    return incomeItems.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
  }, [summaryData, incomeItems]);

  const totalExpenses = useMemo(() => {
    if (summaryData?.expenses !== undefined) return Number(summaryData.expenses) || 0;
    if (summaryData?.monthlyExpenses !== undefined) return Number(summaryData.monthlyExpenses) || 0;
    return transactions
      .filter((t) => t.transactionType === "EXPENSE")
      .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
  }, [summaryData, transactions]);

  const netCashFlow = totalIncome - totalExpenses;

  // Combine latest 5 transactions and income for unified recent activity
  const recentActivities = useMemo(() => {
    const txMapped = transactions.map((tx) => ({
      id: tx.id,
      date: tx.transactionDate,
      title: tx.description || "Expense",
      category: tx.category?.name || "General",
      account: tx.account?.name || "Account",
      amount: Number(tx.amount) || 0,
      isIncome: tx.transactionType === "INCOME",
    }));

    const incMapped = incomeItems.map((inc) => ({
      id: inc.id,
      date: inc.receivedDate,
      title: inc.description || (inc.incomeSource?.name ? `${inc.incomeSource.name} Inflow` : "Income"),
      category: inc.incomeSource?.name || "Income",
      account: inc.account?.name || "Deposit Account",
      amount: Number(inc.amount) || 0,
      isIncome: true,
    }));

    return [...txMapped, ...incMapped]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);
  }, [transactions, incomeItems]);

  const isLoading = isSummaryLoading || isAccountsLoading;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Welcome to your personal finance and salary overview."
      >
        <div className="flex items-center gap-2">
          <Link href="/income/new">
            <Button variant="outline" size="sm" className="gap-1.5">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Add Income
            </Button>
          </Link>
          <Link href="/transactions/new">
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Add Transaction
            </Button>
          </Link>
        </div>
      </PageHeader>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Balance */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <span>Total Balance</span>
              <Wallet className="h-4 w-4 text-primary" />
            </CardDescription>
            {isLoading ? (
              <Skeleton className="h-8 w-32 mt-1" />
            ) : (
              <CardTitle className="text-2xl font-bold">
                {formatCurrency(totalBalance)}
              </CardTitle>
            )}
          </CardHeader>
          <CardContent>
            <p className="text-[11px] text-muted-foreground">
              Across {accounts.length} active account{accounts.length === 1 ? "" : "s"}
            </p>
          </CardContent>
        </Card>

        {/* Total Income */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <span>Total Income</span>
              <ArrowDownRight className="h-4 w-4 text-emerald-500" />
            </CardDescription>
            {isLoading ? (
              <Skeleton className="h-8 w-32 mt-1" />
            ) : (
              <CardTitle className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(totalIncome)}
              </CardTitle>
            )}
          </CardHeader>
          <CardContent>
            <Badge variant="success">Inflow</Badge>
          </CardContent>
        </Card>

        {/* Total Expenses */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <span>Total Expenses</span>
              <ArrowUpRight className="h-4 w-4 text-rose-500" />
            </CardDescription>
            {isLoading ? (
              <Skeleton className="h-8 w-32 mt-1" />
            ) : (
              <CardTitle className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                {formatCurrency(totalExpenses)}
              </CardTitle>
            )}
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">
              {totalIncome > 0
                ? `${Math.round((totalExpenses / totalIncome) * 100)}% of Income`
                : "Outflow"}
            </Badge>
          </CardContent>
        </Card>

        {/* Net Cash Flow */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <span>Net Cash Flow</span>
              <ArrowLeftRight className="h-4 w-4 text-primary" />
            </CardDescription>
            {isLoading ? (
              <Skeleton className="h-8 w-32 mt-1" />
            ) : (
              <CardTitle
                className={`text-2xl font-bold ${
                  netCashFlow >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {netCashFlow >= 0 ? "+" : ""}
                {formatCurrency(netCashFlow)}
              </CardTitle>
            )}
          </CardHeader>
          <CardContent>
            <p className="text-[11px] text-muted-foreground">
              {netCashFlow >= 0 ? "Surplus remaining" : "Deficit this period"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid: Recent Activity & Accounts Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity (2 cols) */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
              <CardDescription className="text-xs">
                Latest transactions and income receipts
              </CardDescription>
            </div>
            <Link href="/transactions">
              <Button variant="ghost" size="sm" className="text-xs text-primary gap-1">
                View All <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isTxLoading || isIncomeLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : recentActivities.length === 0 ? (
              <EmptyState
                icon={ArrowLeftRight}
                title="No recent activity"
                description="Record your first income or expense transaction to see it here."
                action={
                  <Link href="/transactions/new">
                    <Button size="sm" className="gap-1.5">
                      <Plus className="h-4 w-4" /> Add Transaction
                    </Button>
                  </Link>
                }
              />
            ) : (
              <div className="divide-y divide-border">
                {recentActivities.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
                          item.isIncome
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {item.isIncome ? (
                          <ArrowDownRight className="h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" />
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium text-foreground leading-none">
                          {item.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{item.category}</span>
                          <span>•</span>
                          <span>{item.account}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-0.5">
                      <p
                        className={`text-sm font-semibold ${
                          item.isIncome
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {item.isIncome ? "+" : "-"}
                        {formatCurrency(item.amount)}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {formatDate(item.date, "dd MMM")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Accounts Overview (1 col) */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold">My Accounts</CardTitle>
                <CardDescription className="text-xs">Live balances by account</CardDescription>
              </div>
              <Link href="/accounts">
                <Button variant="ghost" size="sm" className="text-xs text-primary gap-1">
                  Manage <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isAccountsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                  ))}
                </div>
              ) : accounts.length === 0 ? (
                <EmptyState
                  icon={Landmark}
                  title="No accounts linked"
                  description="Add an account to manage your bank balances."
                  action={
                    <Link href="/accounts/new">
                      <Button size="sm" className="gap-1.5">
                        <Plus className="h-4 w-4" /> Add Account
                      </Button>
                    </Link>
                  }
                />
              ) : (
                <div className="divide-y divide-border">
                  {accounts.map((acc) => {
                    const bal = Number(acc.currentBalance ?? acc.balance ?? acc.openingBalance) || 0;
                    return (
                      <Link
                        key={acc.id}
                        href={`/accounts/${acc.id}`}
                        className="flex items-center justify-between py-3 first:pt-0 last:pb-0 hover:bg-muted/30 px-1 rounded transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <Landmark className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground leading-none">
                              {acc.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {acc.accountType}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-foreground">
                            {formatCurrency(bal)}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            Open: {formatCurrency(acc.openingBalance)}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Quick Shortcuts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/income" className="block">
                <Button variant="outline" className="w-full justify-start text-xs gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  Income & Salary Ledger
                </Button>
              </Link>
              <Link href="/transactions" className="block">
                <Button variant="outline" className="w-full justify-start text-xs gap-2">
                  <ArrowLeftRight className="h-4 w-4 text-primary" />
                  Transactions Ledger
                </Button>
              </Link>
              <Link href="/accounts/new" className="block">
                <Button variant="outline" className="w-full justify-start text-xs gap-2">
                  <CreditCard className="h-4 w-4 text-indigo-500" />
                  Create New Account
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
