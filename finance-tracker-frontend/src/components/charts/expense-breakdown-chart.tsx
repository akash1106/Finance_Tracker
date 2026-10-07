"use client";

import React, { useState, useEffect } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/formatters/currency";
import { PieChart as PieIcon } from "lucide-react";

export interface CategoryExpenseSlice {
  category: string;
  amount: number;
  percentage?: number;
  color?: string;
}

interface ExpenseBreakdownChartProps {
  data: CategoryExpenseSlice[];
  totalAmount: number;
  isLoading?: boolean;
  height?: number;
}

const PALETTE = [
  "#6366f1", // indigo
  "#ec4899", // pink
  "#f59e0b", // amber
  "#10b981", // emerald
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#14b8a6", // teal
  "#f43f5e", // rose
  "#06b6d4", // cyan
  "#84cc16", // lime
];

export function ExpenseBreakdownChart({
  data,
  totalAmount,
  isLoading = false,
  height = 280,
}: ExpenseBreakdownChartProps) {
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
        <span className="text-xs text-muted-foreground">Loading breakdown data...</span>
      </div>
    );
  }

  const validData = data.filter((d) => d.amount > 0);

  if (validData.length === 0 || totalAmount <= 0) {
    return (
      <div
        style={{ height }}
        className="w-full flex flex-col items-center justify-center text-center p-6 bg-muted/10 rounded-xl border border-dashed border-border"
      >
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-2">
          <PieIcon className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-xs font-semibold text-foreground">No expenses this month</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Expenses will be automatically grouped into a visual breakdown
        </p>
      </div>
    );
  }

  // Pre-calculate percentages
  const chartData = validData.map((item, idx) => ({
    ...item,
    color: item.color || PALETTE[idx % PALETTE.length],
    percentage: Math.round((item.amount / totalAmount) * 1000) / 10,
  }));

  return (
    <div className="w-full flex flex-col justify-between" style={{ minHeight: height }}>
      {/* Donut Chart with Centered Total */}
      <div className="relative w-full" style={{ height: height - 80 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const slice = payload[0].payload as CategoryExpenseSlice & {
                    percentage: number;
                    color: string;
                  };
                  return (
                    <div className="bg-popover text-popover-foreground border border-border rounded-lg shadow-lg p-2.5 text-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: slice.color }}
                        />
                        <span className="font-semibold text-foreground">{slice.category}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-muted-foreground">
                        <span>Amount:</span>
                        <strong className="text-foreground">{formatCurrency(slice.amount)}</strong>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-muted-foreground">
                        <span>Share:</span>
                        <strong className="text-foreground">{slice.percentage}%</strong>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={chartData}
              dataKey="amount"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              stroke="transparent"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Total Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
            Total Spend
          </span>
          <span className="text-sm sm:text-base font-bold text-foreground">
            {formatCurrency(totalAmount)}
          </span>
        </div>
      </div>

      {/* Category Pills / Mini Legend */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2 max-h-24 overflow-y-auto">
        {chartData.slice(0, 6).map((item) => (
          <div
            key={item.category}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-border/70 bg-card text-[11px]"
          >
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="font-medium text-foreground truncate max-w-[90px]">
              {item.category}
            </span>
            <span className="text-muted-foreground font-semibold">{item.percentage}%</span>
          </div>
        ))}
        {chartData.length > 6 && (
          <span className="text-[10px] text-muted-foreground self-center">
            +{chartData.length - 6} more
          </span>
        )}
      </div>
    </div>
  );
}
