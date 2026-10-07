"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Download,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  LineChart,
  Wallet,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Printer,
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
import { useMonthlyReport } from "@/hooks/use-reports";
import { formatCurrency } from "@/lib/formatters/currency";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function MonthlyReportPage() {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);

  const { data: report, isLoading } = useMonthlyReport({
    year: selectedYear,
    month: selectedMonth,
  });

  const income = Number(report?.income ?? 0);
  const expenses = Number(report?.expenses ?? 0);
  const savings = Number(report?.savings ?? 0);
  const investments = Number(report?.investments ?? 0);
  const netSurplus = Number(report?.netCashFlow ?? (income - expenses - savings - investments));

  // Compute percentage allocations of income
  const expensesPct = income > 0 ? ((expenses / income) * 100).toFixed(1) : "0";
  const savingsPct = income > 0 ? ((savings / income) * 100).toFixed(1) : "0";
  const investmentsPct = income > 0 ? ((investments / income) * 100).toFixed(1) : "0";
  const surplusPct = income > 0 ? ((netSurplus / income) * 100).toFixed(1) : "0";

  const handleExportPdf = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
    const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
    window.open(
      `${apiUrl}/exports/monthly-report?year=${selectedYear}&month=${selectedMonth}`,
      "_blank"
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Monthly Financial Statement — ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`}
        description="Comprehensive monthly profit, loss, savings rate, and capital deployment breakdown"
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

      {/* Date Controls Bar */}
      <Card className="p-3 bg-card border-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">Statement Period:</span>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            options={MONTH_NAMES.map((m, idx) => ({
              value: idx + 1,
              label: m,
            }))}
            className="h-9 text-xs w-36"
          />

          <Select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            options={[2024, 2025, 2026, 2027, 2028].map((y) => ({
              value: y,
              label: String(y),
            }))}
            className="h-9 text-xs w-28"
          />
        </div>
      </Card>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Income</span>
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(income)}
              </span>
            )}
            <p className="text-[11px] text-muted-foreground mt-0.5">Gross cash inflows</p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Expenses</span>
            <div className="h-8 w-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <span className="text-xl font-bold text-rose-600 dark:text-rose-400">
                {formatCurrency(expenses)}
              </span>
            )}
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {expensesPct}% of income
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Savings</span>
            <div className="h-8 w-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <PiggyBank className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(savings)}
              </span>
            )}
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {savingsPct}% of income
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Investments</span>
            <div className="h-8 w-8 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <LineChart className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {formatCurrency(investments)}
              </span>
            )}
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {investmentsPct}% of income
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Net Cash Surplus</span>
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center ${
                netSurplus >= 0
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-rose-500/10 text-rose-500"
              }`}
            >
              {netSurplus >= 0 ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
            </div>
          </div>
          <div className="mt-2">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <span
                className={`text-xl font-bold ${
                  netSurplus >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {formatCurrency(netSurplus)}
              </span>
            )}
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {surplusPct}% unallocated
            </p>
          </div>
        </Card>
      </div>

      {/* Income Distribution Visual Flow Bar */}
      {income > 0 && (
        <Card className="p-5 bg-card border-border space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground uppercase tracking-wider">
              Income Deployment Distribution
            </span>
            <span className="font-bold text-foreground">
              Total Inflow: {formatCurrency(income)} (100%)
            </span>
          </div>

          <div className="h-4 w-full rounded-full bg-secondary overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${Math.max(0, Number(expensesPct))}%` }}
              className="bg-rose-500 transition-all duration-300"
              title={`Expenses: ${formatCurrency(expenses)} (${expensesPct}%)`}
            />
            <div
              style={{ width: `${Math.max(0, Number(savingsPct))}%` }}
              className="bg-blue-500 transition-all duration-300"
              title={`Savings: ${formatCurrency(savings)} (${savingsPct}%)`}
            />
            <div
              style={{ width: `${Math.max(0, Number(investmentsPct))}%` }}
              className="bg-purple-500 transition-all duration-300"
              title={`Investments: ${formatCurrency(investments)} (${investmentsPct}%)`}
            />
            {netSurplus > 0 && (
              <div
                style={{ width: `${Math.max(0, Number(surplusPct))}%` }}
                className="bg-emerald-500 transition-all duration-300"
                title={`Retained Surplus: ${formatCurrency(netSurplus)} (${surplusPct}%)`}
              />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-rose-500" />
              <span className="text-muted-foreground">Expenses:</span>
              <span className="font-bold text-foreground">{formatCurrency(expenses)}</span>
              <span className="text-[11px] text-muted-foreground">({expensesPct}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-blue-500" />
              <span className="text-muted-foreground">Savings:</span>
              <span className="font-bold text-foreground">{formatCurrency(savings)}</span>
              <span className="text-[11px] text-muted-foreground">({savingsPct}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-purple-500" />
              <span className="text-muted-foreground">Investments:</span>
              <span className="font-bold text-foreground">{formatCurrency(investments)}</span>
              <span className="text-[11px] text-muted-foreground">({investmentsPct}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-emerald-500" />
              <span className="text-muted-foreground">Retained Cash:</span>
              <span className="font-bold text-foreground">{formatCurrency(netSurplus)}</span>
              <span className="text-[11px] text-muted-foreground">({surplusPct}%)</span>
            </div>
          </div>
        </Card>
      )}

      {/* Formal Statement Table */}
      <Card className="border-border overflow-hidden bg-card">
        <CardHeader className="py-4 px-6 border-b border-border bg-muted/20 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">
              Monthly Profit & Loss Statement
            </CardTitle>
            <CardDescription className="text-xs">
              Statement of operations for {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Line Item</TableHead>
                <TableHead>Category Classification</TableHead>
                <TableHead className="text-right">Share of Income</TableHead>
                <TableHead className="text-right">Amount (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="hover:bg-muted/30">
                <TableCell className="font-semibold text-xs text-foreground">
                  Gross Income Inflows
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  Salary, Inflows, Primary Earnings
                </TableCell>
                <TableCell className="text-right text-xs font-mono">100.0%</TableCell>
                <TableCell className="text-right font-bold text-xs text-emerald-600 dark:text-emerald-400 font-mono">
                  +{formatCurrency(income)}
                </TableCell>
              </TableRow>

              <TableRow className="hover:bg-muted/30">
                <TableCell className="font-semibold text-xs text-foreground">
                  Operating Expenses & EMI
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  Mandatory Bills, Discretionary Living & Debt EMI
                </TableCell>
                <TableCell className="text-right text-xs font-mono">{expensesPct}%</TableCell>
                <TableCell className="text-right font-bold text-xs text-rose-600 dark:text-rose-400 font-mono">
                  -{formatCurrency(expenses)}
                </TableCell>
              </TableRow>

              <TableRow className="hover:bg-muted/30">
                <TableCell className="font-semibold text-xs text-foreground">
                  Savings Goals Allocation
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  Emergency Fund, Liquid Reserves & Savings Goals
                </TableCell>
                <TableCell className="text-right text-xs font-mono">{savingsPct}%</TableCell>
                <TableCell className="text-right font-bold text-xs text-blue-600 dark:text-blue-400 font-mono">
                  -{formatCurrency(savings)}
                </TableCell>
              </TableRow>

              <TableRow className="hover:bg-muted/30">
                <TableCell className="font-semibold text-xs text-foreground">
                  Wealth & Capital Investments
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  Mutual Funds, Stocks, Gold, FD & RD
                </TableCell>
                <TableCell className="text-right text-xs font-mono">{investmentsPct}%</TableCell>
                <TableCell className="text-right font-bold text-xs text-purple-600 dark:text-purple-400 font-mono">
                  -{formatCurrency(investments)}
                </TableCell>
              </TableRow>

              <TableRow className="bg-muted/40 font-bold border-t-2 border-border">
                <TableCell className="text-xs text-foreground font-bold">
                  Net Surplus Retained (Bottom Line)
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  Unallocated Cash Generation
                </TableCell>
                <TableCell className="text-right text-xs font-mono">{surplusPct}%</TableCell>
                <TableCell
                  className={`text-right text-sm font-bold font-mono ${
                    netSurplus >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {formatCurrency(netSurplus)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
