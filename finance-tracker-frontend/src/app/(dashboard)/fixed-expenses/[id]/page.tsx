"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  Play,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Wallet,
  Tag,
  Calendar,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Skeleton,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui";
import {
  useFixedExpense,
  useGenerateFixedExpense,
  useDeactivateFixedExpense,
} from "@/hooks/use-fixed-expenses";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate } from "@/lib/formatters/date";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function FixedExpenseDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);

  const { data: expense, isLoading, isError } = useFixedExpense(id);
  const generateMutation = useGenerateFixedExpense();
  const deactivateMutation = useDeactivateFixedExpense();

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !expense) {
    return (
      <div className="p-8 text-center space-y-4 max-w-md mx-auto">
        <p className="text-destructive font-medium">Fixed expense not found or failed to load.</p>
        <Link href="/fixed-expenses">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Fixed Expenses
          </Button>
        </Link>
      </div>
    );
  }

  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const dueDate = new Date(expense.nextDueDate);
  const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = diffDays < 0;
  const isDueToday = diffDays === 0;
  const isDueSoon = diffDays > 0 && diffDays <= 7;

  const handleGenerate = async () => {
    await generateMutation.mutateAsync(expense.id);
  };

  const handleDeactivate = async () => {
    await deactivateMutation.mutateAsync(expense.id);
    router.push("/fixed-expenses");
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/fixed-expenses">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">{expense.name}</h1>
              <Badge variant={expense.isActive ? "success" : "secondary"}>
                {expense.isActive ? "Active" : "Archived"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Fixed recurring obligation schedule
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive/10 border-destructive/30 text-xs"
            onClick={() => setIsDeactivateOpen(true)}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Deactivate
          </Button>
          <Button
            size="sm"
            className="gap-1.5 text-xs"
            onClick={handleGenerate}
            isLoading={generateMutation.isPending}
            disabled={generateMutation.isPending || !expense.isActive}
          >
            <Play className="h-3.5 w-3.5" /> Log Transaction Now
          </Button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-card border-border">
          <span className="text-xs font-medium text-muted-foreground">Obligation Amount</span>
          <div className="mt-2">
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {formatCurrency(expense.amount)}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Billed {expense.frequency.toLowerCase()}
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Next Due Date</span>
            {isOverdue ? (
              <Badge variant="destructive" className="text-[10px] py-0 px-1.5">
                Overdue
              </Badge>
            ) : isDueToday ? (
              <Badge className="text-[10px] py-0 px-1.5 bg-amber-500 text-white">Due Today</Badge>
            ) : isDueSoon ? (
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-amber-500">
                in {diffDays}d
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                Scheduled
              </Badge>
            )}
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-foreground">
              {formatDate(expense.nextDueDate, "dd MMM yyyy")}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {isOverdue ? `${Math.abs(diffDays)} days overdue` : `Due in ${diffDays} days`}
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <span className="text-xs font-medium text-muted-foreground">Automation Mode</span>
          <div className="mt-2">
            <div className="flex items-center gap-1.5 text-foreground font-semibold text-base">
              {expense.autoGenerate ? (
                <>
                  <RefreshCw className="h-4 w-4 text-emerald-500" />
                  <span>Auto-Advancing</span>
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Manual Confirmation</span>
                </>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Advances next due date upon payment
            </p>
          </div>
        </Card>
      </div>

      {/* Schedule Specifications */}
      <Card className="border-border">
        <CardHeader className="py-3 px-4 border-b border-border bg-muted/20">
          <CardTitle className="text-sm font-semibold">Schedule Specifications</CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground font-medium">Category:</span>
              <p className="font-semibold text-foreground text-sm mt-0.5">
                {expense.category?.name || "General"}
                {expense.subcategory?.name && (
                  <span className="font-normal text-muted-foreground">
                    {" "}
                    / {expense.subcategory.name}
                  </span>
                )}
              </p>
            </div>

            <div>
              <span className="text-muted-foreground font-medium">Payment Account:</span>
              <p className="font-semibold text-foreground text-sm mt-0.5">
                {expense.account?.name || "Default Account"}
              </p>
            </div>

            <div>
              <span className="text-muted-foreground font-medium">Start Date:</span>
              <p className="font-semibold text-foreground text-sm mt-0.5">
                {formatDate(expense.startDate, "dd MMMM yyyy")}
              </p>
            </div>

            <div>
              <span className="text-muted-foreground font-medium">End Date:</span>
              <p className="font-semibold text-foreground text-sm mt-0.5">
                {expense.endDate ? formatDate(expense.endDate, "dd MMMM yyyy") : "Ongoing (No end date)"}
              </p>
            </div>
          </div>

          {expense.description && (
            <div className="p-3 bg-muted/30 rounded-lg text-xs space-y-1">
              <span className="font-semibold text-foreground block">Notes & Details:</span>
              <p className="text-muted-foreground">{expense.description}</p>
            </div>
          )}

          <div className="pt-3 border-t border-border flex items-center justify-between">
            <Link
              href={`/transactions?categoryFilter=${expense.categoryId}`}
              className="text-xs text-primary inline-flex items-center gap-1 hover:underline font-medium"
            >
              Audit transactions in this category <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            <span className="text-[11px] text-muted-foreground font-mono">
              ID: {expense.id}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Deactivate Modal */}
      <Dialog open={isDeactivateOpen} onOpenChange={setIsDeactivateOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Deactivate Expense?</DialogTitle>
            <DialogDescription>
              Are you sure you want to archive {expense.name}? It will stop appearing in your active schedules.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDeactivate}
              isLoading={deactivateMutation.isPending}
            >
              Confirm Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
