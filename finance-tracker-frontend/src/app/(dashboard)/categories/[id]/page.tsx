"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  FolderTree,
  Plus,
  Pencil,
  Trash2,
  Tag,
  Calendar,
  Layers,
  Receipt,
  IndianRupee,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  PiggyBank,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Button,
  Input,
  Textarea,
  Select,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Skeleton,
  EmptyState,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui";
import {
  useCategory,
  useUpdateCategory,
  useDeactivateCategory,
  useCreateSubcategory,
  useUpdateSubcategory,
  useDeactivateSubcategory,
} from "@/hooks/use-categories";
import { useTransactions } from "@/hooks/use-transactions";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate } from "@/lib/formatters/date";
import {
  categorySchema,
  subcategorySchema,
  type CategoryFormData,
  type SubcategoryFormData,
} from "@/schemas/category.schema";
import type { Subcategory, CategoryType } from "@/types/category";

const TYPE_CONFIG: Record<
  string,
  { label: string; badgeVariant: "default" | "secondary" | "destructive" | "outline"; colorClass: string; icon: React.ElementType }
> = {
  EXPENSE: {
    label: "Expense",
    badgeVariant: "destructive",
    colorClass: "text-rose-500 bg-rose-500/10 border-rose-200 dark:border-rose-900",
    icon: ArrowDownRight,
  },
  INCOME: {
    label: "Income",
    badgeVariant: "default",
    colorClass: "text-emerald-500 bg-emerald-500/10 border-emerald-200 dark:border-emerald-900",
    icon: ArrowUpRight,
  },
  SAVING: {
    label: "Savings",
    badgeVariant: "secondary",
    colorClass: "text-blue-500 bg-blue-500/10 border-blue-200 dark:border-blue-900",
    icon: PiggyBank,
  },
  SAVINGS: {
    label: "Savings",
    badgeVariant: "secondary",
    colorClass: "text-blue-500 bg-blue-500/10 border-blue-200 dark:border-blue-900",
    icon: PiggyBank,
  },
  INVESTMENT: {
    label: "Investment",
    badgeVariant: "outline",
    colorClass: "text-purple-500 bg-purple-500/10 border-purple-200 dark:border-purple-900",
    icon: TrendingUp,
  },
};

