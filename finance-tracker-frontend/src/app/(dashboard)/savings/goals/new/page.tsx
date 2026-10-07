"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  PiggyBank,
  Sparkles,
  Target,
  Calendar,
  AlertCircle,
  ShieldCheck,
  Plane,
  HeartPulse,
  Home,
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
import { useCreateSavingsGoal } from "@/hooks/use-savings";
import { toInputDate } from "@/lib/formatters/date";

interface Preset {
  name: string;
  targetAmount: number;
  description: string;
  icon: React.ElementType;
}

const PRESETS: Preset[] = [
  {
    name: "Emergency Fund (3–6 Months)",
    targetAmount: 150000,
    description: "Crucial liquid safety net to cover mandatory living expenses during unforeseen job changes or emergencies.",
    icon: ShieldCheck,
  },
  {
    name: "Medical & Health Contingency",
    targetAmount: 50000,
    description: "Dedicated reserve for out-of-pocket medical emergencies and healthcare deductibles.",
    icon: HeartPulse,
  },
  {
    name: "Annual Insurance & Tax Pool",
    targetAmount: 40000,
    description: "Stashed funds for annual insurance premiums, property tax, and recurring annual bills.",
    icon: PiggyBank,
  },
  {
    name: "Home Down Payment & Renovation",
    targetAmount: 300000,
    description: "Accumulated capital for home improvements, interior furnishings, or property deposit.",
    icon: Home,
  },
  {
    name: "Vacation & Travel Adventure",
    targetAmount: 60000,
    description: "Dedicated travel savings for upcoming domestic and international vacations.",
    icon: Plane,
  },
];

export default function NewSavingsGoalPage() {
  const router = useRouter();
  const createMutation = useCreateSavingsGoal();

  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleApplyPreset = (preset: Preset) => {
    setName(preset.name);
    setTargetAmount(String(preset.targetAmount));
    setDescription(preset.description);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please provide a name for your savings goal");
      return;
    }

    const amt = parseFloat(targetAmount);
    if (!amt || isNaN(amt) || amt <= 0) {
      setError("Please enter a valid target amount greater than 0");
      return;
    }

    try {
      const created = await createMutation.mutateAsync({
        name: name.trim(),
        targetAmount: amt,
        targetDate: targetDate || undefined,
        description: description.trim() || undefined,
      });

      if (created?.id) {
        router.push(`/savings/goals/${created.id}`);
      } else {
        router.push("/savings/goals");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create savings goal. Please try again.");
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Create Savings Goal"
        description="Set up a target milestone to build financial safety or save for a planned purchase"
      >
        <Link href="/savings/goals">
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <ArrowLeft className="h-4 w-4" /> Back to Goals
          </Button>
        </Link>
      </PageHeader>

      {/* Recommended Presets */}
      <Card className="border-border bg-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Popular Goal Presets
          </h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Click any preset below to quickly pre-populate standard savings targets and descriptions:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
          {PRESETS.map((preset) => {
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
                  <span className="text-[11px] text-muted-foreground font-mono">
                    ₹{preset.targetAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Goal Configuration Form */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" /> Goal Details
          </CardTitle>
          <CardDescription className="text-xs">
            Enter your target amount, completion timeline, and purpose for this savings bucket.
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
                label="Goal Name"
                placeholder="e.g. Emergency Fund (6 Months)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Input
                label="Target Amount (₹)"
                type="number"
                step="0.01"
                min="1"
                placeholder="e.g. 150000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Target Completion Date (Optional)"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                helperText="Target date to reach this fund (optional)"
              />
            </div>

            <Textarea
              label="Description / Purpose (Optional)"
              placeholder="e.g. Mandatory safety buffer kept in high-yield liquid account to cover unforeseen expenses or job disruption."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              helperText="Add any context or rules for when this fund may be spent."
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Link href="/savings/goals">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                className="gap-2"
                isLoading={createMutation.isPending}
              >
                <PiggyBank className="h-4 w-4" /> Create Goal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
