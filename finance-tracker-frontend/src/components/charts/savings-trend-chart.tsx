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
} from "recharts";
import { formatCurrency, formatCompactCurrency } from "@/lib/formatters/currency";
import { PiggyBank } from "lucide-react";

export interface SavingsTrendPoint {
  label: string;
  savings: number;
}

interface SavingsTrendChartProps {
  data: SavingsTrendPoint[];
  isLoading?: boolean;
  height?: number;
}

export function SavingsTrendChart({
  data,
  isLoading = false,
  height = 280,
}: SavingsTrendChartProps) {
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
        <span className="text-xs text-muted-foreground">Loading savings trend...</span>
      </div>
    );
  }

  const hasData = data.length > 0 && data.some((d) => d.savings && d.savings > 0);

  if (!hasData) {
    return (
      <div
        style={{ height }}
        className="w-full flex flex-col items-center justify-center text-center p-6 bg-muted/10 rounded-xl border border-dashed border-border"
      >
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-2">
          <PiggyBank className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-xs font-semibold text-foreground">No savings records yet</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Savings transfers and goal deposits will build your trend line here
        </p>
      </div>
    );
  }

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
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
                const val = Number(payload[0].value || 0);
                return (
                  <div className="bg-popover text-popover-foreground border border-border rounded-lg shadow-lg p-2.5 text-xs min-w-[130px]">
                    <p className="font-semibold text-foreground mb-1">{label}</p>
                    <div className="flex items-center justify-between gap-3 text-cyan-600 dark:text-cyan-400">
                      <span className="font-medium">Saved:</span>
                      <strong className="font-bold">{formatCurrency(val)}</strong>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="savings"
            name="Savings"
            stroke="#06b6d4"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#savingsGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
