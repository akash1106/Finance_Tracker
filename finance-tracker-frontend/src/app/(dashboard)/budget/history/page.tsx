"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  History,
  ArrowLeft,
  PieChart,
  Calendar,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Wallet,
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
  Skeleton,
  EmptyState,
  Select,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui";
import { useMonthlyBudgets } from "@/hooks/use-budget";
import { formatCurrency } from "@/lib/formatters/currency";

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

export default function BudgetHistoryPage() {
  const [selectedYear, setSelectedYear] = useState<string>("ALL");

  const { data: budgets, isLoading } = useMonthlyBudgets(
    selectedYear !== "ALL" ? { year: Number(selectedYear) } : undefined
  );

  const budgetList = budgets || [];

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    budgetList.forEach((b) => years.add(b.year));
    if (years.size === 0) years.add(new Date().getUTCFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [budgetList]);

  // Aggregate stats
  const stats = useMemo(() => {
    let totalAllocated = 0;
    let totalSpent = 0;

    budgetList.forEach((b) => {
      totalAllocated += Number(b.allocatedAmount) || 0;
      let spent = 0;
      b.items?.forEach((it) => {
        spent += Number(it.spentAmount) || 0;
      });
      totalSpent += spent;
    });

    const netRemaining = totalAllocated - totalSpent;
    return {
      count: budgetList.length,
      totalAllocated,
      totalSpent,
      netRemaining,
    };
  }, [budgetList]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/budget">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">Budget History</h1>
          <p className="text-xs text-muted-foreground">
            Audit and compare your past zero-based monthly budgets
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-card border-border">
          <span className="text-xs font-medium text-muted-foreground">Budgets Tracked</span>
          <div className="mt-2">
            <span className="text-2xl font-bold text-foreground">{stats.count}</span>
            <p className="text-[11px] text-muted-foreground mt-0.5">Recorded periods</p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <span className="text-xs font-medium text-muted-foreground">Total Budgeted</span>
          <div className="mt-2">
            <span className="text-2xl font-bold text-foreground">
              {formatCurrency(stats.totalAllocated)}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">Across all periods</p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <span className="text-xs font-medium text-muted-foreground">Total Expensed</span>
          <div className="mt-2">
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {formatCurrency(stats.totalSpent)}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">Actual debits</p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <span className="text-xs font-medium text-muted-foreground">Net Savings Envelope</span>
          <div className="mt-2">
            <span
              className={`text-2xl font-bold ${
                stats.netRemaining >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {stats.netRemaining >= 0 ? "+" : ""}
              {formatCurrency(stats.netRemaining)}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">Cumulative surplus</p>
          </div>
        </Card>
      </div>

      {/* Year Filter Toolbar */}
      <Card className="p-3 bg-card border-border flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">Filter Periods</span>
        <Select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          options={[
            { value: "ALL", label: "All Years" },
            ...availableYears.map((y) => ({ value: String(y), label: String(y) })),
          ]}
          className="h-8 text-xs w-36"
        />
      </Card>

      {/* History Table */}
      <Card className="border-border overflow-hidden">
        <CardHeader className="py-3 px-4 border-b border-border bg-muted/20">
          <CardTitle className="text-sm font-semibold">Historical Budget Logs</CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : budgetList.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={History}
                title="No budget records found"
                description="You haven't generated any monthly budgets yet. Create your first budget to begin tracking."
                action={
                  <Link href="/budget">
                    <Button size="sm">Go to Monthly Budget</Button>
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead className="text-right">Allocated</TableHead>
                    <TableHead className="text-right">Spent</TableHead>
                    <TableHead className="text-right">Remaining</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgetList.map((b) => {
                    const monthName = MONTH_NAMES[b.month - 1];
                    const allocated = Number(b.allocatedAmount) || 0;
                    let spent = 0;
                    b.items?.forEach((it) => {
                      spent += Number(it.spentAmount) || 0;
                    });
                    const remaining = allocated - spent;
                    const usage = allocated > 0 ? (spent / allocated) * 100 : 0;
                    const isExceeded = spent > allocated;
                    const isWarning = usage >= 80 && !isExceeded;

                    return (
                      <TableRow key={b.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-semibold text-sm text-foreground">
                          {monthName} {b.year}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {b.budgetTemplate?.name || "Allocation Template"}
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
                        <TableCell className="text-center">
                          {isExceeded ? (
                            <Badge variant="destructive" className="text-[10px] py-0 px-2">
                              Exceeded
                            </Badge>
                          ) : isWarning ? (
                            <Badge
                              variant="outline"
                              className="text-[10px] py-0 px-2 text-amber-600 dark:text-amber-400 border-amber-400"
                            >
                              Warning ({usage.toFixed(0)}%)
                            </Badge>
                          ) : (
                            <Badge variant="success" className="text-[10px] py-0 px-2">
                              Normal ({usage.toFixed(0)}%)
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/budget/${b.id}`}>
                            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1">
                              View <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
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
