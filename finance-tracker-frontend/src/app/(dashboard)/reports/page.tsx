"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Calendar,
  BarChart3,
  Landmark,
  ArrowLeftRight,
  PieChart,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Download,
  Shield,
  Wallet,
  Sparkles,
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
import { useNetWorthReport, useMonthlyReport } from "@/hooks/use-reports";
import { formatCurrency } from "@/lib/formatters/currency";

export default function ReportsHubPage() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const { data: netWorthData, isLoading: isNetWorthLoading } = useNetWorthReport();
  const { data: currentMonthData, isLoading: isMonthlyLoading } = useMonthlyReport({
    year: currentYear,
    month: currentMonth,
  });

  const assets = Number(netWorthData?.assets ?? 0);
  const liabilities = Number(netWorthData?.liabilities ?? 0);
  const netWorth = Number(netWorthData?.netWorth ?? 0);

  const monthIncome = Number(currentMonthData?.income ?? 0);
  const monthExpenses = Number(currentMonthData?.expenses ?? 0);
  const monthSurplus = Number(currentMonthData?.netCashFlow ?? (monthIncome - monthExpenses));

  const REPORT_CARDS = [
    {
      title: "Monthly Financial Statement",
      href: "/reports/monthly",
      icon: Calendar,
      badge: "Statement",
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      description:
        "Comprehensive monthly P&L statement covering salary inflows, operational spending, goal savings, investment allocations, and net surplus.",
    },
    {
      title: "Yearly Comprehensive Report",
      href: "/reports/yearly",
      icon: BarChart3,
      badge: "Annual P&L",
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
      description:
        "Full 12-month calendar year review comparing income versus expenses across each month, peak spending periods, and annual wealth growth.",
    },
    {
      title: "Net Worth Balance Sheet",
      href: "/reports/net-worth",
      icon: Landmark,
      badge: "Solvency",
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      description:
        "Formal financial balance sheet detailing liquid bank balances, cash reserves, goal savings, deployed investments, and active loan liabilities.",
    },
    {
      title: "Cash Flow Statement",
      href: "/reports/cash-flow",
      icon: ArrowLeftRight,
      badge: "Liquidity",
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      description:
        "Operational liquidity statement analyzing gross cash inflows against fixed expenses, discretionary spending, and capital retention.",
    },
    {
      title: "Category Spending Breakdown",
      href: "/reports/category",
      icon: PieChart,
      badge: "Expenditures",
      color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
      description:
        "Deep dive into where money is spent, ranking expenditure categories by volume, percentage allocation, and spending trends.",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports Center"
        description="Generate official financial statements, analyze solvency balance sheets, and export P&L reviews"
      >
        <Link href="/exports">
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <Download className="h-4 w-4" /> Export Center
          </Button>
        </Link>
      </PageHeader>

      {/* Snapshot Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Current Net Worth</span>
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Landmark className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            {isNetWorthLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <span className="text-2xl font-bold text-foreground">
                {formatCurrency(netWorth)}
              </span>
            )}
            <p className="text-[11px] text-muted-foreground mt-0.5">Assets minus liabilities</p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Assets</span>
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            {isNetWorthLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(assets)}
              </span>
            )}
            <p className="text-[11px] text-muted-foreground mt-0.5">Accounts, savings & investments</p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Liabilities</span>
            <div className="h-8 w-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            {isNetWorthLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                {formatCurrency(liabilities)}
              </span>
            )}
            <p className="text-[11px] text-muted-foreground mt-0.5">Outstanding loan principal</p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">This Month Surplus</span>
            <div className="h-8 w-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            {isMonthlyLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <span
                className={`text-2xl font-bold ${
                  monthSurplus >= 0
                    ? "text-foreground"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {formatCurrency(monthSurplus)}
              </span>
            )}
            <p className="text-[11px] text-muted-foreground mt-0.5">Net unallocated cash flow</p>
          </div>
        </Card>
      </div>

      {/* Available Reports Catalog */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Available Reports & Statements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {REPORT_CARDS.map((report) => {
            const Icon = report.icon;
            return (
              <Card
                key={report.href}
                className="border-border hover:border-primary/40 transition-all flex flex-col justify-between overflow-hidden bg-card group"
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${report.color}`}>
                      {report.badge}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <Link
                      href={report.href}
                      className="font-semibold text-base text-foreground group-hover:text-primary transition-colors block"
                    >
                      {report.title}
                    </Link>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {report.description}
                    </p>
                  </div>
                </div>

                <div className="px-5 py-3 border-t border-border bg-muted/10 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">Interactive View</span>
                  <Link href={report.href}>
                    <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 group-hover:text-primary">
                      Open Report <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
