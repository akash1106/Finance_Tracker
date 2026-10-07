"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Download,
  TrendingUp,
  TrendingDown,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Button,
  Select,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Skeleton,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui";
import { useYearlyReport } from "@/hooks/use-reports";
import { formatCurrency } from "@/lib/formatters/currency";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function YearlyReportPage() {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const { data: report, isLoading } = useYearlyReport({ year: selectedYear });
  const months = report?.months || [];

  // Compute yearly totals & highlights
  const yearlyMetrics = useMemo(() => {
    let totalIncome = 0;
    let totalExpenses = 0;
    let totalSavings = 0;
    let totalInvestments = 0;
    let bestMonth = 1;
    let maxSurplus = -Infinity;
    let peakExpenseMonth = 1;
    let maxExpenses = -Infinity;

    months.forEach((m) => {
      const inc = Number(m.income) || 0;
      const exp = Number(m.expenses) || 0;
      const sav = Number(m.savings) || 0;
      const inv = Number(m.investments) || 0;
      const surplus = Number(m.netCashFlow) || (inc - exp - sav - inv);

      totalIncome += inc;
      totalExpenses += exp;
      totalSavings += sav;
      totalInvestments += inv;

      if (surplus > maxSurplus) {
        maxSurplus = surplus;
        bestMonth = m.month;
      }
      if (exp > maxExpenses) {
        maxExpenses = exp;
        peakExpenseMonth = m.month;
      }
    });

    const netAnnualSurplus = totalIncome - totalExpenses - totalSavings - totalInvestments;
    const annualSavingsRate =
      totalIncome > 0
        ? Math.round(((totalSavings + totalInvestments) / totalIncome) * 100)
        : 0;

    return {
      totalIncome,
      totalExpenses,
      totalSavings,
      totalInvestments,
      netAnnualSurplus,
      annualSavingsRate,
      bestMonth: MONTH_NAMES[bestMonth - 1],
      peakExpenseMonth: MONTH_NAMES[peakExpenseMonth - 1],
    };
  }, [months]);

  const handleExportPdf = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
    window.open(`${apiUrl}/exports/yearly-report?year=${selectedYear}`, "_blank");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Annual Financial Statement — Calendar Year ${selectedYear}`}
        description="Comprehensive 12-month performance review, annual savings velocity, and cash generation"
      >
        <div className="flex items-center gap-2">
          <Link href="/reports">
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <ArrowLeft className="h-4 w-4" /> Reports Center
            </Button>
          </Link>
          <Button
            size="sm"
            variant="outline"
            className="gap-2 text-xs border-primary/30 text-primary hover:bg-primary/10"
            onClick={handleExportPdf}
          >
            <Download className="h-4 w-4" /> Export PDF
          </Button>
        </div>
      </PageHeader>

      {/* Year Selector */}
      <Card className="p-3 bg-card border-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">Financial Year:</span>
        </div>

        <Select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          options={[2024, 2025, 2026, 2027, 2028].map((y) => ({
            value: y,
            label: `Calendar Year ${y}`,
          }))}
          className="h-9 text-xs w-44"
        />
      </Card>

      {/* Annual Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Annual Income</span>
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(yearlyMetrics.totalIncome)}
              </span>
            )}
            <p className="text-[11px] text-muted-foreground mt-0.5">Total inflows</p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Annual Expenses</span>
            <div className="h-8 w-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <span className="text-xl font-bold text-rose-600 dark:text-rose-400">
                {formatCurrency(yearlyMetrics.totalExpenses)}
              </span>
            )}
            <p className="text-[11px] text-muted-foreground mt-0.5">Operating outflows</p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Wealth Accumulated</span>
            <div className="h-8 w-8 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {formatCurrency(yearlyMetrics.totalSavings + yearlyMetrics.totalInvestments)}
              </span>
            )}
            <p className="text-[11px] text-muted-foreground mt-0.5">Savings + Investments</p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Annual Surplus</span>
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center ${
                yearlyMetrics.netAnnualSurplus >= 0
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-rose-500/10 text-rose-500"
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <span
                className={`text-xl font-bold ${
                  yearlyMetrics.netAnnualSurplus >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {formatCurrency(yearlyMetrics.netAnnualSurplus)}
              </span>
            )}
            <p className="text-[11px] text-muted-foreground mt-0.5">Net bottom line</p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Annual Savings Rate</span>
            <div className="h-8 w-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <BarChart3 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <span className="text-xl font-bold text-foreground">
                {yearlyMetrics.annualSavingsRate}%
              </span>
            )}
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Best month: {yearlyMetrics.bestMonth}
            </p>
          </div>
        </Card>
      </div>

      {/* 12-Month Performance Table */}
      <Card className="border-border overflow-hidden bg-card">
        <CardHeader className="py-4 px-6 border-b border-border bg-muted/20 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">
              Monthly Financial Performance Comparison ({selectedYear})
            </CardTitle>
            <CardDescription className="text-xs">
              Full breakdown across each month of the calendar year
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs gap-1.5 h-8 text-muted-foreground hover:text-foreground"
            onClick={() => window.print()}
          >
            <Printer className="h-3.5 w-3.5" /> Print
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Income</TableHead>
                  <TableHead className="text-right">Expenses</TableHead>
                  <TableHead className="text-right">Savings</TableHead>
                  <TableHead className="text-right">Investments</TableHead>
                  <TableHead className="text-right">Net Surplus</TableHead>
                  <TableHead className="text-right">Wealth Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(12)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={7}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : months.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground text-xs">
                      No transaction records found for {selectedYear}.
                    </TableCell>
                  </TableRow>
                ) : (
                  months.map((m) => {
                    const inc = Number(m.income) || 0;
                    const exp = Number(m.expenses) || 0;
                    const sav = Number(m.savings) || 0;
                    const inv = Number(m.investments) || 0;
                    const surplus = Number(m.netCashFlow) || (inc - exp - sav - inv);
                    const rate = inc > 0 ? Math.round(((sav + inv) / inc) * 100) : 0;

                    return (
                      <TableRow key={m.month} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-semibold text-xs text-foreground whitespace-nowrap">
                          {MONTH_NAMES[m.month - 1]}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-emerald-600 dark:text-emerald-400">
                          {inc > 0 ? `+${formatCurrency(inc)}` : "—"}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-rose-600 dark:text-rose-400">
                          {exp > 0 ? `-${formatCurrency(exp)}` : "—"}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-blue-600 dark:text-blue-400">
                          {sav > 0 ? `-${formatCurrency(sav)}` : "—"}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-purple-600 dark:text-purple-400">
                          {inv > 0 ? `-${formatCurrency(inv)}` : "—"}
                        </TableCell>
                        <TableCell
                          className={`text-right font-mono text-xs font-bold ${
                            surplus >= 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {formatCurrency(surplus)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs font-medium">
                          {inc > 0 ? (
                            <Badge
                              variant="outline"
                              className={`text-[10px] py-0 px-1.5 ${
                                rate >= 30
                                  ? "text-emerald-600 border-emerald-500/30"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {rate}%
                            </Badge>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}

                {/* Annual Totals Summary Footer */}
                {!isLoading && months.length > 0 && (
                  <TableRow className="bg-muted/40 font-bold border-t-2 border-border">
                    <TableCell className="text-xs font-bold text-foreground">
                      Full Year Total ({selectedYear})
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                      +{formatCurrency(yearlyMetrics.totalIncome)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-rose-600 dark:text-rose-400 font-bold">
                      -{formatCurrency(yearlyMetrics.totalExpenses)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-blue-600 dark:text-blue-400 font-bold">
                      -{formatCurrency(yearlyMetrics.totalSavings)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-purple-600 dark:text-purple-400 font-bold">
                      -{formatCurrency(yearlyMetrics.totalInvestments)}
                    </TableCell>
                    <TableCell
                      className={`text-right font-mono text-xs font-bold ${
                        yearlyMetrics.netAnnualSurplus >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {formatCurrency(yearlyMetrics.netAnnualSurplus)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-bold">
                      {yearlyMetrics.annualSavingsRate}%
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
