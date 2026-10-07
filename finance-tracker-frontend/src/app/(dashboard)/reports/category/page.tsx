"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  PieChart,
  TrendingDown,
  Printer,
  Tags,
  Layers,
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
  Progress,
  Skeleton,
  EmptyState,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui";
import { useCategoryReport } from "@/hooks/use-reports";
import { formatCurrency } from "@/lib/formatters/currency";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function CategoryReportPage() {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);

  const { data: categoryData, isLoading } = useCategoryReport({
    year: selectedYear,
    month: selectedMonth,
  });

  const items = categoryData || [];

  // Compute category statistics
  const stats = useMemo(() => {
    let totalSpent = 0;
    let topCategory = "None";
    let topCategoryAmount = 0;

    items.forEach((item) => {
      const amt = Number(item.amount) || 0;
      totalSpent += amt;
      if (amt > topCategoryAmount) {
        topCategoryAmount = amt;
        topCategory = item.category || "Uncategorized";
      }
    });

    const topCategoryPercent =
      totalSpent > 0 ? Math.round((topCategoryAmount / totalSpent) * 100) : 0;

    return {
      totalSpent,
      categoryCount: items.length,
      topCategory,
      topCategoryAmount,
      topCategoryPercent,
    };
  }, [items]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Category Spending Analysis — ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`}
        description="Detailed expenditure distribution and category rankings for the selected period"
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
          <span className="text-xs font-semibold text-foreground">Analysis Period:</span>
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

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Expenditure</span>
            <div className="h-8 w-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            {isLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                {formatCurrency(stats.totalSpent)}
              </span>
            )}
            <p className="text-[11px] text-muted-foreground mt-0.5">Categorized outflow</p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Top Spending Category</span>
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <PieChart className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            {isLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <span className="text-2xl font-bold text-foreground">
                {stats.topCategory}
              </span>
            )}
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {stats.topCategoryPercent}% of all spending ({formatCurrency(stats.topCategoryAmount)})
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Active Categories</span>
            <div className="h-8 w-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Tags className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <span className="text-2xl font-bold text-foreground">
                {stats.categoryCount}
              </span>
            )}
            <p className="text-[11px] text-muted-foreground mt-0.5">Distinct categories used</p>
          </div>
        </Card>
      </div>

      {/* Category Breakdown Table */}
      <Card className="border-border overflow-hidden bg-card">
        <CardHeader className="py-4 px-6 border-b border-border bg-muted/20">
          <CardTitle className="text-sm font-semibold">Category Expenditure Rankings</CardTitle>
          <CardDescription className="text-xs">
            Spending volume and percentage distribution sorted by size
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={PieChart}
                title="No expenses logged for this month"
                description="There are no categorized expense transactions recorded for the selected month."
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="w-1/3">Share of Total</TableHead>
                  <TableHead className="text-right">Percentage</TableHead>
                  <TableHead className="text-right">Total Spent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items
                  .slice()
                  .sort((a, b) => (Number(b.amount) || 0) - (Number(a.amount) || 0))
                  .map((item) => {
                    const amt = Number(item.amount) || 0;
                    const pct =
                      stats.totalSpent > 0
                        ? Math.min(Math.round((amt / stats.totalSpent) * 100), 100)
                        : 0;

                    return (
                      <TableRow key={item.categoryId || "uncat"} className="hover:bg-muted/30">
                        <TableCell className="font-semibold text-xs text-foreground">
                          {item.category || "Uncategorized"}
                        </TableCell>
                        <TableCell>
                          <Progress value={pct} variant="destructive" className="h-2" />
                        </TableCell>
                        <TableCell className="text-right text-xs font-mono font-medium text-muted-foreground">
                          {pct}%
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
                          {formatCurrency(amt)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
