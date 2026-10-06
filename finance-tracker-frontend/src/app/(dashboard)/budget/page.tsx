"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  PieChart,
  Plus,
  Sliders,
  History,
  FolderTree,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Wallet,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Progress,
  Skeleton,
  EmptyState,
  Select,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui";
import {
  useMonthlyBudgets,
  useBudgetSummary,
  useBudgetTemplates,
  useGenerateBudget,
} from "@/hooks/use-budget";
import { useIncome } from "@/hooks/use-income";
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

export default function BudgetOverviewPage() {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(now.getUTCFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getUTCMonth() + 1);

  // Modal state
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedIncomeId, setSelectedIncomeId] = useState<string>("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  // Queries
  const { data: budgets, isLoading: isBudgetsLoading } = useMonthlyBudgets({
    year: selectedYear,
    month: selectedMonth,
  });

  const activeBudget = budgets && budgets.length > 0 ? budgets[0] : null;

  const { data: summaryData, isLoading: isSummaryLoading } = useBudgetSummary(
    activeBudget?.id || ""
  );

  const { data: templatesData, isLoading: isTemplatesLoading } = useBudgetTemplates();
  const { data: incomeData, isLoading: isIncomeLoading } = useIncome();
  const generateBudgetMutation = useGenerateBudget();

  const templates = templatesData || [];
  const incomeItems = incomeData?.items || [];

  // Find selected income item for preview in modal
  const chosenIncome = useMemo(
    () => incomeItems.find((inc) => inc.id === selectedIncomeId),
    [incomeItems, selectedIncomeId]
  );

  // Find selected template for preview in modal
  const chosenTemplate = useMemo(
    () => templates.find((tpl) => tpl.id === selectedTemplateId),
    [templates, selectedTemplateId]
  );

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const handleOpenGenerateModal = () => {
    // Preselect salary income and default template if available
    const salaryIncome = incomeItems.find(
      (i) => i.incomeSource?.isSalary || i.incomeSource?.name?.toLowerCase().includes("salary")
    );
    if (salaryIncome && !selectedIncomeId) {
      setSelectedIncomeId(salaryIncome.id);
    } else if (incomeItems.length > 0 && !selectedIncomeId) {
      setSelectedIncomeId(incomeItems[0].id);
    }

    if (templates.length > 0 && !selectedTemplateId) {
      setSelectedTemplateId(templates[0].id);
    }

    setIsGenerateModalOpen(true);
  };

  const handleGenerateBudget = async () => {
    if (!selectedIncomeId || !selectedTemplateId) return;

    await generateBudgetMutation.mutateAsync({
      incomeTransactionId: selectedIncomeId,
      budgetTemplateId: selectedTemplateId,
      month: selectedMonth,
      year: selectedYear,
    });

    setIsGenerateModalOpen(false);
  };

  const monthLabel = `${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`;

  const allocatedTotal = Number(summaryData?.allocated ?? activeBudget?.allocatedAmount ?? 0);
  const spentTotal = Number(summaryData?.spent ?? 0);
  const remainingTotal = Number(summaryData?.remaining ?? (allocatedTotal - spentTotal));
  const percentUsed = Number(summaryData?.percentageUsed ?? (allocatedTotal > 0 ? (spentTotal / allocatedTotal) * 100 : 0));
  const budgetStatus = summaryData?.status ?? (percentUsed >= 100 ? "EXCEEDED" : percentUsed >= 80 ? "WARNING" : "NORMAL");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Monthly Budget"
        description="Monitor zero-based budget limits, category utilization, and spending thresholds"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/budget/history">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <History className="h-4 w-4" /> History
            </Button>
          </Link>
          <Link href="/budget/templates">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <FolderTree className="h-4 w-4" /> Templates
            </Button>
          </Link>
          <Link href="/budget/allocation">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Sliders className="h-4 w-4" /> Configurator
            </Button>
          </Link>
          <Button
            size="sm"
            className="gap-1.5 text-xs"
            onClick={handleOpenGenerateModal}
          >
            <Plus className="h-4 w-4" /> Generate Budget
          </Button>
        </div>
      </PageHeader>

      {/* Month Navigator Toolbar */}
      <Card className="p-3 bg-card border-border flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handlePrevMonth}
            title="Previous Month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-semibold text-base text-foreground min-w-36 text-center">
            {monthLabel}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleNextMonth}
            title="Next Month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Select
            value={String(selectedMonth)}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            options={MONTH_NAMES.map((name, i) => ({
              value: String(i + 1),
              label: name,
            }))}
            className="h-8 text-xs w-36"
          />
          <Select
            value={String(selectedYear)}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            options={[selectedYear - 1, selectedYear, selectedYear + 1].map((yr) => ({
              value: String(yr),
              label: String(yr),
            }))}
            className="h-8 text-xs w-28"
          />
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => {
              setSelectedMonth(now.getUTCMonth() + 1);
              setSelectedYear(now.getUTCFullYear());
            }}
          >
            Current Month
          </Button>
        </div>
      </Card>

      {/* Main Budget View */}
      {isBudgetsLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : !activeBudget ? (
        <Card className="p-8 border-border">
          <EmptyState
            icon={PieChart}
            title={`No budget created for ${monthLabel}`}
            description="You haven't allocated a monthly budget for this period yet. Generate a zero-based budget using your salary and allocation template."
            action={
              <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
                <Button onClick={handleOpenGenerateModal} className="gap-2">
                  <Plus className="h-4 w-4" /> Generate {monthLabel} Budget
                </Button>
                <Link href="/budget/allocation">
                  <Button variant="outline" className="gap-2">
                    <Sliders className="h-4 w-4" /> Configure Allocations
                  </Button>
                </Link>
              </div>
            }
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Allocated */}
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
                  From {activeBudget.budgetTemplate?.name || "Allocation Template"}
                </p>
              </div>
            </Card>

            {/* Total Spent */}
            <Card className="p-4 bg-card border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Total Spent</span>
                <div className="h-8 w-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
                  <TrendingDown className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                  {formatCurrency(spentTotal)}
                </span>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Across tracked categories
                </p>
              </div>
            </Card>

            {/* Remaining Balance */}
            <Card className="p-4 bg-card border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Remaining Budget</span>
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
                  {remainingTotal >= 0 ? "Available to spend" : "Budget exceeded!"}
                </p>
              </div>
            </Card>

            {/* Utilization & Status */}
            <Card className="p-4 bg-card border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Budget Utilization</span>
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
                  <span className="text-xs text-muted-foreground">used</span>
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

          {/* Category Budget Progress Grid */}
          <Card className="border-border">
            <CardHeader className="py-4 px-5 border-b border-border flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Category Allocations</CardTitle>
                <CardDescription className="text-xs">
                  Spending limits and live balances per category for {monthLabel}
                </CardDescription>
              </div>
              <Link href={`/budget/${activeBudget.id}`}>
                <Button variant="ghost" size="sm" className="text-xs text-primary gap-1">
                  Full Breakdown <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardHeader>

            <CardContent className="p-5">
              {isSummaryLoading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))}
                </div>
              ) : !summaryData?.items || summaryData.items.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No category items configured for this budget.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {summaryData.items.map((item: MonthlyBudgetItem) => {
                    const allocated = Number(item.allocatedAmount) || 0;
                    const spent = Number(item.spentAmount) || 0;
                    const remaining = allocated - spent;
                    const usage = allocated > 0 ? (spent / allocated) * 100 : 0;
                    const isExceeded = spent > allocated;
                    const isWarning = usage >= 80 && !isExceeded;

                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isExceeded
                            ? "bg-rose-500/5 border-rose-500/30 dark:bg-rose-950/10"
                            : isWarning
                            ? "bg-amber-500/5 border-amber-500/30 dark:bg-amber-950/10"
                            : "bg-muted/30 border-border hover:border-primary/40"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-foreground">
                                {item.category?.name || "General"}
                              </span>
                              {isExceeded ? (
                                <Badge variant="destructive" className="text-[10px] py-0 px-1.5">
                                  Exceeded
                                </Badge>
                              ) : isWarning ? (
                                <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-amber-600 dark:text-amber-400 border-amber-400">
                                  Warning (80%+)
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                                  Normal
                                </Badge>
                              )}
                            </div>
                            <span className="text-[11px] text-muted-foreground mt-0.5 block">
                              Target: {item.percentage ? `${item.percentage}%` : "Allocated"}
                            </span>
                          </div>

                          <div className="text-right">
                            <span
                              className={`text-sm font-bold ${
                                isExceeded
                                  ? "text-rose-600 dark:text-rose-400"
                                  : "text-foreground"
                              }`}
                            >
                              {formatCurrency(spent)}
                            </span>
                            <span className="text-xs text-muted-foreground block">
                              of {formatCurrency(allocated)}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-3 space-y-1.5">
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
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-muted-foreground">
                              {usage.toFixed(1)}% spent
                            </span>
                            <span
                              className={`font-medium ${
                                isExceeded
                                  ? "text-rose-600 dark:text-rose-400"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {isExceeded
                                ? `+${formatCurrency(spent - allocated)} exceeded`
                                : `${formatCurrency(remaining)} remaining`}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Generate Budget Modal Dialog */}
      <Dialog open={isGenerateModalOpen} onOpenChange={setIsGenerateModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Generate Monthly Budget</DialogTitle>
            <DialogDescription>
              Divide your received salary into automated budget allocations for {monthLabel}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Step 1: Select Income */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Select Salary / Income Deposit
              </label>
              {incomeItems.length === 0 ? (
                <div className="p-3 text-xs bg-muted/40 rounded-lg text-muted-foreground">
                  No income transactions found. Please record a salary deposit under{" "}
                  <Link href="/income/new" className="text-primary underline">
                    Income
                  </Link>{" "}
                  first.
                </div>
              ) : (
                <Select
                  value={selectedIncomeId}
                  onChange={(e) => setSelectedIncomeId(e.target.value)}
                  options={[
                    { value: "", label: "Choose an income transaction..." },
                    ...incomeItems.map((inc) => ({
                      value: inc.id,
                      label: `${inc.incomeSource?.name || "Income"} — ${formatCurrency(
                        inc.amount
                      )} (${formatDate(inc.receivedDate, "dd MMM yyyy")})`,
                    })),
                  ]}
                />
              )}
            </div>

            {/* Step 2: Select Budget Template */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Select Allocation Template (100% Zero-Based)
              </label>
              {templates.length === 0 ? (
                <div className="p-3 text-xs bg-muted/40 rounded-lg text-muted-foreground">
                  No budget templates found. Please configure an allocation template under{" "}
                  <Link href="/budget/allocation" className="text-primary underline">
                    Configurator
                  </Link>{" "}
                  first.
                </div>
              ) : (
                <Select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  options={[
                    { value: "", label: "Choose an allocation template..." },
                    ...templates.map((tpl) => ({
                      value: tpl.id,
                      label: `${tpl.name} (${tpl.items?.length || 0} categories)`,
                    })),
                  ]}
                />
              )}
            </div>

            {/* Allocation Preview */}
            {chosenIncome && chosenTemplate && (
              <div className="p-3 rounded-xl bg-muted/30 border border-border space-y-2">
                <span className="text-xs font-semibold text-foreground block">
                  Allocation Breakdown Preview ({formatCurrency(chosenIncome.amount)})
                </span>
                <div className="max-h-40 overflow-y-auto space-y-1.5 text-xs pr-1">
                  {chosenTemplate.items?.map((item) => {
                    const pct = Number(item.percentage) || 0;
                    const allocatedVal = (Number(chosenIncome.amount) * pct) / 100;
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-1 border-b border-border/50 last:border-0"
                      >
                        <span className="text-muted-foreground">
                          {item.category?.name || "Category"} ({pct}%)
                        </span>
                        <span className="font-semibold text-foreground">
                          {formatCurrency(allocatedVal)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleGenerateBudget}
              disabled={
                !selectedIncomeId ||
                !selectedTemplateId ||
                generateBudgetMutation.isPending
              }
              isLoading={generateBudgetMutation.isPending}
            >
              Generate Budget
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
