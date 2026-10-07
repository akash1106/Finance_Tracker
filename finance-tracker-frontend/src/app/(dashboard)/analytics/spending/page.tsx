"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  ShieldCheck,
  Filter,
  CheckCircle2,
  Info,
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
  Input,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  EmptyState,
} from "@/components/ui";
import { useSpendingTrends, useSpendingAnomalies } from "@/hooks/use-analytics";
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

export default function SpendingTrendsPage() {
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const queryParams = useMemo(() => {
    const p: { from?: string; to?: string } = {};
    if (fromDate) p.from = fromDate;
    if (toDate) p.to = toDate;
    return p;
  }, [fromDate, toDate]);

  const { data: trends, isLoading: isTrendsLoading } = useSpendingTrends(queryParams);
  const { data: anomalies, isLoading: isAnomaliesLoading } = useSpendingAnomalies(queryParams);

  const isLoading = isTrendsLoading || isAnomaliesLoading;

  // Compute key stats
  const stats = useMemo(() => {
    if (!trends || trends.length === 0) {
      return { total: 0, average: 0, peak: null, low: null, count: 0 };
    }
    const total = trends.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const average = total / trends.length;

    let peak = trends[0];
    let low = trends[0];

    for (const item of trends) {
      const amt = Number(item.amount) || 0;
      if (amt > (Number(peak.amount) || 0)) peak = item;
      if (amt < (Number(low.amount) || 0)) low = item;
    }

    return { total, average, peak, low, count: trends.length };
  }, [trends]);

  const anomalyMonths = useMemo(() => {
    return new Set(anomalies?.map((a) => a.month) || []);
  }, [anomalies]);

  const maxAmount = useMemo(() => {
    if (!trends || trends.length === 0) return 1;
    return Math.max(...trends.map((t) => Number(t.amount) || 0), 1);
  }, [trends]);

  const handleResetFilters = () => {
    setFromDate("");
    setToDate("");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Spending Trends & Anomalies"
        description="Track monthly burn-rate velocity and identify irregular spending spikes exceeding 150% of your baseline average"
      >
        <Link href="/analytics">
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <ArrowLeft className="h-4 w-4" /> Analytics Hub
          </Button>
        </Link>
      </PageHeader>

      {/* Date Filter Toolbar */}
      <Card className="p-3 bg-card border-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span>Date Range:</span>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="h-8 text-xs w-36"
              placeholder="From"
            />
            <span className="text-xs text-muted-foreground">to</span>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="h-8 text-xs w-36"
              placeholder="To"
            />
          </div>
          {(fromDate || toDate) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5 text-primary" />
          <span>Anomaly Threshold: &gt; 150% of Average</span>
        </div>
      </Card>

      {/* Summary KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Average Monthly Burn
            </span>
            <div className="mt-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {formatCurrency(stats.average)}
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                Across {stats.count} tracked {stats.count === 1 ? "month" : "months"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Peak Spending Month
            </span>
            <div className="mt-2">
              <span className="text-2xl font-bold tracking-tight text-rose-500">
                {stats.peak ? formatCurrency(stats.peak.amount) : "₹0"}
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.peak ? formatMonthKey(stats.peak.month) : "No data"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Lowest Spending Month
            </span>
            <div className="mt-2">
              <span className="text-2xl font-bold tracking-tight text-emerald-500">
                {stats.low ? formatCurrency(stats.low.amount) : "₹0"}
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.low ? formatMonthKey(stats.low.month) : "No data"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Detected Anomalies
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span
                className={`text-2xl font-bold tracking-tight ${
                  (anomalies?.length ?? 0) > 0 ? "text-amber-500" : "text-emerald-500"
                }`}
              >
                {anomalies?.length ?? 0}
              </span>
              <Badge
                variant={(anomalies?.length ?? 0) > 0 ? "secondary" : "default"}
                className="text-[10px] px-1.5 py-0"
              >
                {(anomalies?.length ?? 0) > 0 ? "Spikes Flagged" : "Normal"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {(anomalies?.length ?? 0) > 0
                ? "Months with spending > 1.5x average"
                : "All months within standard thresholds"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Visual Monthly Timeline */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Monthly Outflow Timeline & Baseline</CardTitle>
          <CardDescription className="text-xs">
            Bar height relative to maximum recorded monthly expense ({formatCurrency(maxAmount)}). Dashed line indicates the {formatCurrency(stats.average)} benchmark.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-56 flex items-center justify-center">
              <Skeleton className="h-44 w-full" />
            </div>
          ) : !trends || trends.length === 0 ? (
            <EmptyState
              title="No spending data in selected range"
              description="Adjust date filters or record expense transactions to generate spending trend analytics."
            />
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {trends.map((item) => {
                  const amt = Number(item.amount) || 0;
                  const isAnomaly = anomalyMonths.has(item.month);
                  const heightPct = Math.max(14, Math.round((amt / maxAmount) * 100));
                  const isAboveAvg = amt > stats.average;

                  return (
                    <div
                      key={item.month}
                      className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                        isAnomaly
                          ? "border-amber-500/50 bg-amber-500/5 hover:border-amber-500"
                          : "border-border bg-card/60 hover:bg-accent/40"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className="text-xs font-semibold text-foreground">
                          {formatMonthKey(item.month)}
                        </span>
                        {isAnomaly && (
                          <Badge variant="destructive" className="text-[9px] px-1.5 py-0 uppercase">
                            Spike
                          </Badge>
                        )}
                      </div>

                      {/* Bar Visualization */}
                      <div className="h-28 w-full flex items-end justify-center py-2 relative">
                        <div
                          className={`w-full max-w-[32px] rounded-t-md transition-all ${
                            isAnomaly
                              ? "bg-rose-500 hover:bg-rose-400"
                              : isAboveAvg
                              ? "bg-primary hover:bg-primary/90"
                              : "bg-primary/60 hover:bg-primary/80"
                          }`}
                          style={{ height: `${heightPct}%` }}
                          title={`${formatMonthKey(item.month)}: ${formatCurrency(amt)}`}
                        />
                      </div>

                      <div className="mt-2 text-center border-t border-border/50 pt-1.5">
                        <span className="text-xs font-bold text-foreground block truncate">
                          {formatCurrency(amt)}
                        </span>
                        <span
                          className={`text-[10px] font-medium ${
                            amt >= stats.average ? "text-rose-500" : "text-emerald-500"
                          }`}
                        >
                          {amt >= stats.average
                            ? `+${formatCurrency(amt - stats.average)}`
                            : `-${formatCurrency(stats.average - amt)}`}
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

      {/* Spending Anomalies Diagnostic Table */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Detected Spending Anomalies Ledger
            </CardTitle>
            <CardDescription className="text-xs">
              Algorithmic detection flags months where expenses surge beyond 1.5x of your average monthly spending.
            </CardDescription>
          </div>
          {anomalies && anomalies.length > 0 && (
            <Badge variant="destructive" className="text-xs">
              {anomalies.length} Anomaly {anomalies.length === 1 ? "Period" : "Periods"}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {isAnomaliesLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !anomalies || anomalies.length === 0 ? (
            <div className="py-8 text-center flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-foreground">No Spending Anomalies Detected</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                All recorded monthly expenses are within normal historical variance boundaries. No extreme spikes identified.
              </p>
            </div>
          ) : (
            <div className="rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Actual Spending</TableHead>
                    <TableHead>Benchmark Average</TableHead>
                    <TableHead>Surge Delta</TableHead>
                    <TableHead>Deviation %</TableHead>
                    <TableHead className="text-right">Risk Assessment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {anomalies.map((anom) => {
                    const actual = Number(anom.amount) || 0;
                    const avg = Number(anom.average) || 0;
                    const delta = actual - avg;
                    const pctOver = avg > 0 ? ((delta / avg) * 100).toFixed(1) : "0";
                    const isExtreme = Number(pctOver) >= 100;

                    return (
                      <TableRow key={anom.month} className="hover:bg-amber-500/5">
                        <TableCell className="font-semibold text-foreground">
                          {formatMonthKey(anom.month)}
                        </TableCell>
                        <TableCell className="font-bold text-rose-500">
                          {formatCurrency(actual)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatCurrency(avg)}
                        </TableCell>
                        <TableCell className="font-medium text-rose-500">
                          +{formatCurrency(delta)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive" className="text-xs">
                            +{pctOver}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`text-xs font-semibold ${
                              isExtreme ? "text-rose-500" : "text-amber-500"
                            }`}
                          >
                            {isExtreme ? "Severe Outlier (>2x Average)" : "Significant Spike (>1.5x Average)"}
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

      {/* Complete Historical Monthly Ledger */}
      {trends && trends.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Complete Monthly Breakdown Ledger</CardTitle>
            <CardDescription className="text-xs">
              Chronological log of monthly outlays and variance relative to historical mean
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Total Spending</TableHead>
                    <TableHead>Status vs Average</TableHead>
                    <TableHead>Variance vs Baseline</TableHead>
                    <TableHead className="text-right">Share of Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trends.map((item) => {
                    const amt = Number(item.amount) || 0;
                    const isAnomaly = anomalyMonths.has(item.month);
                    const isAbove = amt >= stats.average;
                    const diff = amt - stats.average;
                    const share = stats.total > 0 ? ((amt / stats.total) * 100).toFixed(1) : "0";

                    return (
                      <TableRow key={item.month}>
                        <TableCell className="font-medium text-foreground">
                          {formatMonthKey(item.month)}
                        </TableCell>
                        <TableCell className="font-semibold text-foreground">
                          {formatCurrency(amt)}
                        </TableCell>
                        <TableCell>
                          {isAnomaly ? (
                            <Badge variant="destructive" className="text-[10px]">
                              Anomaly Spike
                            </Badge>
                          ) : isAbove ? (
                            <Badge variant="secondary" className="text-[10px]">
                              Above Average
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30">
                              Below Average
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell
                          className={`font-medium ${
                            isAbove ? "text-rose-500" : "text-emerald-500"
                          }`}
                        >
                          {isAbove ? `+${formatCurrency(diff)}` : `-${formatCurrency(Math.abs(diff))}`}
                        </TableCell>
                        <TableCell className="text-right font-medium text-muted-foreground">
                          {share}%
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
