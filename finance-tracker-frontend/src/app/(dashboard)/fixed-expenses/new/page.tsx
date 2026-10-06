"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarClock, Save, Plus } from "lucide-react";
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
  CardFooter,
  Checkbox,
} from "@/components/ui";
import { useCategories, useSubcategories } from "@/hooks/use-categories";
import { useAccounts } from "@/hooks/use-accounts";
import { useCreateFixedExpense } from "@/hooks/use-fixed-expenses";
import { formatCurrency } from "@/lib/formatters/currency";
import { toast } from "sonner";
import type { FixedExpenseFrequency } from "@/types/fixed-expense";

export default function NewFixedExpensePage() {
  const router = useRouter();

  const todayStr = new Date().toISOString().split("T")[0];

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [frequency, setFrequency] = useState<FixedExpenseFrequency>("MONTHLY");
  const [startDate, setStartDate] = useState(todayStr);
  const [nextDueDate, setNextDueDate] = useState(todayStr);
  const [endDate, setEndDate] = useState("");
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [description, setDescription] = useState("");

  const { data: categoriesData } = useCategories();
  const { data: subcategoriesData } = useSubcategories(categoryId);
  const { data: accountsData } = useAccounts();
  const createMutation = useCreateFixedExpense();

  const categories = categoriesData || [];
  const subcategories = subcategoriesData || [];
  const accounts = accountsData || [];

  // Reset subcategory when category changes
  useEffect(() => {
    if (subcategories.length > 0) {
      setSubcategoryId(subcategories[0].id);
    } else {
      setSubcategoryId("");
    }
  }, [categoryId, subcategories]);

  // Set default category and account when loaded
  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  useEffect(() => {
    if (accounts.length > 0 && !accountId) {
      setAccountId(accounts[0].id);
    }
  }, [accounts, accountId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter an expense name");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid positive amount");
      return;
    }

    if (!categoryId) {
      toast.error("Please select a category");
      return;
    }

    if (!subcategoryId) {
      toast.error("Please select a subcategory (required for recurring audit)");
      return;
    }

    if (!accountId) {
      toast.error("Please select an account");
      return;
    }

    if (!startDate || !nextDueDate) {
      toast.error("Please provide valid start and next due dates");
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        amount: numAmount,
        categoryId,
        subcategoryId,
        accountId,
        frequency,
        startDate,
        nextDueDate,
        endDate: endDate ? endDate : undefined,
        autoGenerate,
        description: description.trim() || undefined,
      });

      router.push("/fixed-expenses");
    } catch {
      // Handled by mutation onError toast
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/fixed-expenses">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">Add Fixed Expense</h1>
          <p className="text-xs text-muted-foreground">
            Configure a recurring payment schedule for rent, bills, or subscriptions
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-border">
          <CardHeader className="border-b border-border bg-muted/20 pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-primary" /> Expense Schedule Details
            </CardTitle>
            <CardDescription className="text-xs">
              This will automatically calculate upcoming dues and let you log transactions in 1 click
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-5">
            {/* Expense Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Expense Name <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="e.g. Flat Rent, Netflix, Gym Membership, Internet Bill"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Amount & Frequency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Amount (₹) <span className="text-destructive">*</span>
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Billing Frequency <span className="text-destructive">*</span>
                </label>
                <Select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as FixedExpenseFrequency)}
                  options={[
                    { value: "MONTHLY", label: "Monthly" },
                    { value: "WEEKLY", label: "Weekly" },
                    { value: "YEARLY", label: "Yearly" },
                  ]}
                />
              </div>
            </div>

            {/* Category & Subcategory */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Category <span className="text-destructive">*</span>
                </label>
                <Select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  options={[
                    { value: "", label: "Select Category..." },
                    ...categories.map((c) => ({ value: c.id, label: c.name })),
                  ]}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Subcategory <span className="text-destructive">*</span>
                </label>
                <Select
                  value={subcategoryId}
                  onChange={(e) => setSubcategoryId(e.target.value)}
                  options={[
                    { value: "", label: subcategories.length ? "Select Subcategory..." : "No Subcategories" },
                    ...subcategories.map((sc) => ({ value: sc.id, label: sc.name })),
                  ]}
                  disabled={!categoryId || subcategories.length === 0}
                  required
                />
                {categoryId && subcategories.length === 0 && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                    This category has no subcategories. Please add one under{" "}
                    <Link href={`/categories/${categoryId}`} className="underline">
                      Categories
                    </Link>{" "}
                    first.
                  </p>
                )}
              </div>
            </div>

            {/* Debit Account */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Payment Account <span className="text-destructive">*</span>
              </label>
              <Select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                options={[
                  { value: "", label: "Select Account..." },
                  ...accounts.map((a) => {
                    const bal = Number(a.currentBalance ?? a.balance ?? a.openingBalance) || 0;
                    return {
                      value: a.id,
                      label: `${a.name} (${a.accountType} — ${formatCurrency(bal)})`,
                    };
                  }),
                ]}
                required
              />
            </div>

            {/* Schedule Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Start Date <span className="text-destructive">*</span>
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Next Due Date <span className="text-destructive">*</span>
                </label>
                <Input
                  type="date"
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  End Date (Optional)
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Auto Generate Toggle */}
            <div className="pt-2">
              <Checkbox
                id="autoGenerate"
                checked={autoGenerate}
                onChange={(e) => setAutoGenerate(e.target.checked)}
                label="Auto-advance schedule date when logging expense transactions"
              />
            </div>

            {/* Description / Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Notes / Description</label>
              <Textarea
                placeholder="Optional billing notes, consumer number, or vendor details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>

          <CardFooter className="border-t border-border bg-muted/10 p-4 flex justify-end gap-2">
            <Link href="/fixed-expenses">
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={createMutation.isPending || !subcategoryId}
              isLoading={createMutation.isPending}
              className="gap-2"
            >
              <Save className="h-4 w-4" /> Save Fixed Expense
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
