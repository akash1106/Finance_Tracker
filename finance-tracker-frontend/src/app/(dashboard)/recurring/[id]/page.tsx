"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Repeat,
  Play,
  Trash2,
  Clock,
  ExternalLink,
  Wallet,
  Tag,
  CreditCard,
  Calendar,
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
  useRecurringTransaction,
  useGenerateRecurringTransaction,
  useDeactivateRecurringTransaction,
} from "@/hooks/use-recurring";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate } from "@/lib/formatters/date";

const TYPE_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  EXPENSE: { label: "Expense", variant: "destructive" },
  INCOME: { label: "Income", variant: "default" },
  TRANSFER: { label: "Transfer", variant: "secondary" },
  SAVING: { label: "Savings", variant: "secondary" },
  INVESTMENT: { label: "Investment", variant: "outline" },
  LOAN_PAYMENT: { label: "Loan EMI", variant: "outline" },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RecurringRuleDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);

  const { data: rule, isLoading, isError } = useRecurringTransaction(id);
  const generateMutation = useGenerateRecurringTransaction();
  const deactivateMutation = useDeactivateRecurringTransaction();

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

  if (isError || !rule) {
    return (
      <div className="p-8 text-center space-y-4 max-w-md mx-auto">
        <p className="text-destructive font-medium">Recurring rule not found or failed to load.</p>
        <Link href="/recurring">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Recurring Rules
          </Button>
        </Link>
      </div>
    );
  }

  const typeConfig = TYPE_CONFIG[rule.transactionType] || {
    label: rule.transactionType,
    variant: "secondary" as const,
  };

  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const runDate = new Date(rule.nextRunDate);
  const diffDays = Math.ceil((runDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const isDueToday = diffDays === 0;
  const isPastDue = diffDays < 0;
  const isDueSoon = diffDays > 0 && diffDays <= 7;

  const handleExecute = async () => {
    await generateMutation.mutateAsync(rule.id);
  };

  const handleDeactivate = async () => {
    await deactivateMutation.mutateAsync(rule.id);
    router.push("/recurring");
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/recurring">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">{rule.name}</h1>
              <Badge variant={typeConfig.variant}>{typeConfig.label}</Badge>
              <Badge variant={rule.isActive ? "success" : "secondary"}>
                {rule.isActive ? "Active" : "Archived"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Automated recurring transaction rule
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
            onClick={handleExecute}
            isLoading={generateMutation.isPending}
            disabled={generateMutation.isPending || !rule.isActive}
          >
            <Play className="h-3.5 w-3.5" /> Run Schedule Now
          </Button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-card border-border">
          <span className="text-xs font-medium text-muted-foreground">Execution Amount</span>
          <div className="mt-2">
            <span className="text-2xl font-bold text-foreground">
              {formatCurrency(rule.amount)}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Repeats {rule.frequency.toLowerCase()}
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Next Run Date</span>
            {isPastDue ? (
              <Badge variant="destructive" className="text-[10px] py-0 px-1.5">
                Past Due
              </Badge>
            ) : isDueToday ? (
              <Badge className="text-[10px] py-0 px-1.5 bg-amber-500 text-white">Today</Badge>
            ) : isDueSoon ? (
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-amber-500 border-amber-400">
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
              {formatDate(rule.nextRunDate, "dd MMM yyyy")}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {isPastDue
                ? `${Math.abs(diffDays)} days overdue`
                : `Next trigger in ${diffDays} days`}
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <span className="text-xs font-medium text-muted-foreground">Debit Account</span>
          <div className="mt-2">
            <p className="text-base font-semibold text-foreground truncate">
              {rule.account?.name || "Default Account"}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              via {rule.paymentMethod || "Direct Debit"}
            </p>
          </div>
        </Card>
      </div>

      {/* Rule Specifications */}
      <Card className="border-border">
        <CardHeader className="py-3 px-4 border-b border-border bg-muted/20">
          <CardTitle className="text-sm font-semibold">Rule Specifications</CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground font-medium">Category:</span>
              <p className="font-semibold text-foreground text-sm mt-0.5">
                {rule.category?.name || "General (None specified)"}
                {rule.subcategory?.name && (
                  <span className="font-normal text-muted-foreground">
                    {" "}
                    / {rule.subcategory.name}
                  </span>
                )}
              </p>
            </div>

            <div>
              <span className="text-muted-foreground font-medium">Payment Method:</span>
              <p className="font-semibold text-foreground text-sm mt-0.5">
                {rule.paymentMethod || "UPI / Auto-Debit"}
              </p>
            </div>

            <div>
              <span className="text-muted-foreground font-medium">Start Date:</span>
              <p className="font-semibold text-foreground text-sm mt-0.5">
                {formatDate(rule.startDate, "dd MMMM yyyy")}
              </p>
            </div>

            <div>
              <span className="text-muted-foreground font-medium">End Date:</span>
              <p className="font-semibold text-foreground text-sm mt-0.5">
                {rule.endDate ? formatDate(rule.endDate, "dd MMMM yyyy") : "Ongoing (No end date)"}
              </p>
            </div>
          </div>

          {rule.notes && (
            <div className="p-3 bg-muted/30 rounded-lg text-xs space-y-1">
              <span className="font-semibold text-foreground block">Notes & Details:</span>
              <p className="text-muted-foreground">{rule.notes}</p>
            </div>
          )}

          <div className="pt-3 border-t border-border flex items-center justify-between">
            <Link
              href="/transactions"
              className="text-xs text-primary inline-flex items-center gap-1 hover:underline font-medium"
            >
              Audit transactions ledger <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            <span className="text-[11px] text-muted-foreground font-mono">ID: {rule.id}</span>
          </div>
        </CardContent>
      </Card>

      {/* Deactivate Modal */}
      <Dialog open={isDeactivateOpen} onOpenChange={setIsDeactivateOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Deactivate Recurring Rule?</DialogTitle>
            <DialogDescription>
              Are you sure you want to archive {rule.name}? It will stop executing automatically.
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
