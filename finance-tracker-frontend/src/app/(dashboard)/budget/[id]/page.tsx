"use client";

import React, { use } from "react";
import Link from "next/link";
import {
  PieChart,
  ArrowLeft,
  Wallet,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Sliders,
  Calendar,
  Layers,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Progress,
  Skeleton,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui";
import { useBudgetDetail, useBudgetSummary } from "@/hooks/use-budget";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate } from "@/lib/formatters/date";
import type { MonthlyBudgetItem } from "@/types/budget";

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

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function BudgetDetailPage({ params }: PageProps) {
  const { id } = use(params);

  const { data: budget, isLoading: isBudgetLoading, isError } = useBudgetDetail(id);
  const { data: summaryData, isLoading: isSummaryLoading } = useBudgetSummary(id);

  if (isBudgetLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !budget) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-destructive font-medium">Monthly budget not found or failed to load.</p>
        <Link href="/budget">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Budgets
          </Button>
        </Link>
      </div>
    );
  }

  const monthLabel = `${MONTH_NAMES[budget.month - 1]} ${budget.year}`;
  const allocatedTotal = Number(summaryData?.allocated ?? budget.allocatedAmount ?? 0);
  const spentTotal = Number(summaryData?.spent ?? 0);
  const remainingTotal = Number(summaryData?.remaining ?? (allocatedTotal - spentTotal));
  const percentUsed = Number(
    summaryData?.percentageUsed ?? (allocatedTotal > 0 ? (spentTotal / allocatedTotal) * 100 : 0)
  );
  const budgetStatus =
    summaryData?.status ??
    (percentUsed >= 100 ? "EXCEEDED" : percentUsed >= 80 ? "WARNING" : "NORMAL");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/budget">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            Budget Breakdown: {monthLabel}
          </h1>
          <p className="text-xs text-muted-foreground">
            Zero-based monthly envelope tracking and audit
          </p>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Allocated</span>
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-foreground">
              {formatCurrency(allocatedTotal)}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
              {budget.budgetTemplate?.name || "Allocation Template"}
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Actual Spent</span>
            <div className="h-8 w-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {formatCurrency(spentTotal)}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Debit transactions this month
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Remaining Envelope</span>
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center ${
                remainingTotal >= 0
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-rose-500/10 text-rose-500"
              }`}
            >
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span
              className={`text-2xl font-bold ${
                remainingTotal >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {remainingTotal < 0 ? "-" : ""}
              {formatCurrency(Math.abs(remainingTotal))}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {remainingTotal >= 0 ? "Surplus remaining" : "Exceeded budget!"}
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Overall Discipline</span>
            <Badge
              variant={
                budgetStatus === "EXCEEDED"
                  ? "destructive"
                  : budgetStatus === "WARNING"
                  ? "outline"
                  : "success"
              }
              className="text-[10px]"
            >
              {budgetStatus}
            </Badge>
          </div>
          <div className="mt-2 space-y-1.5">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-foreground">
                {percentUsed.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">budget consumed</span>
            </div>
            <Progress
              value={Math.min(percentUsed, 100)}
              className={`h-2 ${
                percentUsed >= 100
                  ? "[&>div]:bg-rose-500"
                  : percentUsed >= 80
                  ? "[&>div]:bg-amber-500"
                  : "[&>div]:bg-emerald-500"
              }`}
            />
          </div>
        </Card>
      </div>

      {/* Origin Details Card */}
      <Card className="p-4 bg-muted/20 border-border">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-muted-foreground font-medium">Income Source:</span>
            <p className="font-semibold text-foreground mt-0.5">
              {budget.incomeTransaction?.incomeSource?.name || "Salary Inflow"}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground font-medium">Income Amount:</span>
            <p className="font-semibold text-foreground mt-0.5">
              {formatCurrency(budget.incomeTransaction?.amount ?? budget.allocatedAmount)}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground font-medium">Deposit Date:</span>
            <p className="font-semibold text-foreground mt-0.5">
              {budget.incomeTransaction?.receivedDate
                ? formatDate(budget.incomeTransaction.receivedDate, "dd MMMM yyyy")
                : "-"}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground font-medium">Allocation Template:</span>
            <p className="font-semibold text-foreground mt-0.5">
              {budget.budgetTemplate?.name || "Default Template"}
            </p>
          </div>
        </div>
      </Card>

      {/* Category Allocations Detailed Table */}
      <Card className="border-border overflow-hidden">
        <CardHeader className="py-3 px-4 border-b border-border bg-muted/20 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold">Category Audit & Breakdown</CardTitle>
          <span className="text-xs text-muted-foreground">
            {summaryData?.items?.length || budget.items?.length || 0} Categories Tracked
          </span>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Target %</TableHead>
                  <TableHead className="text-right">Allocated</TableHead>
                  <TableHead className="text-right">Spent</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                  <TableHead className="w-48">Utilization</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Ledger</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(summaryData?.items || budget.items || []).map((item: MonthlyBudgetItem) => {
                  const allocated = Number(item.allocatedAmount) || 0;
                  const spent = Number(item.spentAmount) || 0;
                  const remaining = allocated - spent;
                  const usage = allocated > 0 ? (spent / allocated) * 100 : 0;
                  const isExceeded = spent > allocated;
                  const isWarning = usage >= 80 && !isExceeded;

                  return (
                    <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-semibold text-sm text-foreground">
                        {item.category?.name || "Category"}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground font-mono">
                        {item.percentage ? `${item.percentage}%` : "-"}
                      </TableCell>
                      <TableCell className="text-right font-medium text-xs text-foreground">
                        {formatCurrency(allocated)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-xs text-rose-600 dark:text-rose-400">
                        {formatCurrency(spent)}
                      </TableCell>
                      <TableCell
                        className={`text-right font-bold text-xs ${
                          remaining >= 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {remaining < 0 ? "-" : ""}
                        {formatCurrency(Math.abs(remaining))}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Progress
                            value={Math.min(usage, 100)}
                            className={`h-2 ${
                              isExceeded
                                ? "[&>div]:bg-rose-500"
                                : isWarning
                                ? "[&>div]:bg-amber-500"
                                : "[&>div]:bg-emerald-500"
                            }`}
                          />
                          <span className="text-[10px] text-muted-foreground block text-right">
                            {usage.toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {isExceeded ? (
                          <Badge variant="destructive" className="text-[10px] py-0 px-2">
                            Exceeded (+{formatCurrency(spent - allocated)})
                          </Badge>
                        ) : isWarning ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] py-0 px-2 text-amber-600 dark:text-amber-400 border-amber-400"
                          >
                            Warning
                          </Badge>
                        ) : (
                          <Badge variant="success" className="text-[10px] py-0 px-2">
                            Normal
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/transactions?categoryFilter=${item.categoryId}`}
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          Audit <ExternalLink className="h-3 w-3" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
