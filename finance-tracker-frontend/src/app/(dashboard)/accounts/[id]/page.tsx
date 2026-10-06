"use client";

import React, { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Landmark,
  Wallet,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Badge,
  Skeleton,
  EmptyState,
} from "@/components/ui";
import { useAccount } from "@/hooks/use-accounts";
import { useTransactions } from "@/hooks/use-transactions";
import { useIncome } from "@/hooks/use-income";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate } from "@/lib/formatters/date";

export default function AccountDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const { data: account, isLoading: isLoadingAccount, isError: isAccountError } = useAccount(id);
  const { data: txData, isLoading: isLoadingTx } = useTransactions({ accountId: id, limit: 50 });
  const { data: incomeData, isLoading: isLoadingIncome } = useIncome({ accountId: id });

  const transactions = txData?.items || [];
  const incomeItems = incomeData?.items || [];

  const metrics = useMemo(() => {
    let totalInflow = 0;
    let totalOutflow = 0;
    incomeItems.forEach((inc) => {
      totalInflow += Number(inc.amount) || 0;
    });
    transactions.forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      if (tx.transactionType === "INCOME") totalInflow += amt;
      else if (tx.transactionType === "EXPENSE") totalOutflow += amt;
    });
    return { totalInflow, totalOutflow };
  }, [transactions, incomeItems]);

  const allEntries = useMemo(() => {
    const txEntries = transactions.map((tx) => ({
      id: tx.id,
      date: tx.transactionDate,
      description: tx.description || "Untitled Transaction",
      categoryName: tx.category?.name || "General",
      type: tx.transactionType,
      isExpense: tx.transactionType === "EXPENSE",
      isIncome: tx.transactionType === "INCOME",
      amount: tx.amount,
    }));
    const incEntries = incomeItems.map((inc) => ({
      id: inc.id,
      date: inc.receivedDate,
      description: inc.description || (inc.incomeSource?.name ? `${inc.incomeSource.name} Inflow` : "Income Deposit"),
      categoryName: inc.incomeSource?.name || "Income",
      type: "INCOME",
      isExpense: false,
      isIncome: true,
      amount: inc.amount,
    }));
    return [...txEntries, ...incEntries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [transactions, incomeItems]);

  if (isLoadingAccount) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (isAccountError || !account) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <h2 className="text-xl font-bold">Account Not Found</h2>
        <p className="text-sm text-muted-foreground">
          The requested account does not exist or may have been deleted.
        </p>
        <Link href="/accounts">
          <Button variant="outline">Back to Accounts</Button>
        </Link>
      </div>
    );
  }

  const isBank = account.accountType === "BANK";
  const isCash = account.accountType === "CASH";
  const currentBalance = Number(account.currentBalance ?? account.balance ?? account.openingBalance) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/accounts"
          className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to accounts
        </Link>
        <Link href="/transactions/new">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> Add Transaction
          </Button>
        </Link>
      </div>

      <PageHeader
        title={account.name}
        description={`Account Ledger — ${account.accountType} (${account.isActive ? "Active" : "Archived"})`}
      />

      {/* Account Balances Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-primary">Current Ledger Balance</span>
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              {isBank ? <Landmark className="h-4 w-4" /> : isCash ? <Wallet className="h-4 w-4" /> : <Coins className="h-4 w-4" />}
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-foreground">
              {formatCurrency(currentBalance)}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Opening: {formatCurrency(account.openingBalance)}
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Recorded Inflow</span>
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              +{formatCurrency(metrics.totalInflow)}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">Total credited in this ledger</p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Recorded Outflow</span>
            <div className="h-8 w-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <ArrowDownRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              -{formatCurrency(metrics.totalOutflow)}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">Total debited in this ledger</p>
          </div>
        </Card>
      </div>

      {/* Account Transactions Ledger */}
      <Card className="border-border overflow-hidden">
        <CardHeader className="py-3 px-4 border-b border-border bg-muted/20 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">Ledger Activity</CardTitle>
            <CardDescription className="text-xs">
              All transactions specifically linked to {account.name}
            </CardDescription>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            {transactions.length} Entries
          </Badge>
        </CardHeader>

        <CardContent className="p-0">
          {isLoadingTx || isLoadingIncome ? (
            <div className="p-6 space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : allEntries.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Calendar}
                title="No activity recorded for this account"
                description="Transactions created with this account as the source or destination will appear here."
                action={
                  <Link href="/transactions/new">
                    <Button size="sm" className="gap-2">
                      <Plus className="h-4 w-4" /> Add Transaction
                    </Button>
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category / Source</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allEntries.map((entry) => {
                    const isExpense = entry.isExpense;
                    const isIncome = entry.isIncome;

                    return (
                      <TableRow key={entry.id} className="hover:bg-muted/40 transition-colors">
                        <TableCell className="font-medium whitespace-nowrap text-xs text-muted-foreground">
                          {formatDate(entry.date, "dd MMM yyyy")}
                        </TableCell>
                        <TableCell className="font-semibold text-foreground text-sm">
                          {entry.description}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[11px] font-normal">
                            {entry.categoryName}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              isExpense ? "destructive" : isIncome ? "default" : "secondary"
                            }
                            className="text-[10px]"
                          >
                            {entry.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold whitespace-nowrap">
                          <span
                            className={
                              isExpense
                                ? "text-rose-600 dark:text-rose-400"
                                : isIncome
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-foreground"
                            }
                          >
                            {isExpense ? "-" : isIncome ? "+" : ""}
                            {formatCurrency(entry.amount)}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
