"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  IndianRupee,
  Briefcase,
  Calendar,
  Building,
  Plus,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Button,
  Input,
  Textarea,
  Select,
  Checkbox,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui";
import { useCreateIncome, useIncomeSources, useCreateIncomeSource } from "@/hooks/use-income";
import { useAccounts } from "@/hooks/use-accounts";
import {
  incomeSchema,
  newSourceSchema,
  type IncomeFormData,
  type NewSourceFormData,
} from "@/schemas/income.schema";
import { toInputDate } from "@/lib/formatters/date";

export default function NewIncomePage() {
  const router = useRouter();

  // Dialog for creating a new income source
  const [isAddingSource, setIsAddingSource] = useState(false);

  // Salary prompt trigger dialog after submission
  const [salaryRecorded, setSalaryRecorded] = useState(false);

  const { data: sources = [], isLoading: isLoadingSources } = useIncomeSources();
  const { data: accounts = [], isLoading: isLoadingAccounts } = useAccounts();

  const createIncomeMutation = useCreateIncome();
  const createSourceMutation = useCreateIncomeSource();

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      incomeSourceId: "",
      accountId: "",
      amount: undefined,
      receivedDate: toInputDate(),
      description: "",
      isRecurring: false,
      notes: "",
    },
  });

  // Source creation sub-form
  const {
    register: registerSource,
    handleSubmit: handleSubmitSource,
    reset: resetSource,
    formState: { errors: sourceErrors },
  } = useForm<NewSourceFormData>({
    resolver: zodResolver(newSourceSchema),
    defaultValues: {
      name: "",
      isSalary: false,
    },
  });

  const selectedSourceId = watch("incomeSourceId");
  const selectedSource = sources.find((s) => s.id === selectedSourceId);

  const onSubmit = async (values: IncomeFormData) => {
    await createIncomeMutation.mutateAsync({
      incomeSourceId: values.incomeSourceId,
      accountId: values.accountId,
      amount: values.amount,
      receivedDate: values.receivedDate,
      description: values.description || undefined,
      notes: values.notes || undefined,
    });

    // Check if salary was recorded
    if (selectedSource?.isSalary) {
      setSalaryRecorded(true);
    } else {
      router.push("/income");
    }
  };

  const onAddSource = async (values: NewSourceFormData) => {
    const created = await createSourceMutation.mutateAsync(values);
    setIsAddingSource(false);
    resetSource();
    if (created?.id) {
      setValue("incomeSourceId", created.id);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/income"
          className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to income
        </Link>
      </div>

      <PageHeader
        title="Record Income"
        description="Log salary credits, freelance payments, business revenue, or investment profits"
      />

      <Card className="border-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Inflow Information</CardTitle>
          <CardDescription>
            Specify the incoming revenue details and recipient account
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {/* Amount */}
            <Input
              label="Amount (₹)"
              type="number"
              step="0.01"
              placeholder="50000.00"
              leftIcon={<IndianRupee className="h-4 w-4 text-muted-foreground" />}
              error={errors.amount?.message}
              {...register("amount", { valueAsNumber: true })}
            />

            {/* Income Source with Quick Add */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">Income Source</label>
                <button
                  type="button"
                  onClick={() => setIsAddingSource(true)}
                  className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" /> New Source
                </button>
              </div>
              <Controller
                name="incomeSourceId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.incomeSourceId?.message}
                    options={[
                      {
                        value: "",
                        label: isLoadingSources ? "Loading sources..." : "Select source",
                      },
                      ...sources.map((s) => ({
                        value: s.id,
                        label: `${s.name}${s.isSalary ? " (Salary)" : ""}`,
                      })),
                    ]}
                  />
                )}
              />
            </div>

            {/* Deposit Account */}
            <div className="space-y-1.5">
              <Controller
                name="accountId"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Deposit Account"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.accountId?.message}
                    options={[
                      {
                        value: "",
                        label: isLoadingAccounts ? "Loading accounts..." : "Select deposit account",
                      },
                      ...accounts.map((a) => ({
                        value: a.id,
                        label: `${a.name} (${a.accountType})`,
                      })),
                    ]}
                  />
                )}
              />
            </div>

            {/* Received Date */}
            <Input
              label="Date Received"
              type="date"
              leftIcon={<Calendar className="h-4 w-4 text-muted-foreground" />}
              error={errors.receivedDate?.message}
              {...register("receivedDate")}
            />

            {/* Description */}
            <Input
              label="Description (Optional)"
              placeholder="e.g. September Salary, Freelance Frontend Retainer"
              leftIcon={<Briefcase className="h-4 w-4 text-muted-foreground" />}
              error={errors.description?.message}
              {...register("description")}
            />

            {/* Notes */}
            <Textarea
              label="Notes & Context (Optional)"
              placeholder="Any details regarding withholding taxes, invoice references, etc..."
              rows={3}
              error={errors.notes?.message}
              {...register("notes")}
            />
          </CardContent>

          <CardFooter className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Link href="/income">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" isLoading={createIncomeMutation.isPending}>
              Record Income
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Add Source Modal Dialog */}
      <Dialog open={isAddingSource} onOpenChange={setIsAddingSource}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Income Source</DialogTitle>
            <DialogDescription>
              Create a reusable source for organizing future inflows
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitSource(onAddSource)} className="space-y-4 py-2">
            <Input
              label="Source Name"
              placeholder="e.g. Acme Corp Salary, Upwork Client"
              error={sourceErrors.name?.message}
              {...registerSource("name")}
            />

            <Checkbox
              label="Mark this source as Salary"
              description="Salary deposits can trigger automated zero-based budget allocations"
              {...registerSource("isSalary")}
            />

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddingSource(false)}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={createSourceMutation.isPending}>
                Create Source
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Salary Trigger Prompt Modal */}
      <Dialog open={salaryRecorded} onOpenChange={setSalaryRecorded}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-2">
            <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
              <Sparkles className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-lg">Salary Credited!</DialogTitle>
            <DialogDescription className="text-center text-sm">
              Your salary has been recorded. Would you like to generate this month&apos;s budget
              from your allocation template?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => router.push("/income")}
            >
              Skip to Income List
            </Button>
            <Button
              className="w-full sm:w-auto gap-2"
              onClick={() => router.push("/budget/allocation")}
            >
              <Sparkles className="h-4 w-4" /> Generate Budget
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
