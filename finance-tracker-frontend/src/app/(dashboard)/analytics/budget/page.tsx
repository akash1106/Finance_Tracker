"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  PieChart,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  PiggyBank,
  Repeat,
  Plus,
  ArrowRight,
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
  Select,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  EmptyState,
} from "@/components/ui";
import {
  useBudgetPerformance,
  useSavingsRate,
  useFixedExpenseRatio,
} from "@/hooks/use-analytics";
import { formatCurrency } from "@/lib/formatters/currency";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function BudgetPerformancePage() {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);

  const queryParams = useMemo(() => ({
    year: selectedYear,
    month: selectedMonth,
  }), [selectedYear, selectedMonth]);

  const { data: rawPerformance, isLoading: isPerfLoading } = useBudgetPerformance(queryParams);
  const { data: savingsData, isLoading: isSavingsLoading } = useSavingsRate();
  const { data: fixedExpenseData, isLoading: isFixedLoading } = useFixedExpenseRatio();

  const items = useMemo(() => rawPerformance || [], [rawPerformance]);

  // Aggregate budget performance
  const totals = useMemo(() => {
    let allocated = 0;
    let spent = 0;
    let overBudgetCount = 0;

    items.forEach((item) => {
      const a = Number(item.allocated) || 0;
      const s = Number(item.spent) || 0;
      allocated += a;
      spent += s;
      if (s > a) overBudgetCount += 1;
    });

    const variance = allocated - spent;
    const utilization = allocated > 0 ? (spent / allocated) * 100 : 0;

    return { allocated, spent, variance, utilization, overBudgetCount };
  }, [items]);

  const savingsRate = Number(savingsData?.savingsRate ?? 0);
  const fixedRatio = Number(fixedExpenseData?.fixedExpenseRatio ?? 0);

  const currentYear = now.getFullYear();
  const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Budget Performance — ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`}
        description="Monitor category spending velocity against planned monthly allocations with real-time variance detection"
      >
        <Link href="/analytics">
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <ArrowLeft className="h-4 w-4" /> Analytics Hub
          </Button>
        </Link>
      </PageHeader>

      {/* Date Filters Control Card */}
      <Card className="p-3 bg-card border-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span>Select Target Period:</span>
          </div>

          <div className="w-40">
            <Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="h-8 text-xs"
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={name} value={idx + 1}>
                  {name}
                </option>
              ))}
            </Select>
          </div>

          <div className="w-32">
            <Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="h-8 text-xs"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <Link href="/budget">
          <Button variant="ghost" size="sm" className="text-xs text-primary gap-1">
            Manage Monthly Budgets <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </Card>

      {/* Summary KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Budget Envelope
            </span>
            <div className="mt-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {formatCurrency(totals.allocated)}
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                {items.length} budgeted categories
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Actual Outflow Spent
            </span>
            <div className="mt-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {formatCurrency(totals.spent)}
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                {totals.utilization.toFixed(1)}% of total allocated envelope
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Net Budget Variance
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span
                className={`text-2xl font-bold tracking-tight ${
                  totals.variance >= 0 ? "text-emerald-500" : "text-rose-500"
                }`}
              >
                {totals.variance >= 0 ? `+${formatCurrency(totals.variance)}` : `-${formatCurrency(Math.abs(totals.variance))}`}
              </span>
              <Badge
                variant={totals.variance >= 0 ? "default" : "destructive"}
                className="text-[10px] px-1.5 py-0"
              >
                {totals.variance >= 0 ? "Surplus" : "Deficit"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totals.variance >= 0 ? "Under overall budget cap" : "Over planned limit"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Over-Budget Alerts
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span
                className={`text-2xl font-bold tracking-tight ${
                  totals.overBudgetCount > 0 ? "text-rose-500" : "text-emerald-500"
                }`}
              >
                {totals.overBudgetCount}
              </span>
              <Badge
                variant={totals.overBudgetCount > 0 ? "destructive" : "default"}
                className="text-[10px] px-1.5 py-0"
              >
                {totals.overBudgetCount > 0 ? "Breached Caps" : "All Compliant"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totals.overBudgetCount > 0
                ? "Categories with spend > allocated"
                : "No categories exceeded limit"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Structural Wealth Cards: Savings Rate & Fixed Overhead */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <PiggyBank className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Savings Retention Rate
                </span>
                <span className="text-sm font-bold text-foreground">{savingsRate.toFixed(1)}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${Math.min(100, savingsRate)}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                Saved {formatCurrency(savingsData?.savings ?? 0)} out of {formatCurrency(savingsData?.income ?? 0)} total logged income.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
              <Repeat className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Fixed Obligation Ratio
                </span>
                <span className="text-sm font-bold text-foreground">{fixedRatio.toFixed(1)}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full rounded-full ${
                    fixedRatio <= 50 ? "bg-sky-500" : "bg-amber-500"
                  }`}
                  style={{ width: `${Math.min(100, fixedRatio)}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                Fixed costs {formatCurrency(fixedExpenseData?.fixedExpenses ?? 0)} of {formatCurrency(fixedExpenseData?.expenses ?? 0)} total outflows.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Performance Matrix */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Category Budget Variance Matrix</CardTitle>
            <CardDescription className="text-xs">
              Allocated envelopes versus real expenditure transactions for {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
            </CardDescription>
          </div>
          <Link href="/budget">
            <Button size="sm" variant="outline" className="text-xs gap-1">
              <Plus className="h-3.5 w-3.5" /> Adjust Budget
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isPerfLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                <PieChart className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                No Budget Configured for {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mb-4">
                Create a monthly budget or generate one from your templates to enable variance performance tracking.
              </p>
              <Link href="/budget">
                <Button size="sm" className="gap-2 text-xs">
                  <Plus className="h-4 w-4" /> Create Budget for This Month
                </Button>
              </Link>
            </div>
          ) : (
            <div className="rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Allocated</TableHead>
                    <TableHead>Actual Spent</TableHead>
                    <TableHead>Variance (+Surplus / -Deficit)</TableHead>
                    <TableHead className="min-w-[140px]">Utilization</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => {
                    const allocated = Number(item.allocated) || 0;
                    const spent = Number(item.spent) || 0;
                    const variance = allocated - spent;
                    const utilizationPct = allocated > 0 ? (spent / allocated) * 100 : 0;
                    const isOver = spent > allocated;
                    const isWarning = !isOver && utilizationPct >= 80;

                    return (
                      <TableRow key={item.categoryId || item.budgetId}>
                        <TableCell className="font-semibold text-foreground">
                          {item.categoryName || "General Category"}
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          {formatCurrency(allocated)}
                        </TableCell>
                        <TableCell className="font-bold text-foreground">
                          {formatCurrency(spent)}
                        </TableCell>
                        <TableCell
                          className={`font-semibold ${
                            variance >= 0 ? "text-emerald-500" : "text-rose-500"
                          }`}
                        >
                          {variance >= 0 ? `+${formatCurrency(variance)}` : `-${formatCurrency(Math.abs(variance))}`}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  isOver ? "bg-rose-500" : isWarning ? "bg-amber-500" : "bg-emerald-500"
                                }`}
                                style={{ width: `${Math.min(100, Math.max(3, utilizationPct))}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-semibold text-muted-foreground block">
                              {utilizationPct.toFixed(1)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {isOver ? (
                            <Badge variant="destructive" className="text-[10px]">
                              Over Budget (-{formatCurrency(Math.abs(variance))})
                            </Badge>
                          ) : isWarning ? (
                            <Badge variant="secondary" className="text-[10px]">
                              Near Limit (&gt;80%)
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30">
                              On Track
                            </Badge>
                          )}
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
