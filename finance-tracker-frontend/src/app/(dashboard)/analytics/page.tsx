"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Repeat,
  AlertTriangle,
  ArrowRight,
  PieChart,
  BarChart3,
  Calendar,
  Layers,
  ShieldCheck,
  CheckCircle2,
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
} from "@/components/ui";
import {
  useSavingsRate,
  useFixedExpenseRatio,
  useSpendingTrends,
  useSpendingAnomalies,
  useIncomeGrowth,
} from "@/hooks/use-analytics";
import { formatCurrency } from "@/lib/formatters/currency";

function formatMonthKey(monthStr: string): string {
  if (!monthStr) return "";
  const parts = monthStr.split("-");
  if (parts.length !== 2) return monthStr;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function AnalyticsHubPage() {
  const { data: savingsData, isLoading: isSavingsLoading } = useSavingsRate();
  const { data: fixedExpenseData, isLoading: isFixedLoading } = useFixedExpenseRatio();
  const { data: spendingTrends, isLoading: isTrendsLoading } = useSpendingTrends();
  const { data: anomalies, isLoading: isAnomaliesLoading } = useSpendingAnomalies();
  const { data: incomeGrowthData, isLoading: isIncomeLoading } = useIncomeGrowth();

  const isLoading =
    isSavingsLoading || isFixedLoading || isTrendsLoading || isAnomaliesLoading || isIncomeLoading;

  const savingsRate = Number(savingsData?.savingsRate ?? 0);
  const fixedRatio = Number(fixedExpenseData?.fixedExpenseRatio ?? 0);

  // Latest income velocity
  const latestIncomeGrowth = useMemo(() => {
    if (!incomeGrowthData || incomeGrowthData.length === 0) return null;
    return incomeGrowthData[incomeGrowthData.length - 1];
  }, [incomeGrowthData]);

  // Max spending for bar scale
  const maxSpend = useMemo(() => {
    if (!spendingTrends || spendingTrends.length === 0) return 1;
    return Math.max(...spendingTrends.map((t) => Number(t.amount) || 0), 1);
  }, [spendingTrends]);

  // Average spending
  const avgSpend = useMemo(() => {
    if (!spendingTrends || spendingTrends.length === 0) return 0;
    const sum = spendingTrends.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
    return sum / spendingTrends.length;
  }, [spendingTrends]);

  const anomalySet = useMemo(() => {
    return new Set(anomalies?.map((a) => a.month) || []);
  }, [anomalies]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financial Intelligence & Analytics"
        description="Deep algorithmic analysis of your savings rate, fixed cost obligations, income trajectory, and spending anomalies"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/analytics/spending">
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <BarChart3 className="h-4 w-4 text-primary" /> Spending Trends
            </Button>
          </Link>
          <Link href="/analytics/categories">
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <Layers className="h-4 w-4 text-primary" /> Category Trends
            </Button>
          </Link>
          <Link href="/analytics/budget">
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <PieChart className="h-4 w-4 text-primary" /> Budget Performance
            </Button>
          </Link>
        </div>
      </PageHeader>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Savings Rate */}
        <Card className="bg-card border-border hover:border-border/80 transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Savings Rate
              </span>
              <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <PiggyBank className="h-5 w-5" />
              </div>
            </div>
            {isLoading ? (
              <div className="mt-3 space-y-2">
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-4 w-36" />
              </div>
            ) : (
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold tracking-tight text-foreground">
                    {savingsRate.toFixed(1)}%
                  </span>
                  <Badge
                    variant={savingsRate >= 20 ? "default" : savingsRate >= 10 ? "secondary" : "destructive"}
                    className="text-[10px] px-1.5 py-0"
                  >
                    {savingsRate >= 20 ? "Healthy (>20%)" : savingsRate >= 10 ? "Moderate" : "Low (<10%)"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Saved {formatCurrency(savingsData?.savings ?? 0)} of {formatCurrency(savingsData?.income ?? 0)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* KPI 2: Fixed Expense Ratio */}
        <Card className="bg-card border-border hover:border-border/80 transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Fixed Expense Ratio
              </span>
              <div className="h-9 w-9 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center">
                <Repeat className="h-5 w-5" />
              </div>
            </div>
            {isLoading ? (
              <div className="mt-3 space-y-2">
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-4 w-36" />
              </div>
            ) : (
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold tracking-tight text-foreground">
                    {fixedRatio.toFixed(1)}%
                  </span>
                  <Badge
                    variant={fixedRatio <= 50 ? "default" : fixedRatio <= 65 ? "secondary" : "destructive"}
                    className="text-[10px] px-1.5 py-0"
                  >
                    {fixedRatio <= 50 ? "Optimal (≤50%)" : fixedRatio <= 65 ? "Elevated" : "High (>65%)"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Fixed {formatCurrency(fixedExpenseData?.fixedExpenses ?? 0)} of {formatCurrency(fixedExpenseData?.expenses ?? 0)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* KPI 3: Income Velocity */}
        <Card className="bg-card border-border hover:border-border/80 transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Income Trajectory
              </span>
              <div className="h-9 w-9 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            {isLoading ? (
              <div className="mt-3 space-y-2">
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-4 w-36" />
              </div>
            ) : (
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold tracking-tight text-foreground">
                    {latestIncomeGrowth ? formatCurrency(latestIncomeGrowth.income) : "₹0"}
                  </span>
                  {latestIncomeGrowth && Number(latestIncomeGrowth.growth) !== 0 && (
                    <Badge
                      variant={Number(latestIncomeGrowth.growth) > 0 ? "default" : "destructive"}
                      className="text-[10px] px-1.5 py-0"
                    >
                      {Number(latestIncomeGrowth.growth) > 0 ? "+" : ""}
                      {Number(latestIncomeGrowth.growth).toFixed(1)}%
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {latestIncomeGrowth
                    ? `Latest month: ${formatMonthKey(latestIncomeGrowth.month)}`
                    : "No income data logged yet"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* KPI 4: Spending Anomalies */}
        <Card className="bg-card border-border hover:border-border/80 transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Anomaly Detection
              </span>
              <div
                className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                  (anomalies?.length ?? 0) > 0
                    ? "bg-amber-500/10 text-amber-500"
                    : "bg-emerald-500/10 text-emerald-500"
                }`}
              >
                {(anomalies?.length ?? 0) > 0 ? (
                  <AlertTriangle className="h-5 w-5" />
                ) : (
                  <ShieldCheck className="h-5 w-5" />
                )}
              </div>
            </div>
            {isLoading ? (
              <div className="mt-3 space-y-2">
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-4 w-36" />
              </div>
            ) : (
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold tracking-tight text-foreground">
                    {anomalies?.length ?? 0}
                  </span>
                  <Badge
                    variant={(anomalies?.length ?? 0) > 0 ? "secondary" : "default"}
                    className="text-[10px] px-1.5 py-0"
                  >
                    {(anomalies?.length ?? 0) > 0 ? "Flagged Periods" : "Clean Pattern"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {(anomalies?.length ?? 0) > 0
                    ? `Spikes exceeding 150% historical average`
                    : "No irregular spending spikes"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Anomaly Alert Banner if anomalies detected */}
      {anomalies && anomalies.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-500 shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  {anomalies.length} Irregular Spending {anomalies.length === 1 ? "Month" : "Months"} Detected
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Spending significantly deviated from your baseline average during{" "}
                  {anomalies.map((a) => formatMonthKey(a.month)).join(", ")}.
                </p>
              </div>
            </div>
            <Link href="/analytics/spending">
              <Button size="sm" variant="outline" className="text-xs shrink-0 border-amber-500/40 hover:bg-amber-500/10 gap-1.5">
                Investigate Anomalies <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Spending Trend Burn-Rate Overview */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base font-semibold">Spending Velocity & Burn Rate</CardTitle>
            <CardDescription className="text-xs">
              Month-over-month total expense trajectory against your historical average ({formatCurrency(avgSpend)})
            </CardDescription>
          </div>
          <Link href="/analytics/spending">
            <Button variant="ghost" size="sm" className="text-xs gap-1 text-primary">
              View Full Trend <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-44 flex items-center justify-center">
              <Skeleton className="h-36 w-full" />
            </div>
          ) : !spendingTrends || spendingTrends.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No spending history logged yet to compute velocity.
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {spendingTrends.map((trend) => {
                  const amount = Number(trend.amount) || 0;
                  const isAnomaly = anomalySet.has(trend.month);
                  const heightPct = Math.max(12, Math.round((amount / maxSpend) * 100));

                  return (
                    <div
                      key={trend.month}
                      className="p-3 rounded-lg border border-border/70 bg-card/60 hover:bg-accent/30 transition-all flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className="text-xs font-medium text-foreground">
                          {formatMonthKey(trend.month)}
                        </span>
                        {isAnomaly && (
                          <Badge variant="destructive" className="text-[9px] px-1 py-0">
                            Spike
                          </Badge>
                        )}
                      </div>

                      {/* Visual bar container */}
                      <div className="h-20 w-full flex items-end justify-center py-1">
                        <div
                          className={`w-full max-w-[28px] rounded-t transition-all ${
                            isAnomaly
                              ? "bg-rose-500 hover:bg-rose-400"
                              : "bg-primary/80 hover:bg-primary"
                          }`}
                          style={{ height: `${heightPct}%` }}
                          title={`${formatMonthKey(trend.month)}: ${formatCurrency(amount)}`}
                        />
                      </div>

                      <div className="mt-2 text-center">
                        <span className="text-xs font-semibold text-foreground block truncate">
                          {formatCurrency(amount)}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {amount >= avgSpend ? `+${formatCurrency(amount - avgSpend)}` : `-${formatCurrency(avgSpend - amount)}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Structural Allocation Analysis: 50 / 30 / 20 Rule Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Budget Architecture (50/30/20 Rule)</CardTitle>
            <CardDescription className="text-xs">
              Benchmark comparison of your essential fixed overhead and savings allocation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Metric 1: Needs / Fixed Expenses */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-foreground flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-sky-500" />
                  Fixed Obligations (Benchmark: ≤ 50%)
                </span>
                <span className="font-semibold text-foreground">{fixedRatio.toFixed(1)}%</span>
              </div>
              <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    fixedRatio <= 50 ? "bg-sky-500" : fixedRatio <= 65 ? "bg-amber-500" : "bg-rose-500"
                  }`}
                  style={{ width: `${Math.min(100, fixedRatio)}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                {fixedRatio <= 50
                  ? "Well structured. Your fixed recurring expenses leave ample flexibility."
                  : "Fixed obligations are elevated. Consider reviewing recurring subscriptions and commitments."}
              </p>
            </div>

            {/* Metric 2: Savings & Investment */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-foreground flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  Wealth Accumulation (Benchmark: ≥ 20%)
                </span>
                <span className="font-semibold text-foreground">{savingsRate.toFixed(1)}%</span>
              </div>
              <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    savingsRate >= 20 ? "bg-emerald-500" : savingsRate >= 10 ? "bg-amber-500" : "bg-rose-500"
                  }`}
                  style={{ width: `${Math.min(100, savingsRate)}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                {savingsRate >= 20
                  ? "Outstanding wealth retention. You are meeting or exceeding the 20% goal."
                  : "Below target. Directing a fixed percentage of salary immediately upon receipt will boost this metric."}
              </p>
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Fixed Obligations Total:</span>
              <span className="font-semibold text-foreground">{formatCurrency(fixedExpenseData?.fixedExpenses ?? 0)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Savings Accumulated:</span>
              <span className="font-semibold text-emerald-500">{formatCurrency(savingsData?.savings ?? 0)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Deep Dive Hub Cards */}
        <div className="grid grid-cols-1 gap-4">
          <Link href="/analytics/spending">
            <Card className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer h-full">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Spending Trends & Anomalies</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Explore monthly expenditure curves, benchmark deviation algorithms, and historical peaks.
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/analytics/categories">
            <Card className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer h-full">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-500 shrink-0">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Category Trends Matrix</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Analyze which spending categories are expanding or contracting across multi-month cycles.
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/analytics/budget">
            <Card className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer h-full">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
                    <PieChart className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Budget Performance & Variance</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Real-time variance analysis of budget allocations versus actual transaction outflows.
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
