"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  IndianRupee,
  Calendar,
  FileText,
  CreditCard,
  Tag,
  Building,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Button,
  Input,
  Textarea,
  Select,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui";
import { useCreateTransaction } from "@/hooks/use-transactions";
import { useAccounts } from "@/hooks/use-accounts";
import { useCategories, useSubcategories } from "@/hooks/use-categories";
import { transactionSchema, type TransactionFormData } from "@/schemas/transaction.schema";
import { toInputDate } from "@/lib/formatters/date";

export default function NewTransactionPage() {
  const router = useRouter();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  const { data: accounts = [], isLoading: isLoadingAccounts } = useAccounts();
  const { data: categories = [], isLoading: isLoadingCategories } = useCategories();
  const { data: subcategories = [], isLoading: isLoadingSubcategories } =
    useSubcategories(selectedCategoryId);

  const createMutation = useCreateTransaction();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      transactionType: "EXPENSE",
      amount: undefined,
      accountId: "",
      categoryId: "",
      subcategoryId: "",
      paymentMethod: "UPI",
      transactionDate: toInputDate(),
      description: "",
      notes: "",
    },
  });

  const currentType = watch("transactionType");

  const onSubmit = async (values: TransactionFormData) => {
    await createMutation.mutateAsync({
      ...values,
      categoryId: values.categoryId || undefined,
      subcategoryId: values.subcategoryId || undefined,
      paymentMethod: values.paymentMethod || undefined,
      notes: values.notes || undefined,
    });
    router.push("/transactions");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/transactions"
          className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to transactions
        </Link>
      </div>

      <PageHeader
        title="Record Transaction"
        description="Add a new expense, income credit, or transfer into your account ledger"
      />

      <Card className="border-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Transaction Details</CardTitle>
          <CardDescription>
            Specify the transaction attributes and destination category
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {/* Transaction Type Segmented Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Transaction Type</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "EXPENSE", label: "Expense" },
                  { id: "INCOME", label: "Income" },
                  { id: "TRANSFER", label: "Transfer" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setValue("transactionType", t.id as "EXPENSE" | "INCOME" | "TRANSFER")}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                      currentType === t.id
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-muted/30 text-muted-foreground border-border hover:bg-muted/70 hover:text-foreground"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Input */}
            <Input
              label="Amount (₹)"
              type="number"
              step="0.01"
              placeholder="0.00"
              leftIcon={<IndianRupee className="h-4 w-4 text-muted-foreground" />}
              error={errors.amount?.message}
              {...register("amount", { valueAsNumber: true })}
            />

            {/* Description */}
            <Input
              label="Description / Merchant"
              placeholder="e.g. Grocery Store, Restaurant, Monthly Rent"
              leftIcon={<FileText className="h-4 w-4 text-muted-foreground" />}
              error={errors.description?.message}
              {...register("description")}
            />

            {/* Account & Payment Method Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Controller
                  name="accountId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Source Account"
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.accountId?.message}
                      options={[
                        {
                          value: "",
                          label: isLoadingAccounts ? "Loading accounts..." : "Select account",
                        },
                        ...accounts.map((acc) => ({
                          value: acc.id,
                          label: `${acc.name} (${acc.accountType})`,
                        })),
                      ]}
                    />
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Controller
                  name="paymentMethod"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Payment Method"
                      value={field.value}
                      onChange={field.onChange}
                      options={[
                        { value: "UPI", label: "UPI (GPay / PhonePe / Paytm)" },
                        { value: "CARD", label: "Debit / Credit Card" },
                        { value: "NET_BANKING", label: "Net Banking" },
                        { value: "CASH", label: "Cash" },
                        { value: "OTHER", label: "Other" },
                      ]}
                    />
                  )}
                />
              </div>
            </div>

            {/* Category & Dynamic Subcategory Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Category"
                      value={field.value}
                      onChange={(e) => {
                        field.onChange(e);
                        setSelectedCategoryId(e.target.value);
                        setValue("subcategoryId", "");
                      }}
                      options={[
                        {
                          value: "",
                          label: isLoadingCategories ? "Loading categories..." : "Select category (Optional)",
                        },
                        ...categories.map((cat) => ({
                          value: cat.id,
                          label: cat.name,
                        })),
                      ]}
                    />
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Controller
                  name="subcategoryId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Subcategory"
                      value={field.value}
                      onChange={field.onChange}
                      disabled={!selectedCategoryId}
                      options={[
                        {
                          value: "",
                          label: !selectedCategoryId
                            ? "Select a category first"
                            : isLoadingSubcategories
                            ? "Loading subcategories..."
                            : "Select subcategory (Optional)",
                        },
                        ...subcategories.map((sub) => ({
                          value: sub.id,
                          label: sub.name,
                        })),
                      ]}
                    />
                  )}
                />
              </div>
            </div>

            {/* Date Input */}
            <Input
              label="Transaction Date"
              type="date"
              leftIcon={<Calendar className="h-4 w-4 text-muted-foreground" />}
              error={errors.transactionDate?.message}
              {...register("transactionDate")}
            />

            {/* Optional Notes */}
            <Textarea
              label="Additional Notes (Optional)"
              placeholder="Add any reminders, order numbers, or context..."
              rows={3}
              error={errors.notes?.message}
              {...register("notes")}
            />
          </CardContent>

          <CardFooter className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Link href="/transactions">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" isLoading={createMutation.isPending}>
              Save Transaction
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
