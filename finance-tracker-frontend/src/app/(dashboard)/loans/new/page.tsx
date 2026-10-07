"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Landmark,
  Calculator,
  Sparkles,
  AlertCircle,
  Calendar,
  Percent,
  CreditCard,
  Laptop,
  Bike,
  Car,
  HeartPulse,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Button,
  Input,
  Textarea,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui";
import { useCreateLoan } from "@/hooks/use-loans";
import { toInputDate } from "@/lib/formatters/date";
import { formatCurrency } from "@/lib/formatters/currency";

interface Preset {
  name: string;
  principalAmount: number;
  interestRate: number;
  emiAmount: number;
  tenureMonths: number;
  description: string;
  icon: React.ElementType;
}

const LOAN_PRESETS: Preset[] = [
  {
    name: "Electronics / Laptop No-Cost EMI",
    principalAmount: 80000,
    interestRate: 0,
    emiAmount: 6667,
    tenureMonths: 12,
    description: "0% interest consumer durable financing on credit card or store financing.",
    icon: Laptop,
  },
  {
    name: "Two-Wheeler / Bike Loan",
    principalAmount: 120000,
    interestRate: 11.5,
    emiAmount: 5621,
    tenureMonths: 24,
    description: "Vehicle loan for commuter motorcycle or electric scooter.",
    icon: Bike,
  },
  {
    name: "Personal Emergency Loan",
    principalAmount: 200000,
    interestRate: 13.5,
    emiAmount: 6788,
    tenureMonths: 36,
    description: "Unsecured personal loan for medical or contingency obligations.",
    icon: HeartPulse,
  },
  {
    name: "Car / Auto Loan",
    principalAmount: 600000,
    interestRate: 8.75,
    emiAmount: 12382,
    tenureMonths: 60,
    description: "Secured vehicle auto financing for new four-wheeler purchase.",
    icon: Car,
  },
];

export default function NewLoanPage() {
  const router = useRouter();
  const createMutation = useCreateLoan();

  const [name, setName] = useState("");
  const [principalAmount, setPrincipalAmount] = useState("");
  const [interestRate, setInterestRate] = useState("10.5");
  const [emiAmount, setEmiAmount] = useState("");
  const [tenureMonths, setTenureMonths] = useState("12");
  const [startDate, setStartDate] = useState(toInputDate());
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  // Auto-calculated EMI helper
  const calculatedEmi = useMemo(() => {
    const P = parseFloat(principalAmount);
    const N = parseInt(tenureMonths, 10);
    const annualR = parseFloat(interestRate);

    if (!P || !N || P <= 0 || N <= 0) return 0;

    if (!annualR || annualR <= 0) {
      return Math.round(P / N);
    }

    const r = annualR / (12 * 100);
    const emi = (P * r * Math.pow(1 + r, N)) / (Math.pow(1 + r, N) - 1);
    return Math.round(emi);
  }, [principalAmount, tenureMonths, interestRate]);

  const handleApplyPreset = (preset: Preset) => {
    setName(preset.name);
    setPrincipalAmount(String(preset.principalAmount));
    setInterestRate(String(preset.interestRate));
    setEmiAmount(String(preset.emiAmount));
    setTenureMonths(String(preset.tenureMonths));
    setDescription(preset.description);
    setError("");
  };

  const handleApplyCalculatedEmi = () => {
    if (calculatedEmi > 0) {
      setEmiAmount(String(calculatedEmi));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please provide a name for this loan or liability");
      return;
    }

    const p = parseFloat(principalAmount);
    if (!p || isNaN(p) || p <= 0) {
      setError("Please enter a valid principal amount greater than 0");
      return;
    }

    const emi = parseFloat(emiAmount);
    if (!emi || isNaN(emi) || emi <= 0) {
      setError("Please enter a valid monthly EMI amount greater than 0");
      return;
    }

    const tenure = parseInt(tenureMonths, 10);
    if (!tenure || isNaN(tenure) || tenure <= 0) {
      setError("Please enter a valid tenure in months (at least 1)");
      return;
    }

    const rate = parseFloat(interestRate);

    try {
      const created = await createMutation.mutateAsync({
        name: name.trim(),
        principalAmount: p,
        interestRate: isNaN(rate) ? 0 : rate,
        emiAmount: emi,
        tenureMonths: tenure,
        startDate: startDate || toInputDate(),
        endDate: endDate || undefined,
        description: description.trim() || undefined,
      });

      if (created?.id) {
        router.push(`/loans/${created.id}`);
      } else {
        router.push("/loans");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create loan liability");
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Add Loan / EMI Liability"
        description="Configure a personal loan, vehicle EMI, or gadget financing to track repayment schedule"
      >
        <Link href="/loans">
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <ArrowLeft className="h-4 w-4" /> Back to Loans
          </Button>
        </Link>
      </PageHeader>

      {/* Popular Loan Presets */}
      <Card className="border-border bg-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Popular Loan Configurations
          </h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Choose a preset below to pre-populate typical terms, interest rates, and loan durations:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {LOAN_PRESETS.map((preset) => {
            const Icon = preset.icon;
            const isSelected = name === preset.name;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={`flex flex-col gap-1.5 p-3 rounded-lg border text-left transition-all text-xs ${
                  isSelected
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-border hover:border-primary/40 hover:bg-muted/40 text-foreground"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="h-7 w-7 rounded-md bg-secondary flex items-center justify-center text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground font-semibold">
                    {preset.tenureMonths}m @ {preset.interestRate}%
                  </span>
                </div>
                <span className="font-semibold block truncate mt-1">{preset.name}</span>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {formatCurrency(preset.principalAmount)} • {formatCurrency(preset.emiAmount)}/m
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Main Loan Details Form */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Landmark className="h-4 w-4 text-primary" /> Loan Specifications
          </CardTitle>
          <CardDescription className="text-xs">
            Enter the borrowed principal, tenure, annual interest rate, and monthly installment amount.
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
                label="Loan Name / Description"
                placeholder="e.g. MacBook Pro M3 EMI (HDFC)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Input
                label="Principal Borrowed (₹)"
                type="number"
                step="0.01"
                min="1"
                placeholder="e.g. 80000"
                value={principalAmount}
                onChange={(e) => setPrincipalAmount(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Annual Interest Rate (%)"
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="e.g. 10.5"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                helperText="0 for No-Cost EMI"
              />

              <Input
                label="Tenure (Months)"
                type="number"
                min="1"
                max="600"
                placeholder="e.g. 12"
                value={tenureMonths}
                onChange={(e) => setTenureMonths(e.target.value)}
                required
              />

              <div className="space-y-1.5 text-left">
                <Input
                  label="Monthly EMI (₹)"
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="e.g. 6667"
                  value={emiAmount}
                  onChange={(e) => setEmiAmount(e.target.value)}
                  required
                />
                {calculatedEmi > 0 && (
                  <button
                    type="button"
                    onClick={handleApplyCalculatedEmi}
                    className="text-[11px] text-primary hover:underline flex items-center gap-1 font-medium"
                  >
                    <Calculator className="h-3 w-3" /> Use calculated: {formatCurrency(calculatedEmi)}
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />

              <Input
                label="Maturity / End Date (Optional)"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                helperText="Estimated loan completion date"
              />
            </div>

            <Textarea
              label="Description / Account Notes (Optional)"
              placeholder="e.g. Loan Account #987654321 at HDFC Bank. Autodebit on 5th of every month."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Link href="/loans">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                className="gap-2"
                isLoading={createMutation.isPending}
              >
                <Landmark className="h-4 w-4" /> Save Loan Liability
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
