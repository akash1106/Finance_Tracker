"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  LineChart,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Coins,
  Building,
  Landmark,
  Shield,
  Layers,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Button,
  Input,
  Select,
  Textarea,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui";
import { useCreateInvestment } from "@/hooks/use-investments";
import type { InvestmentType } from "@/types/investment";

interface Preset {
  name: string;
  investmentType: InvestmentType;
  description: string;
  icon: React.ElementType;
}

const INVESTMENT_PRESETS: Preset[] = [
  {
    name: "Nifty 50 Index Mutual Fund",
    investmentType: "MUTUAL_FUND",
    description: "Low-cost index fund tracking India's top 50 bluechip companies for long-term compounding.",
    icon: TrendingUp,
  },
  {
    name: "Parag Parikh Flexi Cap Fund",
    investmentType: "MUTUAL_FUND",
    description: "Active multi-cap equity fund investing across Indian and international large/mid-cap equities.",
    icon: LineChart,
  },
  {
    name: "Sovereign Gold Bond (SGB)",
    investmentType: "GOLD",
    description: "RBI-backed gold holding yielding 2.5% annual interest plus tax-free capital gains on maturity.",
    icon: Coins,
  },
  {
    name: "Bank Fixed Deposit (FD)",
    investmentType: "FD",
    description: "Guaranteed fixed-rate term deposit for stable capital preservation and liquidity.",
    icon: Landmark,
  },
  {
    name: "Recurring Deposit (RD)",
    investmentType: "RD",
    description: "Monthly recurring deposit account building disciplined interest-earning savings.",
    icon: Shield,
  },
  {
    name: "Bluechip Equities Basket",
    investmentType: "STOCKS",
    description: "Direct equity portfolio of fundamentally strong dividend-paying Indian corporations.",
    icon: Layers,
  },
];

export default function NewInvestmentPage() {
  const router = useRouter();
  const createMutation = useCreateInvestment();

  const [name, setName] = useState("");
  const [investmentType, setInvestmentType] = useState<InvestmentType>("MUTUAL_FUND");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleApplyPreset = (preset: Preset) => {
    setName(preset.name);
    setInvestmentType(preset.investmentType);
    setDescription(preset.description);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please provide a name for the investment asset");
      return;
    }

    try {
      const created = await createMutation.mutateAsync({
        name: name.trim(),
        investmentType,
        description: description.trim() || undefined,
      });

      if (created?.id) {
        router.push(`/investments/${created.id}`);
      } else {
        router.push("/investments");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create investment asset");
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Add Investment Asset"
        description="Add a new holding to track your capital allocations across funds, gold, deposits, and stocks"
      >
        <Link href="/investments">
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <ArrowLeft className="h-4 w-4" /> Back to Portfolio
          </Button>
        </Link>
      </PageHeader>

      {/* Popular Investment Presets */}
      <Card className="border-border bg-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Popular Asset Presets
          </h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Click any preset below to pre-populate standard asset categories and investment notes:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
          {INVESTMENT_PRESETS.map((preset) => {
            const Icon = preset.icon;
            const isSelected = name === preset.name;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={`flex items-start gap-2.5 p-3 rounded-lg border text-left transition-all text-xs ${
                  isSelected
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-border hover:border-primary/40 hover:bg-muted/40 text-foreground"
                }`}
              >
                <div className="h-7 w-7 rounded-md bg-secondary shrink-0 flex items-center justify-center text-primary mt-0.5">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="space-y-0.5 overflow-hidden">
                  <span className="font-semibold block truncate">{preset.name}</span>
                  <span className="text-[11px] text-muted-foreground block truncate">
                    {preset.investmentType}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Asset Form */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <LineChart className="h-4 w-4 text-primary" /> Holding Specifications
          </CardTitle>
          <CardDescription className="text-xs">
            Provide the name and category for this wealth-building holding. You can log deposits
            immediately after creation.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Asset / Scheme Name"
                placeholder="e.g. Nippon India Small Cap Fund"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Select
                label="Asset Class"
                value={investmentType}
                onChange={(e) => setInvestmentType(e.target.value as InvestmentType)}
                options={[
                  { value: "MUTUAL_FUND", label: "Mutual Funds" },
                  { value: "STOCKS", label: "Stocks & Equities" },
                  { value: "GOLD", label: "Gold & Sovereign Gold Bonds" },
                  { value: "FD", label: "Fixed Deposit (FD)" },
                  { value: "RD", label: "Recurring Deposit (RD)" },
                  { value: "CRYPTO", label: "Cryptocurrency" },
                  { value: "REAL_ESTATE", label: "Real Estate" },
                  { value: "OTHER", label: "Other Asset" },
                ]}
                required
              />
            </div>

            <Textarea
              label="Description / Strategy Notes (Optional)"
              placeholder="e.g., SIP on 10th of every month. Managed via Zerodha Coin / Groww. Goal: Long term wealth creation."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              helperText="Add any notes on folio number, broker, or target horizon."
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Link href="/investments">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                className="gap-2"
                isLoading={createMutation.isPending}
              >
                <LineChart className="h-4 w-4" /> Save Investment Asset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
