"use client";

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { formatCurrency, formatCompactCurrency } from "@/lib/formatters/currency";
import { TrendingUp, TrendingDown } from "lucide-react";

export interface IncomeExpensePoint {
  label: string;
  income: number;
  expenses: number;
}

interface IncomeExpenseChartProps {
  data: IncomeExpensePoint[];
  isLoading?: boolean;
  height?: number;
}

export function IncomeExpenseChart({
  data,
  isLoading = false,
  height = 280,
}: IncomeExpenseChartProps) {
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
        <span className="text-xs text-muted-foreground">Loading chart data...</span>
      </div>
    );
  }

  const hasData =
    data.length > 0 &&
    data.some((d) => (d.income && d.income > 0) || (d.expenses && d.expenses > 0));

  if (!hasData) {
    return (
      <div
        style={{ height }}
        className="w-full flex flex-col items-center justify-center text-center p-6 bg-muted/10 rounded-xl border border-dashed border-border"
      >
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-2">
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-xs font-semibold text-foreground">No cash flow activity yet</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Record income or expenses to see your cash flow curve
        </p>
      </div>
    );
  }

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.28} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.28} />
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/40" />
          <XAxis
            dataKey="label"
            stroke="currentColor"
            className="text-muted-foreground text-[11px]"
            tickLine={false}
            axisLine={false}
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
                const inc = Number(payload.find((p) => p.dataKey === "income")?.value || 0);
                const exp = Number(payload.find((p) => p.dataKey === "expenses")?.value || 0);
                const diff = inc - exp;

                return (
                  <div className="bg-popover text-popover-foreground border border-border rounded-lg shadow-lg p-3 text-xs min-w-[150px]">
                    <p className="font-semibold text-foreground mb-1.5">{label}</p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-3 text-emerald-600 dark:text-emerald-400">
                        <span className="flex items-center gap-1 font-medium">
                          <TrendingUp className="h-3 w-3" /> Income:
                        </span>
                        <span className="font-bold">{formatCurrency(inc)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-rose-600 dark:text-rose-400">
                        <span className="flex items-center gap-1 font-medium">
                          <TrendingDown className="h-3 w-3" /> Expenses:
                        </span>
                        <span className="font-bold">{formatCurrency(exp)}</span>
                      </div>
                      <div className="border-t border-border pt-1 mt-1 flex items-center justify-between gap-3 text-muted-foreground font-semibold">
                        <span>Net:</span>
                        <span className={diff >= 0 ? "text-emerald-500 font-bold" : "text-rose-500 font-bold"}>
                          {diff >= 0 ? "+" : ""}
                          {formatCurrency(diff)}
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
          <Area
            type="monotone"
            dataKey="income"
            name="Income"
            stroke="#10b981"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#incomeGradient)"
          />
          <Area
            type="monotone"
            dataKey="expenses"
            name="Expenses"
            stroke="#f43f5e"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#expenseGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
