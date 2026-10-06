"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Repeat, Save } from "lucide-react";
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
} from "@/components/ui";
import { useCategories, useSubcategories } from "@/hooks/use-categories";
import { useAccounts } from "@/hooks/use-accounts";
import { useCreateRecurringTransaction } from "@/hooks/use-recurring";
import { formatCurrency } from "@/lib/formatters/currency";
import { toast } from "sonner";
import type {
  RecurringFrequency,
  RecurringType,
  RecurringPaymentMethod,
} from "@/types/recurring";

export default function NewRecurringRulePage() {
  const router = useRouter();
  const todayStr = new Date().toISOString().split("T")[0];

  const [name, setName] = useState("");
  const [transactionType, setTransactionType] = useState<RecurringType>("EXPENSE");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState<RecurringFrequency>("MONTHLY");
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<RecurringPaymentMethod>("UPI");
  const [startDate, setStartDate] = useState(todayStr);
  const [nextRunDate, setNextRunDate] = useState(todayStr);
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");

  const { data: categoriesData } = useCategories();
  const { data: subcategoriesData } = useSubcategories(categoryId);
  const { data: accountsData } = useAccounts();
  const createMutation = useCreateRecurringTransaction();

  const categories = categoriesData || [];
  const subcategories = subcategoriesData || [];
  const accounts = accountsData || [];

  // Reset subcategory on category change
  useEffect(() => {
    if (subcategories.length > 0) {
      setSubcategoryId(subcategories[0].id);
    } else {
      setSubcategoryId("");
    }
  }, [categoryId, subcategories]);

  // Default selections
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
      toast.error("Please enter a rule name");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid positive amount");
      return;
    }

    if (!accountId) {
      toast.error("Please select a source account");
      return;
    }

    if (!startDate || !nextRunDate) {
      toast.error("Please provide valid start and next run dates");
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        transactionType,
        amount: numAmount,
        accountId,
        categoryId: categoryId || undefined,
        subcategoryId: subcategoryId || undefined,
        paymentMethod,
        frequency,
        startDate,
        nextRunDate,
        endDate: endDate || undefined,
        notes: notes.trim() || undefined,
      });

      router.push("/recurring");
    } catch {
      // Handled by mutation onError toast
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/recurring">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">Add Recurring Rule</h1>
          <p className="text-xs text-muted-foreground">
            Schedule automated recurring expenses, SIPs, transfers, or loan EMIs
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-border">
          <CardHeader className="border-b border-border bg-muted/20 pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Repeat className="h-4 w-4 text-primary" /> Recurring Rule Parameters
            </CardTitle>
            <CardDescription className="text-xs">
              Configure timing, frequency, and financial flow categories
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-5">
            {/* Rule Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Rule Name <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="e.g. Monthly SIP Mutual Fund, Home Loan EMI, Netflix, Mobile Bill"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Transaction Type & Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Transaction Type <span className="text-destructive">*</span>
                </label>
                <Select
                  value={transactionType}
                  onChange={(e) => setTransactionType(e.target.value as RecurringType)}
                  options={[
                    { value: "EXPENSE", label: "Expense" },
                    { value: "INVESTMENT", label: "Investment" },
                    { value: "SAVING", label: "Savings" },
                    { value: "TRANSFER", label: "Transfer" },
                    { value: "LOAN_PAYMENT", label: "Loan Payment (EMI)" },
                  ]}
                />
              </div>

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
            </div>

            {/* Frequency & Payment Method */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Execution Frequency <span className="text-destructive">*</span>
                </label>
                <Select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}
                  options={[
                    { value: "MONTHLY", label: "Monthly" },
                    { value: "WEEKLY", label: "Weekly" },
                    { value: "YEARLY", label: "Yearly" },
                  ]}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Payment Method</label>
                <Select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as RecurringPaymentMethod)}
                  options={[
                    { value: "UPI", label: "UPI" },
                    { value: "BANK_TRANSFER", label: "Bank Transfer (NEFT/IMPS)" },
                    { value: "DEBIT_CARD", label: "Debit Card" },
                    { value: "CASH", label: "Cash" },
                    { value: "OTHER", label: "Other" },
                  ]}
                />
              </div>
            </div>

            {/* Source Account */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Source Account <span className="text-destructive">*</span>
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

            {/* Category & Subcategory */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Category (Optional)</label>
                <Select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  options={[
                    { value: "", label: "Select Category (Optional)..." },
                    ...categories.map((c) => ({ value: c.id, label: c.name })),
                  ]}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Subcategory</label>
                <Select
                  value={subcategoryId}
                  onChange={(e) => setSubcategoryId(e.target.value)}
                  options={[
                    { value: "", label: "Select Subcategory..." },
                    ...subcategories.map((sc) => ({ value: sc.id, label: sc.name })),
                  ]}
                  disabled={!categoryId || subcategories.length === 0}
                />
              </div>
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
                  Next Run Date <span className="text-destructive">*</span>
                </label>
                <Input
                  type="date"
                  value={nextRunDate}
                  onChange={(e) => setNextRunDate(e.target.value)}
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

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Notes / Metadata</label>
              <Textarea
                placeholder="Optional mandate details, loan folio number, SIP scheme name..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>

          <CardFooter className="border-t border-border bg-muted/10 p-4 flex justify-end gap-2">
            <Link href="/recurring">
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              isLoading={createMutation.isPending}
              className="gap-2"
            >
              <Save className="h-4 w-4" /> Save Recurring Rule
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