export default function CategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  // Dialog State: Edit Category
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);

  // Dialog State: Subcategory
  const [subcategoryModalState, setSubcategoryModalState] = useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    subcategory?: Subcategory;
  }>({ isOpen: false, mode: "create" });

  // Deactivate confirmations
  const [isDeactivatingCategory, setIsDeactivatingCategory] = useState(false);
  const [deactivatingSubcategory, setDeactivatingSubcategory] = useState<Subcategory | null>(null);

  // Queries
  const { data: category, isLoading, isError } = useCategory(id);
  const { data: transactionsData, isLoading: isLoadingTx } = useTransactions({
    categoryId: id,
    limit: 20,
  });

  // Mutations
  const updateCategoryMutation = useUpdateCategory();
  const deactivateCategoryMutation = useDeactivateCategory();
  const createSubcategoryMutation = useCreateSubcategory();
  const updateSubcategoryMutation = useUpdateSubcategory();
  const deactivateSubcategoryMutation = useDeactivateSubcategory();

  // Forms
  const categoryForm = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      categoryType: "EXPENSE",
      description: "",
    },
  });

  const subcategoryForm = useForm<SubcategoryFormData>({
    resolver: zodResolver(subcategorySchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Open Edit Category
  const handleOpenEditCategory = () => {
    if (!category) return;
    const editType: "EXPENSE" | "INCOME" | "SAVING" | "INVESTMENT" =
      category.categoryType === "INCOME"
        ? "INCOME"
        : category.categoryType === "SAVING" || category.categoryType === "SAVINGS"
        ? "SAVING"
        : category.categoryType === "INVESTMENT"
        ? "INVESTMENT"
        : "EXPENSE";

    categoryForm.reset({
      name: category.name,
      categoryType: editType,
      description: category.description || "",
    });
    setIsEditCategoryOpen(true);
  };

  // Open Subcategory Modals
  const handleOpenCreateSubcategory = () => {
    subcategoryForm.reset({
      name: "",
      description: "",
    });
    setSubcategoryModalState({ isOpen: true, mode: "create" });
  };

  const handleOpenEditSubcategory = (sub: Subcategory) => {
    subcategoryForm.reset({
      name: sub.name,
      description: sub.description || "",
    });
    setSubcategoryModalState({ isOpen: true, mode: "edit", subcategory: sub });
  };

  // Submit Category
  const onCategorySubmit = async (values: CategoryFormData) => {
    if (!category) return;
    await updateCategoryMutation.mutateAsync({
      id: category.id,
      data: {
        name: values.name,
        categoryType: values.categoryType,
        description: values.description || undefined,
      },
    });
    setIsEditCategoryOpen(false);
  };

  // Submit Subcategory
  const onSubcategorySubmit = async (values: SubcategoryFormData) => {
    if (!category) return;
    if (subcategoryModalState.mode === "create") {
      await createSubcategoryMutation.mutateAsync({
        categoryId: category.id,
        data: {
          name: values.name,
          description: values.description || undefined,
        },
      });
    } else if (subcategoryModalState.subcategory) {
      await updateSubcategoryMutation.mutateAsync({
        subcategoryId: subcategoryModalState.subcategory.id,
        data: {
          name: values.name,
          description: values.description || undefined,
        },
      });
    }
    setSubcategoryModalState({ isOpen: false, mode: "create" });
  };

  // Confirm Category Deactivate
  const handleConfirmDeactivateCategory = async () => {
    if (!category) return;
    await deactivateCategoryMutation.mutateAsync(category.id);
    router.push("/categories");
  };

  // Confirm Subcategory Deactivate
  const handleConfirmDeactivateSubcategory = async () => {
    if (!deactivatingSubcategory) return;
    await deactivateSubcategoryMutation.mutateAsync(deactivatingSubcategory.id);
    setDeactivatingSubcategory(null);
  };

  // Spending analytics from transactions
  const transactions = transactionsData?.items || [];
  const stats = useMemo(() => {
    let totalFlow = 0;
    transactions.forEach((tx) => {
      totalFlow += Number(tx.amount) || 0;
    });

    const averageAmount = transactions.length > 0 ? totalFlow / transactions.length : 0;

    return {
      totalFlow,
      transactionCount: transactions.length,
      averageAmount,
    };
  }, [transactions]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !category) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <h2 className="text-xl font-bold">Category Not Found</h2>
        <p className="text-sm text-muted-foreground">
          The requested category does not exist or has been deactivated.
        </p>
        <Link href="/categories">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Categories
          </Button>
        </Link>
      </div>
    );
  }

  const config = TYPE_CONFIG[category.categoryType] || TYPE_CONFIG.EXPENSE;
  const IconComponent = config.icon;
  const subcategories = category.subcategories || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back Link */}
      <div className="flex items-center gap-2">
        <Link
          href="/categories"
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Categories
        </Link>
      </div>

      {/* Page Header */}
      <PageHeader
        title={category.name}
        description={
          category.description || `Manage classification and subcategories for ${category.name}`
        }
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenCreateSubcategory}
            className="gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> Add Subcategory
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenEditCategory}
            className="gap-1.5"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit Category
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsDeactivatingCategory(true)}
            className="gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" /> Deactivate
          </Button>
        </div>
      </PageHeader>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Category Classification</span>
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center border ${config.colorClass}`}
            >
              <IconComponent className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant={config.badgeVariant} className="text-xs uppercase font-semibold">
              {config.label}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {category.isActive ? "Active" : "Archived"}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            Created on {formatDate(category.createdAt, "dd MMM yyyy")}
          </p>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Configured Subcategories</span>
            <div className="h-8 w-8 rounded-full bg-secondary/30 text-secondary-foreground flex items-center justify-center">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-foreground">
              {subcategories.length}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Available subcategory classifications
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Recent Volume (20 Tx)</span>
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <IndianRupee className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-foreground">
              {formatCurrency(stats.totalFlow)}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Across {stats.transactionCount} transactions (Avg: {formatCurrency(stats.averageAmount)})
            </p>
          </div>
        </Card>
      </div>

      {/* Subcategories Management Card */}
      <Card className="border-border">
        <CardHeader className="py-4 px-5 border-b border-border bg-muted/20 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary" />
              Subcategories ({subcategories.length})
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Sub-labels linked to this category for specific spending tracking
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={handleOpenCreateSubcategory}
            className="gap-1.5 text-xs h-8"
          >
            <Plus className="h-3.5 w-3.5" /> Add Subcategory
          </Button>
        </CardHeader>

        <CardContent className="p-5">
          {subcategories.length === 0 ? (
            <EmptyState
              icon={Layers}
              title="No subcategories defined"
              description="Add subcategories to break down this category into fine-grained line items."
              action={
                <Button
                  size="sm"
                  onClick={handleOpenCreateSubcategory}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" /> Add First Subcategory
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {subcategories.map((sub) => (
                <div
                  key={sub.id}
                  className="p-3.5 rounded-xl border border-border bg-card/60 hover:bg-card hover:border-primary/40 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm text-foreground truncate">
                        {sub.name}
                      </h4>
                      {sub.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                          {sub.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(sub.createdAt, "dd MMM yyyy")}
                    </span>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEditSubcategory(sub)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                        title="Edit Subcategory"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeactivatingSubcategory(sub)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        title="Deactivate Subcategory"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Category Transactions */}
      <Card className="border-border overflow-hidden">
        <CardHeader className="py-4 px-5 border-b border-border bg-muted/20 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Receipt className="h-4 w-4 text-primary" />
              Recent Transactions in {category.name}
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Ledger transactions mapped under this category
            </CardDescription>
          </div>
          <Link href="/transactions/new">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
              <Plus className="h-3.5 w-3.5" /> Add Transaction
            </Button>
          </Link>
        </CardHeader>

        <CardContent className="p-0">
          {isLoadingTx ? (
            <div className="p-5 space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Receipt}
                title="No transactions recorded in this category"
                description="Transactions categorized under this category will show up in this ledger stream."
                action={
                  <Link href="/transactions/new">
                    <Button size="sm" className="gap-2">
                      <Plus className="h-4 w-4" /> Record Transaction
                    </Button>
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Subcategory</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => {
                    const isExpense = tx.transactionType === "EXPENSE";
                    const isIncome = tx.transactionType === "INCOME";

                    return (
                      <TableRow key={tx.id} className="hover:bg-muted/40 transition-colors">
                        <TableCell className="font-medium whitespace-nowrap text-xs text-muted-foreground">
                          {formatDate(tx.transactionDate, "dd MMM yyyy")}
                        </TableCell>
                        <TableCell className="font-semibold text-foreground text-sm">
                          {tx.description}
                        </TableCell>
                        <TableCell>
                          {tx.subcategory?.name ? (
                            <Badge variant="outline" className="text-[11px] font-normal">
                              {tx.subcategory.name}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {tx.account?.name || "Account"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">
                          {tx.paymentMethod || "UPI"}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap font-semibold">
                          <span
                            className={
                              isExpense
                                ? "text-rose-600 dark:text-rose-400"
                                : isIncome
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-foreground"
                            }
                          >
                            {isExpense ? "-" : isIncome ? "+" : ""}
                            {formatCurrency(tx.amount)}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Category Modal */}
      <Dialog open={isEditCategoryOpen} onOpenChange={setIsEditCategoryOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update name, classification type, or description.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={categoryForm.handleSubmit(onCategorySubmit)} className="space-y-4 py-2">
            <Input
              label="Category Name"
              error={categoryForm.formState.errors.name?.message}
              {...categoryForm.register("name")}
            />

            <Select
              label="Category Type"
              value={categoryForm.watch("categoryType")}
              onChange={(e) =>
                categoryForm.setValue(
                  "categoryType",
                  e.target.value as "EXPENSE" | "INCOME" | "SAVING" | "INVESTMENT"
                )
              }
              error={categoryForm.formState.errors.categoryType?.message}
              options={[
                { value: "EXPENSE", label: "Expense (Spending & Outflows)" },
                { value: "INCOME", label: "Income (Earnings & Inflows)" },
                { value: "SAVING", label: "Savings (Emergency Fund, Liquid Reserves)" },
                { value: "INVESTMENT", label: "Investment (Stocks, MF, Real Estate)" },
              ]}
            />

            <Textarea
              label="Description (Optional)"
              rows={3}
              error={categoryForm.formState.errors.description?.message}
              {...categoryForm.register("description")}
            />

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditCategoryOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateCategoryMutation.isPending}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Subcategory Add/Edit Modal */}
      <Dialog
        open={subcategoryModalState.isOpen}
        onOpenChange={(open) =>
          !open && setSubcategoryModalState({ isOpen: false, mode: "create" })
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {subcategoryModalState.mode === "create"
                ? "Add Subcategory"
                : "Edit Subcategory"}
            </DialogTitle>
            <DialogDescription>
              Belongs to parent category: <strong>{category.name}</strong>
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={subcategoryForm.handleSubmit(onSubcategorySubmit)}
            className="space-y-4 py-2"
          >
            <Input
              label="Subcategory Name"
              placeholder="e.g. Groceries, Dine out, Fuel"
              error={subcategoryForm.formState.errors.name?.message}
              {...subcategoryForm.register("name")}
            />

            <Input
              label="Description (Optional)"
              placeholder="Subcategory context or notes"
              error={subcategoryForm.formState.errors.description?.message}
              {...subcategoryForm.register("description")}
            />

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setSubcategoryModalState({ isOpen: false, mode: "create" })
                }
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  createSubcategoryMutation.isPending ||
                  updateSubcategoryMutation.isPending
                }
              >
                {subcategoryModalState.mode === "create"
                  ? "Add Subcategory"
                  : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm Deactivate Category Dialog */}
      <Dialog
        open={isDeactivatingCategory}
        onOpenChange={setIsDeactivatingCategory}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive mb-1">
              <AlertTriangle className="h-5 w-5" />
              <DialogTitle className="text-destructive">Deactivate Category</DialogTitle>
            </div>
            <DialogDescription>
              Are you sure you want to deactivate{" "}
              <strong className="text-foreground">{category.name}</strong>?
              This will also deactivate all child subcategories.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeactivatingCategory(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDeactivateCategory}
              disabled={deactivateCategoryMutation.isPending}
            >
              Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Deactivate Subcategory Dialog */}
      <Dialog
        open={Boolean(deactivatingSubcategory)}
        onOpenChange={(open) => !open && setDeactivatingSubcategory(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive mb-1">
              <AlertTriangle className="h-5 w-5" />
              <DialogTitle className="text-destructive">Deactivate Subcategory</DialogTitle>
            </div>
            <DialogDescription>
              Are you sure you want to deactivate{" "}
              <strong className="text-foreground">
                {deactivatingSubcategory?.name}
              </strong>
              ?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeactivatingSubcategory(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDeactivateSubcategory}
              disabled={deactivateSubcategoryMutation.isPending}
            >
              Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
