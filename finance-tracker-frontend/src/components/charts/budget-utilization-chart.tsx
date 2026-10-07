"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { formatCurrency, formatCompactCurrency } from "@/lib/formatters/currency";
import { BarChart3, Plus } from "lucide-react";
import { Button } from "@/components/ui";

export interface CategoryBudgetUsage {
  category: string;
  allocated: number;
  spent: number;
  remaining?: number;
  percentage?: number;
}

interface BudgetUtilizationChartProps {
  data: CategoryBudgetUsage[];
  isLoading?: boolean;
  height?: number;
}

export function BudgetUtilizationChart({
  data,
  isLoading = false,
  height = 280,
}: BudgetUtilizationChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || isLoading) {
    return (
      <div
        style={{ height }}
        className="w-full flex items-center justify-center bg-muted/10 rounded-xl animate-pulse"
      >
        <span className="text-xs text-muted-foreground">Loading budget utilization...</span>
      </div>
    );
  }

  const hasData = data.length > 0 && data.some((d) => d.allocated > 0 || d.spent > 0);

  if (!hasData) {
    return (
      <div
        style={{ height }}
        className="w-full flex flex-col items-center justify-center text-center p-6 bg-muted/10 rounded-xl border border-dashed border-border"
      >
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-2">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-xs font-semibold text-foreground">No monthly budget active</p>
        <p className="text-[11px] text-muted-foreground mt-0.5 mb-3">
          Configure a zero-based salary envelope to track spending against budget targets
        </p>
        <Link href="/budget/allocation">
          <Button size="sm" variant="outline" className="text-xs h-7 gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Setup Allocation
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          barGap={4}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/40" />
          <XAxis
            dataKey="category"
            stroke="currentColor"
            className="text-muted-foreground text-[11px]"
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => (val.length > 10 ? `${val.substring(0, 9)}…` : val)}
          />
          <YAxis
            stroke="currentColor"
            className="text-muted-foreground text-[11px]"
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => formatCompactCurrency(val)}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as CategoryBudgetUsage;
                const allocated = item.allocated || 0;
                const spent = item.spent || 0;
                const remaining = allocated - spent;
                const pct = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;
                const isOver = spent > allocated;

                return (
                  <div className="bg-popover text-popover-foreground border border-border rounded-lg shadow-lg p-3 text-xs min-w-[170px]">
                    <p className="font-semibold text-foreground mb-1.5">{label}</p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-3 text-blue-600 dark:text-blue-400">
                        <span className="font-medium">Allocated:</span>
                        <strong className="font-bold">{formatCurrency(allocated)}</strong>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-foreground">
                        <span className="font-medium">Spent:</span>
                        <strong className={isOver ? "text-rose-500 font-bold" : "font-bold"}>
                          {formatCurrency(spent)}
                        </strong>
                      </div>
                      <div className="border-t border-border pt-1 mt-1 flex items-center justify-between gap-3">
                        <span className="text-muted-foreground">Status:</span>
                        <span
                          className={
                            isOver
                              ? "text-rose-500 font-bold"
                              : "text-emerald-500 font-bold"
                          }
                        >
                          {isOver
                            ? `Over by ${formatCurrency(Math.abs(remaining))}`
                            : `${pct}% used (${formatCurrency(remaining)} left)`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: 8, fontSize: 11 }}
          />
          <Bar
            dataKey="allocated"
            name="Allocated"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="spent"
            name="Spent"
            fill="#f43f5e"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
