"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Layers,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  PieChart,
  Tag,
  ArrowUpDown,
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
  Select,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  EmptyState,
} from "@/components/ui";
import { useCategoryTrends } from "@/hooks/use-analytics";
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

export default function CategoryTrendsPage() {
  const { data: rawData, isLoading } = useCategoryTrends();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const trends = useMemo(() => rawData || [], [rawData]);

  // Unique months and categories for filter dropdowns
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    trends.forEach((t) => {
      if (t.month) set.add(t.month);
    });
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [trends]);

  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    trends.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [trends]);

  // Aggregated category totals across all months
  const categoryTotals = useMemo(() => {
    const map = new Map<string, number>();
    trends.forEach((t) => {
      const cat = t.category || "Uncategorized";
      const amt = Number(t.amount) || 0;
      map.set(cat, (map.get(cat) || 0) + amt);
    });
    return Array.from(map.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);
  }, [trends]);

  const grandTotal = useMemo(() => {
    return categoryTotals.reduce((sum, c) => sum + c.total, 0);
  }, [categoryTotals]);

  // Top spending category
  const topCategory = categoryTotals.length > 0 ? categoryTotals[0] : null;

  // Monthly totals for percentage share calculation per month
  const monthTotals = useMemo(() => {
    const map = new Map<string, number>();
    trends.forEach((t) => {
      const amt = Number(t.amount) || 0;
      map.set(t.month, (map.get(t.month) || 0) + amt);
    });
    return map;
  }, [trends]);

  // Filtered trends for table
  const filteredTrends = useMemo(() => {
    return trends
      .filter((t) => {
        if (selectedMonth !== "ALL" && t.month !== selectedMonth) return false;
        if (selectedCategory !== "ALL" && t.category !== selectedCategory) return false;
        if (searchTerm && !t.category.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        // Sort by month desc, then amount desc
        if (a.month !== b.month) return b.month.localeCompare(a.month);
        return (Number(b.amount) || 0) - (Number(a.amount) || 0);
      });
  }, [trends, selectedMonth, selectedCategory, searchTerm]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Category Trends Matrix"
        description="Analyze category-level expenditure dynamics, concentration ratios, and cross-month spending evolution"
      >
        <Link href="/analytics">
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <ArrowLeft className="h-4 w-4" /> Analytics Hub
          </Button>
        </Link>
      </PageHeader>

      {/* Summary KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Tracked Categories
            </span>
            <div className="mt-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {categoryTotals.length}
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                Active spending categories with outflows
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Top Category (All-Time)
            </span>
            <div className="mt-2">
              <span className="text-2xl font-bold tracking-tight text-foreground truncate block">
                {topCategory ? topCategory.name : "None"}
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                {topCategory ? formatCurrency(topCategory.total) : "₹0"}{" "}
                {topCategory && grandTotal > 0
                  ? `(${((topCategory.total / grandTotal) * 100).toFixed(1)}% of total)`
                  : ""}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Cumulative Expense
            </span>
            <div className="mt-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {formatCurrency(grandTotal)}
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                Total categorized expenses across all cycles
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Recorded Cycles
            </span>
            <div className="mt-2">
              <span className="text-2xl font-bold tracking-tight text-primary">
                {availableMonths.length}
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                Distinct monthly expenditure periods
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Concentration & Distribution */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Cumulative Category Concentration</CardTitle>
          <CardDescription className="text-xs">
            Percentage share of each spending category across all recorded history
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : categoryTotals.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No category spending recorded yet.
            </div>
          ) : (
            <div className="space-y-4">
              {categoryTotals.slice(0, 8).map((cat, idx) => {
                const pct = grandTotal > 0 ? (cat.total / grandTotal) * 100 : 0;
                return (
                  <div key={cat.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-muted-foreground w-4">#{idx + 1}</span>
                        <span className="font-semibold text-foreground">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-foreground">{formatCurrency(cat.total)}</span>
                        <Badge variant="outline" className="text-[10px] w-12 text-center justify-center">
                          {pct.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${Math.min(100, Math.max(2, pct))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filter and Search Bar */}
      <Card className="p-3 bg-card border-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative min-w-[200px] max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>

          {/* Month Selector */}
          <div className="w-44">
            <Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="h-8 text-xs"
            >
              <option value="ALL">All Recorded Months</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {formatMonthKey(m)}
                </option>
              ))}
            </Select>
          </div>

          {/* Category Selector */}
          <div className="w-48">
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-8 text-xs"
            >
              <option value="ALL">All Categories</option>
              {availableCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {(searchTerm || selectedMonth !== "ALL" || selectedCategory !== "ALL") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm("");
              setSelectedMonth("ALL");
              setSelectedCategory("ALL");
            }}
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
          >
            Reset Filters
          </Button>
        )}
      </Card>

      {/* Detailed Category Trends Matrix Table */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Category Monthly Flow Matrix</CardTitle>
            <CardDescription className="text-xs">
              Detailed breakdown of expenditure amounts and monthly budget share
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            {filteredTrends.length} Entries
          </Badge>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : filteredTrends.length === 0 ? (
            <EmptyState
              title="No category trends match your criteria"
              description="Adjust the search term or month filters to view categorized expense trends."
            />
          ) : (
            <div className="rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Expenditure</TableHead>
                    <TableHead>Share of Month's Spending</TableHead>
                    <TableHead className="text-right">Relative Weight</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrends.map((t, idx) => {
                    const amt = Number(t.amount) || 0;
                    const mTotal = monthTotals.get(t.month) || 1;
                    const monthShare = ((amt / mTotal) * 100).toFixed(1);

                    return (
                      <TableRow key={`${t.month}-${t.category}-${idx}`}>
                        <TableCell className="font-semibold text-foreground">
                          {formatMonthKey(t.month)}
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          <div className="flex items-center gap-2">
                            <Tag className="h-3.5 w-3.5 text-primary" />
                            <span>{t.category}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-foreground">
                          {formatCurrency(amt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 max-w-[180px]">
                            <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${Math.min(100, Number(monthShare))}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-muted-foreground w-12 text-right">
                              {monthShare}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={Number(monthShare) >= 40 ? "destructive" : Number(monthShare) >= 20 ? "secondary" : "outline"}
                            className="text-[10px]"
                          >
                            {Number(monthShare) >= 40
                              ? "Major Outflow (>40%)"
                              : Number(monthShare) >= 20
                              ? "Moderate Outflow"
                              : "Minor Outflow"}
                          </Badge>
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
