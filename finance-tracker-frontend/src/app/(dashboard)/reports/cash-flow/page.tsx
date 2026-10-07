"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  LineChart,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Wallet,
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
import { useCashFlowReport } from "@/hooks/use-reports";
import { formatCurrency } from "@/lib/formatters/currency";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function CashFlowReportPage() {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);

  const { data: cashFlow, isLoading } = useCashFlowReport({
    year: selectedYear,
    month: selectedMonth,
  });

  const income = Number(cashFlow?.income ?? 0);
  const expenses = Number(cashFlow?.expenses ?? 0);
  const savings = Number(cashFlow?.savings ?? 0);
  const investments = Number(cashFlow?.investments ?? 0);
  const netCashFlow = Number(cashFlow?.netCashFlow ?? (income - expenses - savings - investments));

  const operatingMargin = income > 0 ? income - expenses : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Cash Flow Statement — ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`}
        description="Statement of cash inflows, operational outflows, capital allocations, and net liquidity"
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
            className="gap-2 text-xs"
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4" /> Print Statement
          </Button>
        </div>
      </PageHeader>

      {/* Date Controls */}
      <Card className="p-3 bg-card border-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">Cash Flow Period:</span>
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

      {/* Cash Flow Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Cash Inflow</span>
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                +{formatCurrency(income)}
              </span>
            )}
            <p className="text-[11px] text-muted-foreground mt-0.5">Operating income & receipts</p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Operating Outflow</span>
            <div className="h-8 w-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                -{formatCurrency(expenses)}
              </span>
            )}
            <p className="text-[11px] text-muted-foreground mt-0.5">Living costs, rent & bills</p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Capital Deployed</span>
            <div className="h-8 w-8 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <LineChart className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                -{formatCurrency(savings + investments)}
              </span>
            )}
            <p className="text-[11px] text-muted-foreground mt-0.5">Savings & investment funding</p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Net Cash Generated</span>
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center ${
                netCashFlow >= 0
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-rose-500/10 text-rose-500"
              }`}
            >
              {netCashFlow >= 0 ? (
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
                className={`text-2xl font-bold ${
                  netCashFlow >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {formatCurrency(netCashFlow)}
              </span>
            )}
            <p className="text-[11px] text-muted-foreground mt-0.5">Unallocated cash surplus</p>
          </div>
        </Card>
      </div>

      {/* Cash Flow Statement Ledger */}
      <Card className="border-border overflow-hidden bg-card">
        <CardHeader className="py-4 px-6 border-b border-border bg-muted/20">
          <CardTitle className="text-sm font-semibold">
            Cash Flow Statement of Operating & Capital Activities
          </CardTitle>
          <CardDescription className="text-xs">
            Period: {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cash Flow Activity</TableHead>
                <TableHead>Classification</TableHead>
                <TableHead className="text-right">Net Flow (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Section 1: Operating Activities */}
              <TableRow className="bg-muted/30">
                <TableCell colSpan={3} className="text-xs font-bold text-foreground py-2">
                  1. CASH FLOWS FROM OPERATING ACTIVITIES
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-muted/20">
                <TableCell className="text-xs pl-6 text-foreground">
                  Cash Inflows (Salary & Other Inflows)
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">Operating Inflow</TableCell>
                <TableCell className="text-right font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  +{formatCurrency(income)}
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-muted/20">
                <TableCell className="text-xs pl-6 text-foreground">
                  Cash Outflows (Operating Living Expenses)
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">Operating Outflow</TableCell>
                <TableCell className="text-right font-mono text-xs font-semibold text-rose-600 dark:text-rose-400">
                  -{formatCurrency(expenses)}
                </TableCell>
              </TableRow>
              <TableRow className="bg-muted/10 font-medium">
                <TableCell colSpan={2} className="text-xs font-semibold pl-6 text-foreground">
                  Net Cash Generated from Operations
                </TableCell>
                <TableCell
                  className={`text-right font-mono text-xs font-bold ${
                    operatingMargin >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {formatCurrency(operatingMargin)}
                </TableCell>
              </TableRow>

              {/* Section 2: Capital Deployment Activities */}
              <TableRow className="bg-muted/30">
                <TableCell colSpan={3} className="text-xs font-bold text-foreground py-2">
                  2. CASH FLOWS FROM CAPITAL ALLOCATION
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-muted/20">
                <TableCell className="text-xs pl-6 text-foreground">
                  Cash Contributed to Savings Goals
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">Savings Allocation</TableCell>
                <TableCell className="text-right font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
                  -{formatCurrency(savings)}
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-muted/20">
                <TableCell className="text-xs pl-6 text-foreground">
                  Cash Injected into Investments & Assets
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">Investment Funding</TableCell>
                <TableCell className="text-right font-mono text-xs font-semibold text-purple-600 dark:text-purple-400">
                  -{formatCurrency(investments)}
                </TableCell>
              </TableRow>

              {/* Section 3: Net Cash Generation */}
              <TableRow className="bg-muted/50 font-bold border-t-2 border-border">
                <TableCell colSpan={2} className="text-xs font-bold text-foreground">
                  NET CASH GENERATION (Retained Liquidity)
                </TableCell>
                <TableCell
                  className={`text-right font-mono text-sm font-bold ${
                    netCashFlow >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {formatCurrency(netCashFlow)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
